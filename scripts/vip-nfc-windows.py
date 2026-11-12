#!/usr/bin/env python3
# Pastera VIP NFC terminal for Windows 11, using the built-in Windows Smart Card API.
# No external Python packages required.
#
# Read only: py -3 scripts\\vip-nfc-windows.py --mode inspect
# POS:       py -3 scripts\\vip-nfc-windows.py --mode pos --url https://your-deployed-pastera-domain
#
# IMPORTANT: the card's UID is read, never reprogrammed. The NFC web URL must be
# written separately to a compatible NDEF card. The terminal secret is entered
# securely, is never sent to the browser, and the API must use HTTPS.

import argparse
import ctypes
from ctypes import wintypes
from getpass import getpass
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import threading
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
import webbrowser

if sys.platform != "win32":
    sys.exit("This script runs on Windows 10/11 only.")

winscard = ctypes.WinDLL("winscard.dll")
DWORD = wintypes.DWORD
HANDLE = ctypes.c_size_t

class SCARD_IO_REQUEST(ctypes.Structure):
    _fields_ = [("dwProtocol", DWORD), ("cbPciLength", DWORD)]

winscard.SCardEstablishContext.argtypes = [DWORD, ctypes.c_void_p, ctypes.c_void_p, ctypes.POINTER(HANDLE)]
winscard.SCardEstablishContext.restype = wintypes.LONG
winscard.SCardListReadersA.argtypes = [HANDLE, ctypes.c_char_p, ctypes.c_void_p, ctypes.POINTER(DWORD)]
winscard.SCardListReadersA.restype = wintypes.LONG
winscard.SCardConnectA.argtypes = [HANDLE, ctypes.c_char_p, DWORD, DWORD, ctypes.POINTER(HANDLE), ctypes.POINTER(DWORD)]
winscard.SCardConnectA.restype = wintypes.LONG
winscard.SCardDisconnect.argtypes = [HANDLE, DWORD]
winscard.SCardDisconnect.restype = wintypes.LONG
winscard.SCardReleaseContext.argtypes = [HANDLE]
winscard.SCardReleaseContext.restype = wintypes.LONG
winscard.SCardTransmit.argtypes = [HANDLE, ctypes.POINTER(SCARD_IO_REQUEST), ctypes.c_void_p, DWORD,
                                     ctypes.c_void_p, ctypes.c_void_p, ctypes.POINTER(DWORD)]
winscard.SCardTransmit.restype = wintypes.LONG

def readers(ctx):
    needed = DWORD(0)
    rc = winscard.SCardListReadersA(ctx, None, None, ctypes.byref(needed))
    if rc or not needed.value:
        return []
    buf = ctypes.create_string_buffer(needed.value)
    rc = winscard.SCardListReadersA(ctx, None, buf, ctypes.byref(needed))
    if rc:
        return []
    return [s for s in buf.raw.split(b"\0") if s]

def card_uid(ctx, reader):
    card = HANDLE()
    protocol = DWORD(0)
    rc = winscard.SCardConnectA(ctx, reader, 2, 3, ctypes.byref(card), ctypes.byref(protocol))
    if rc:
        return None  # No card on the reader.
    try:
        command = bytes.fromhex("FFCA000000")
        sent = ctypes.create_string_buffer(command)
        received = ctypes.create_string_buffer(260)
        n = DWORD(260)
        pci = SCARD_IO_REQUEST(protocol.value, ctypes.sizeof(SCARD_IO_REQUEST))
        rc = winscard.SCardTransmit(card, ctypes.byref(pci), sent, len(command),
                                    None, received, ctypes.byref(n))
        payload = received.raw[:n.value]
        if rc or len(payload) < 6 or payload[-2:] != bytes.fromhex("9000"):
            return ("unsupported", None)
        uid = payload[:-2].hex().upper()
        return ("ok", uid) if 8 <= len(uid) <= 20 else ("unsupported", None)
    finally:
        winscard.SCardDisconnect(card, 0)

