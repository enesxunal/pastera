#!/usr/bin/env python3
"""Read-only loopback NFC bridge for an authenticated Pastera admin browser.

No database or network credentials are stored here. The browser uses its existing
admin session to submit scanned UIDs to the live server.
"""
import argparse
import ctypes
import importlib.util
import json
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


def listen_for_cards():
    global sequence, reader_error, reader_names
    ctx = ctypes.c_void_p()
    rc = reader.PCSC.SCardEstablishContext(0, None, None, ctypes.byref(ctx))
    if rc:
        reader_error = 'PCSC initialization failed: %08X' % (rc & 0xffffffff)
        print(reader_error, flush=True)
        return
    names = reader.readers(ctx)
    reader_names = [name.decode(errors='replace') for name in names]
    if not names:
        reader_error = 'No PC/SC NFC reader found.'
        print(reader_error, flush=True)
        return
    print('NFC reader ready:', ', '.join(reader_names), flush=True)
    active_card = False
    absent_polls = 0
    try:
        while True:
            outcome = None
            selected = None
            for name in names:
                found = reader.read_card(ctx, name)
                if found is not None:
                    outcome, selected = found, name
                    break
            if outcome is None:
                absent_polls += 1
                if absent_polls >= 3:
                    active_card = False
            else:
                absent_polls = 0
                if not active_card:
                    active_card = True
                    status, uid = outcome
                    if status != 'ok' or not uid:
                        print('Card present but UID unsupported.', flush=True)
                    else:
                        with lock:
                            sequence += 1
                            event = {'seq': sequence, 'eventId': str(uuid.uuid4()), 'uid': uid}
                            events.append(event)
                        print('Card scanned on %s; event #%d' % (selected.decode(errors='replace'), sequence), flush=True)
            time.sleep(0.28)
    except Exception as exc:
        reader_error = str(exc)
        print('Reader error:', reader_error, flush=True)
    finally:
        reader.PCSC.SCardReleaseContext(ctx)


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
            self.send_json(200, {'ok': not bool(reader_error), 'readers': reader_names,
                                 'sequence': seq, 'error': reader_error})
        elif parts.path == '/events':
            try:
                since = max(0, int(parse_qs(parts.query).get('after', ['0'])[0]))
            except ValueError:
                self.send_json(400, {'ok': False, 'error': 'invalid_sequence'})
                return
            self.send_json(200, {'ok': True, 'sequence': seq,
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
