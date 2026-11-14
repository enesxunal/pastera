#!/usr/bin/env python3
"""Read-only loopback NFC bridge for an authenticated Pastera admin browser.

No database or network credentials are stored here. The browser uses its existing
admin session to submit scanned UIDs to the live server.
"""
import argparse
import ctypes
import importlib.util
import json
import os
import pathlib
import threading
import time
import uuid
from collections import deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlsplit

HERE = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('pastera_pcsc_reader', HERE / 'vip-nfc-reader.py')
reader = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reader)

ALLOWED_ORIGINS = {'https://www.pastera.de', 'https://pastera.de'}
PORT = 8767
lock = threading.Lock()
events = deque(maxlen=80)
sequence = 0
reader_names = []
reader_error = ''
boot_id = str(uuid.uuid4())
reader_states = {}
last_poll_at = 0.0
last_card_at = 0.0


def diagnostic_read(ctx, device):
    """Read UID while returning PC/SC details rather than silently hiding errors."""
    card = ctypes.c_void_p()
    protocol = reader.DWORD()
    rc = reader.PCSC.SCardConnect(ctx, device, 2, 3, ctypes.byref(card), ctypes.byref(protocol))
    if rc:
        code = rc & 0xffffffff
        return None, ('no_card' if code == 0x8010000C else 'pcsc_%08X' % code)
    try:
        request_data = bytes.fromhex('FFCA000000')
        request = ctypes.create_string_buffer(request_data)
        response = ctypes.create_string_buffer(260)
        length = reader.DWORD(260)
        pci = reader.PCI(protocol.value, ctypes.sizeof(reader.PCI))
        rc = reader.PCSC.SCardTransmit(card, ctypes.byref(pci), request,
                                       len(request_data), None, response, ctypes.byref(length))
        if rc:
            return ('unsupported', None), 'transmit_%08X' % (rc & 0xffffffff)
        raw = response.raw[:length.value]
        if len(raw) < 4 or raw[-2:] != b'\x90\x00':
            return ('unsupported', None), 'invalid_apdu_%s' % raw[-2:].hex().upper()
        uid = raw[:-2].hex().upper()
        if not 8 <= len(uid) <= 20:
            return ('unsupported', None), 'uid_length_invalid'
        return ('ok', uid), 'uid_ok'
    finally:
        reader.PCSC.SCardDisconnect(card, 0)


def listen_for_cards():
    global sequence, reader_error, reader_names, last_poll_at, last_card_at
    ctx = ctypes.c_void_p()
    rc = reader.PCSC.SCardEstablishContext(0, None, None, ctypes.byref(ctx))
    if rc:
        reader_error = 'PCSC initialization failed: %08X' % (rc & 0xffffffff)
        print(reader_error, flush=True)
        return
    names = sorted(reader.readers(ctx), key=lambda name: (not name.endswith(b' 01'), name))
    reader_names = [name.decode(errors='replace') for name in names]
    if not names:
        reader_error = 'Kein USB-NFC-Lesegerät erkannt. USB-Verbindung prüfen.'
        print(reader_error + ' Will retry automatically when plugged in.', flush=True)
        reader.PCSC.SCardReleaseContext(ctx)
        # launchd KeepAlive restarts this process after the reader has been
        # reconnected; no terminal command or browser refresh is required.
        time.sleep(5)
        os._exit(75)
    print('NFC reader ready:', ', '.join(reader_names), flush=True)
    active_card = False
    absent_polls = 0
    reader_armed = False  # A card already present at service startup must not get another stamp.
    unhealthy_polls = 0
    try:
        while True:
            outcome = None
            selected = None
            for name in names:
                found, state = diagnostic_read(ctx, name)
                decoded = name.decode(errors='replace')
                with lock:
                    previous = reader_states.get(decoded)
                    reader_states[decoded] = state
                    last_poll_at = time.time()
                if previous != state:
                    print('Reader state: %s -> %s' % (decoded, state), flush=True)
                if found is not None and found[0] == 'ok':
                    outcome, selected = found, name
                    break
                if found is not None and outcome is None:
                    outcome, selected = found, name
            # A reader name may remain registered after the physical USB device
            # disappears. Do not report that stale PC/SC reader as ready.
            healthy = any(state in ('no_card', 'uid_ok', 'invalid_apdu_6A81') for state in reader_states.values())
            if not healthy:
                unhealthy_polls += 1
                if unhealthy_polls >= 8:
                    print('PCSC readers are all unavailable; refreshing USB reader list.', flush=True)
                    os._exit(76)
            else:
                unhealthy_polls = 0
            if outcome is None:
                absent_polls += 1
                if absent_polls >= 3:
                    active_card = False
                    reader_armed = True
            else:
                absent_polls = 0
                if not active_card:
                    active_card = True
                    if not reader_armed:
                        print('Card present at startup; lift and replace to stamp.', flush=True)
                        continue
                    status, uid = outcome
                    if status != 'ok' or not uid:
                        print('Card present but UID unsupported.', flush=True)
                    else:
                        with lock:
                            sequence += 1
                            last_card_at = time.time()
                            event = {'seq': sequence, 'eventId': str(uuid.uuid4()), 'uid': uid}
                            events.append(event)
                        print('Card scanned on %s; event #%d' % (selected.decode(errors='replace'), sequence), flush=True)
            time.sleep(0.28)
    except Exception as exc:
        reader_error = str(exc)
        print('Reader error:', reader_error, flush=True)
    finally:
        reader.PCSC.SCardReleaseContext(ctx)