def stamp(url, secret, uid, event_id):
    req = urllib.request.Request(
        url.rstrip("/") + "/api/admin/vip/scan",
        data=json.dumps({"uid": uid, "eventId": event_id}).encode("utf-8"),
        method="POST",
        headers={"Content-Type": "application/json", "Authorization": "Bearer " + secret},
    )
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read().decode("utf-8"))

MONITOR_HTML = r"""<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pastera NFC · Windows Test</title>
<style>
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#0a100d;color:#f7f4eb;font-family:Segoe UI,Arial,sans-serif}
main{max-width:900px;margin:5vh auto;padding:26px}small{color:#d1ab62;letter-spacing:.25em;font-weight:bold}
h1{font-size:clamp(32px,5vw,54px);margin:12px 0 5px}p{color:#b8c5b9;line-height:1.5}.card{margin-top:26px;background:linear-gradient(145deg,#1a3325,#101510);border:1px solid #957b46;border-radius:28px;padding:40px;box-shadow:0 15px 60px #0006}
.num{font-size:clamp(58px,10vw,110px);font-weight:800;color:#e0bc75;margin:10px 0}.cells{display:grid;grid-template-columns:repeat(10,1fr);gap:8px;margin:25px 0}
.cells span{height:52px;border:1px solid #526457;border-radius:10px;display:grid;place-items:center;color:#b8c5b9}.cells span.on{background:#d7b46f;color:#101510;border-color:#d7b46f;font-weight:bold}
.reward{margin-top:26px;padding:22px;border:2px solid #d7b46f;border-radius:17px;background:#57472655;text-align:center}
.reward strong{font-size:clamp(24px,4vw,36px);color:#f5d691}.reward p{font-size:20px;color:white}.hidden{display:none}.muted{font-size:13px;color:#9eada1}
</style></head><body><main><small>PASTERA · NFC TEST</small><h1>VIP Club · Lesegerät</h1>
<p>Windows 11 Testmodus – hier werden keine Bestellungen gespeichert. Karte auflegen, entfernen und erneut auflegen.</p>
<section class="card" aria-live="polite"><small>KARTENERKENNUNG</small><div id="status" class="num">0 / 10</div><div class="cells" id="cells"></div>
<p id="message">Bereit für deine VIP-Karte.</p>
<div id="reward" class="reward hidden"><strong>Herzlichen Glückwunsch!</strong><p>Du hast eine Gratis-Pasta verdient!</p></div>
<p class="muted" id="uid">Noch keine Karte erkannt.</p><p class="muted" id="count">0 Test-Scans</p>
</section></main><script>
const cells=document.getElementById('cells'); let lastCount=-1;
async function update(){try{let r=await fetch('/state',{cache:'no-store'}),s=await r.json(),count=s.count||0;
let win=count>0&&count%10===0,progress=count%10;if(win)progress=10;
if(count!==lastCount){lastCount=count;document.getElementById('status').textContent=progress+' / 10';
cells.replaceChildren(...Array.from({length:10},(_,i)=>{let d=document.createElement('span');d.textContent=i<progress?'✓':i+1;if(i<progress)d.className='on';return d}));
document.getElementById('message').textContent=count?'Karte erkannt · +1 Test-Scan':'Bereit für deine VIP-Karte.';
document.getElementById('reward').classList.toggle('hidden',!win);
document.getElementById('uid').textContent=s.uid?'NFC UID: '+s.uid:'Noch keine Karte erkannt.';
document.getElementById('count').textContent=count+' Test-Scans (nicht gespeichert)';}}
catch(e){document.getElementById('message').textContent='Lokale Leser-Verbindung prüfen.';}}
update();setInterval(update,500);
</script></body></html>"""

