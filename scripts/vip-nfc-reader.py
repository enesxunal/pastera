#!/usr/bin/env python3
"""Pastera VIP PC/SC NFC reader (macOS). Read-only inspection or server-authorized POS scans.

Inspect: python3 scripts/vip-nfc-reader.py --mode inspect
POS:     VIP_NFC_TERMINAL_SECRET=... python3 scripts/vip-nfc-reader.py --mode pos --url https://www.pastera.de

A card contributes ONE stamp each time it is physically placed and detected.
Removing the card and placing it again creates a new transaction. A held card never repeats.
No card contents are changed.
"""
import argparse
import ctypes
import json
import os
import sys
import time
import urllib.request
import uuid
from urllib.error import HTTPError, URLError

DWORD = ctypes.c_uint32
PCSC = ctypes.CDLL('/System/Library/Frameworks/PCSC.framework/PCSC')
PCSC.SCardEstablishContext.argtypes = [DWORD, ctypes.c_void_p, ctypes.c_void_p, ctypes.POINTER(ctypes.c_void_p)]
PCSC.SCardListReaders.argtypes = [ctypes.c_void_p, ctypes.c_char_p, ctypes.c_void_p, ctypes.POINTER(DWORD)]
PCSC.SCardConnect.argtypes = [ctypes.c_void_p, ctypes.c_char_p, DWORD, DWORD, ctypes.POINTER(ctypes.c_void_p), ctypes.POINTER(DWORD)]
PCSC.SCardTransmit.argtypes = [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p, DWORD, ctypes.c_void_p, ctypes.c_void_p, ctypes.POINTER(DWORD)]
PCSC.SCardDisconnect.argtypes = [ctypes.c_void_p, DWORD]

class PCI(ctypes.Structure):
    _fields_ = [('dwProtocol', DWORD), ('cbPciLength', DWORD)]

def readers(ctx):
    count = DWORD(0)
    rc = PCSC.SCardListReaders(ctx, None, None, ctypes.byref(count))
    if rc or count.value == 0: return []
    buf = ctypes.create_string_buffer(count.value)
    rc = PCSC.SCardListReaders(ctx, None, buf, ctypes.byref(count))
    if rc: return []
    return [name for name in buf.raw.split(b'\0') if name]

def read_card(ctx, reader):
    card = ctypes.c_void_p()
    protocol = DWORD()
    rc = PCSC.SCardConnect(ctx, reader, 2, 3, ctypes.byref(card), ctypes.byref(protocol))
    if rc: return None
    try:
        apdu = bytes.fromhex('FFCA000000')
        request = ctypes.create_string_buffer(apdu)
        response = ctypes.create_string_buffer(260)
        size = DWORD(260)
        pci = PCI(protocol.value, ctypes.sizeof(PCI))
        rc = PCSC.SCardTransmit(card, ctypes.byref(pci), request, len(apdu), None, response, ctypes.byref(size))
        raw = response.raw[:size.value]
        if rc or len(raw) < 4 or raw[-2:] != b'\x90\x00':
            return ('unsupported', None)
        uid = raw[:-2].hex().upper()
        return ('ok', uid) if 8 <= len(uid) <= 20 else ('unsupported', None)
    finally:
        PCSC.SCardDisconnect(card, 0)

def post_scan(base_url, secret, uid, event_id):
    payload = json.dumps({'uid': uid, 'eventId': event_id}).encode()
    url = base_url.rstrip('/') + '/api/admin/vip/scan'
    req = urllib.request.Request(url, data=payload, method='POST', headers={
        'Content-Type': 'application/json', 'Authorization': 'Bearer ' + secret})
    with urllib.request.urlopen(req, timeout=12) as reply:
        return json.loads(reply.read())

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--mode', choices=['inspect', 'pos'], default='inspect')
    parser.add_argument('--url', default='http://localhost:3000')
    args = parser.parse_args()
    secret = os.environ.get('VIP_NFC_TERMINAL_SECRET', '')
    if args.mode == 'pos' and len(secret) < 24:
        sys.exit('VIP_NFC_TERMINAL_SECRET must be set to the same strong secret as the server.')
    ctx = ctypes.c_void_p()
    rc = PCSC.SCardEstablishContext(0, None, None, ctypes.byref(ctx))
    if rc: sys.exit(f'PC/SC initialization failed: {rc:#x}')
    devs = readers(ctx)
    if not devs: sys.exit('No compatible PC/SC readers detected.')
    print('Reader ready:', ', '.join(x.decode(errors='replace') for x in devs), flush=True)
    print('Mode:', args.mode, '| remove and replace card to count a new scan', flush=True)
    currently_present = False
    absent_polls = 0
    try:
        while True:
            result = None
            for device in devs:
                result = read_card(ctx, device)
                if result: break
            if result is None:
                absent_polls += 1
                if absent_polls >= 3: currently_present = False
            else:
                absent_polls = 0
                if not currently_present:
                    currently_present = True
                    status, uid = result
                    if status != 'ok' or not uid:
                        print('Card detected, but UID cannot be read on this reader', flush=True)
                    elif args.mode == 'inspect':
                        print('NFC UID:', uid, flush=True)
                    else:
                        event_id = str(uuid.uuid4())
                        for attempt in range(2):
                            try:
                                data = post_scan(args.url, secret, uid, event_id)
                                print(f"{data.get('card_number','CARD')}: +1 | Total: {data.get('stamps','?')} | Reward available: {data.get('availableRewards','?')}", flush=True)
                                break
                            except (HTTPError, URLError, TimeoutError) as error:
                                if attempt == 0: time.sleep(0.5)
                                else: print('Scan NOT confirmed by server:', error, flush=True)
            time.sleep(0.3)
    except KeyboardInterrupt:
        print('\nReader stopped.', flush=True)
    finally:
        PCSC.SCardReleaseContext(ctx)

if __name__ == '__main__': main()