def watchdog():
    """Restart a wedged PC/SC daemon via launchd instead of reporting ready forever."""
    while True:
        time.sleep(3)
        with lock:
            last = last_poll_at
        if last and time.time() - last > 14:
            print('PCSC watchdog: reader poll stalled; restarting local service.', flush=True)
            os._exit(74)


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        return

    def allowed(self):
        origin = self.headers.get('Origin')
        host = self.headers.get('Host', '')
        return (origin is None or origin in ALLOWED_ORIGINS) and host in (
            '127.0.0.1:%d' % PORT, 'localhost:%d' % PORT
        )

    def send_json(self, status, data):
        payload = json.dumps(data).encode('utf-8')
        self.send_response(status)
        origin = self.headers.get('Origin')
        if origin in ALLOWED_ORIGINS:
            self.send_header('Access-Control-Allow-Origin', origin)
            self.send_header('Vary', 'Origin')
        self.send_header('Access-Control-Allow-Private-Network', 'true')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_OPTIONS(self):
        if not self.allowed():
            self.send_json(403, {'ok': False, 'error': 'origin_not_allowed'})
            return
        self.send_response(204)
        origin = self.headers.get('Origin')
        if origin:
            self.send_header('Access-Control-Allow-Origin', origin)
            self.send_header('Vary', 'Origin')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Allow-Private-Network', 'true')
        self.send_header('Access-Control-Max-Age', '120')
        self.end_headers()

    def do_GET(self):
        if not self.allowed():
            self.send_json(403, {'ok': False, 'error': 'origin_not_allowed'})
            return
        parts = urlsplit(self.path)
        with lock:
            seq = sequence
            copied_events = list(events)
        if parts.path == '/status':
            alive = (bool(last_poll_at) and time.time() - last_poll_at < 7
                     and any(state in ('no_card', 'uid_ok') for state in reader_states.values()))
            self.send_json(200, {'ok': not bool(reader_error) and alive, 'readers': reader_names,
                                 'sequence': seq, 'instanceId': boot_id, 'error': reader_error,
                                 'readerStates': dict(reader_states),
                                 'readerReady': alive, 'lastPollAt': last_poll_at,
                                 'lastCardAt': last_card_at})
        elif parts.path == '/events':
            try:
                since = max(0, int(parse_qs(parts.query).get('after', ['0'])[0]))
            except ValueError:
                self.send_json(400, {'ok': False, 'error': 'invalid_sequence'})
                return
            self.send_json(200, {'ok': True, 'sequence': seq, 'instanceId': boot_id,
                                 'readerAlive': (bool(last_poll_at) and time.time() - last_poll_at < 7
                                     and any(state in ('no_card', 'uid_ok') for state in reader_states.values())),
                                 'events': [e for e in copied_events if e['seq'] > since]})
        else:
            self.send_json(404, {'ok': False, 'error': 'not_found'})


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8767)
    args = parser.parse_args()
    global PORT
    PORT = args.port
    threading.Thread(target=listen_for_cards, name='nfc-pcsc', daemon=True).start()
    threading.Thread(target=watchdog, name='nfc-watchdog', daemon=True).start()
    server = ThreadingHTTPServer(('127.0.0.1', PORT), Handler)
    print('Pastera Mac NFC bridge listening at http://127.0.0.1:%d' % PORT, flush=True)
    print('Use https://www.pastera.de/admin/vip/pos with a signed-in admin session.', flush=True)
    try:
        server.serve_forever(poll_interval=0.25)
    except KeyboardInterrupt:
        print('NFC bridge stopped.', flush=True)
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