def main():
    p = argparse.ArgumentParser(description="Pastera VIP Windows NFC cash register")
    p.add_argument("--mode", choices=["inspect", "browser-test", "pos"], default="inspect")
    p.add_argument("--port", type=int, default=8765, help="Local reader test tab port")
    p.add_argument("--url", default="")
    p.add_argument("--no-browser", action="store_true")
    args = p.parse_args()
    secret = ""
    if args.mode == "pos":
        url = urllib.parse.urlparse(args.url)
        if url.scheme != "https" or not url.netloc:
            sys.exit("For POS mode use an HTTPS Pastera web deployment URL.")
        secret = os.getenv("VIP_NFC_TERMINAL_SECRET", "") or getpass("POS terminal secret: ")
        if len(secret) < 24:
            sys.exit("POS terminal secret is missing or too short.")
    counter = {"count": 0, "uid": None, "seen": None}
    lock = threading.Lock()
    server = None
    if args.mode == "browser-test":
        class LocalHandler(BaseHTTPRequestHandler):
            def log_message(self, *_args):
                return
            def do_GET(self):
                if self.path == "/state":
                    with lock:
                        body = json.dumps(counter).encode("utf-8")
                    content_type = "application/json"
                elif self.path in ("/", "/index.html"):
                    body = MONITOR_HTML.encode("utf-8")
                    content_type = "text/html; charset=utf-8"
                else:
                    self.send_error(404)
                    return
                self.send_response(200)
                self.send_header("Content-Type", content_type)
                self.send_header("Cache-Control", "no-store")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
        server = ThreadingHTTPServer(("127.0.0.1", args.port), LocalHandler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
    ctx = HANDLE()
    rc = winscard.SCardEstablishContext(2, None, None, ctypes.byref(ctx))
    if rc:
        sys.exit("Windows Smart Card service not available: 0x%08X" % (rc & 0xFFFFFFFF))
    try:
        devices = readers(ctx)
        if not devices:
            sys.exit("No Windows PC/SC smart card reader found. Check USB and Device Manager.")
        print("Pastera VIP - Reader ready:", ", ".join(d.decode(errors="replace") for d in devices))
        print("Mode:", args.mode)
        print("Place a card, remove it and place it again to record a NEW scan.")
        if args.mode == "pos" and not args.no_browser:
            webbrowser.open(args.url.rstrip("/") + "/admin/vip/pos")
        if args.mode == "browser-test":
            local_url = "http://127.0.0.1:%d/" % args.port
            print("WINDOWS TEST TAB:", local_url, "(no database writes)", flush=True)
            if not args.no_browser:
                webbrowser.open(local_url)
        was_present = False
        absent_polls = 0
        while True:
            result = None
            for device in devices:
                result = card_uid(ctx, device)
                if result is not None:
                    break
            if result is None:
                absent_polls += 1
                if absent_polls >= 3:
                    was_present = False
            elif not was_present:
                was_present = True
                absent_polls = 0
                state, uid = result
                if state != "ok" or not uid:
                    print("Card detected but UID read is unsupported on this reader.", flush=True)
                elif args.mode == "inspect":
                    print("UID:", uid, "(read-only)", flush=True)
                elif args.mode == "browser-test":
                    with lock:
                        counter["count"] += 1
                        counter["uid"] = uid
                        counter["seen"] = time.time()
                        count = counter["count"]
                    print("WINDOWS TEST - UID:", uid, "SCAN:", count, "(not saved to Supabase)", flush=True)
                else:
                    event_id = str(uuid.uuid4())
                    for attempt in range(2):
                        try:
                            response = stamp(args.url, secret, uid, event_id)
                            if not response.get("ok"):
                                raise RuntimeError("Server did not confirm the scan.")
                            count = response.get("stamps", "?")
                            print("%s: +1 Bestellung | Gesamt: %s" % (response.get("card_number", "VIP"), count), flush=True)
                            if response.get("availableRewards", 0) > 0:
                                print("Herzlichen Glueckwunsch! Du hast eine Gratis-Pasta verdient!", flush=True)
                            break
                        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, RuntimeError) as exc:
                            if attempt == 0:
                                time.sleep(0.5)
                            else:
                                print("NOT CONFIRMED - no verified stamp:", str(exc), flush=True)
            else:
                absent_polls = 0
            time.sleep(0.35)
    except KeyboardInterrupt:
        print("\nReader stopped.")
    finally:
        if server:
            server.shutdown()
            server.server_close()
        winscard.SCardReleaseContext(ctx)

if __name__ == "__main__":
    main()
