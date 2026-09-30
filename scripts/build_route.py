#!/usr/bin/env python3
"""Erzeugt assets/route.js aus dem GPX-Track in data/.

Aufruf: python3 scripts/build_route.py
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
gpx = next((ROOT / "data").glob("*.gpx")).read_text(encoding="utf-8")

points = [
    [round(float(lat), 5), round(float(lon), 5)]
    for lat, lon in re.findall(r'<trkpt lat="([\d.]+)" lon="([\d.]+)"', gpx)
]

out = ROOT / "assets" / "route.js"
out.write_text(
    "// Generiert von scripts/build_route.py aus dem offiziellen GPX-Track (50 km).\n"
    f"window.ROUTE = {json.dumps(points, separators=(',', ':'))};\n",
    encoding="utf-8",
)
print(f"{len(points)} Punkte -> {out.relative_to(ROOT)}")
