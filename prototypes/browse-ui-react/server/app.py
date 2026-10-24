"""PROTOTYPE (throwaway) fake-data API for issue #7.

Generates Channels/Videos in memory and scores outliers per
docs/research/outlier-video-definition.md. No database: the frontend fetches /api/data once.
"""
import bisect
import math
import random
import statistics
from datetime import datetime, timezone

from fastapi import FastAPI

rng = random.Random(20261024)
DAY_MS = 86_400_000
TODAY_MS = int(datetime(2026, 10, 24, tzinfo=timezone.utc).timestamp() * 1000)

FILL = {
    "prod": ["RTX 5070", "RX 9070 XT", "M5 MacBook Air", "Steam Deck 2", "Pixel 11", "Galaxy S26", "Framework 16", "Raspberry Pi 6", "ThinkPad X1", "Ryzen 7 9800X3D"],
    "n": ["3", "5", "7", "10", "12", "15", "20", "50"],
    "price": ["$300", "$500", "$700", "$1000", "$1500"],
    "yr": ["2025", "2026"],
    "os": ["Arch", "Fedora", "Ubuntu", "Mint", "NixOS", "Pop!_OS"],
    "old": ["Amiga 500", "Commodore 64", "IBM 5150", "Game Boy", "iMac G3", "ThinkPad T60"],
}
TOPICS = [
    ("GPU reviews", 0.0, ["{prod} review: is it worth it?", "{prod} vs {prod}: which should you buy", "I tested the {prod} in {n} games", "The {prod} nobody is talking about"]),
    ("Budget PC builds", 0.6, ["I built a {price} gaming PC", "The best {price} PC build in {yr}", "{price} PC vs PS5 Pro", "Building a {price} PC from Marketplace parts"]),
    ("Laptop buying guides", 0.1, ["Best laptops for students {yr}", "Don't buy the {prod} until you watch this", "{n} laptops I would actually buy", "Which {prod} should you get?"]),
    ("Mechanical keyboards", -0.2, ["{n} keyboards under $100", "I built my dream keyboard", "Lubing switches: worth it?", "The quietest keyboard I own"]),
    ("Home lab & servers", 0.35, ["My {yr} home lab tour", "I turned an old PC into a NAS", "Self-hosting {n} apps on a {prod}", "Why everyone needs a home server"]),
    ("Smartphone comparisons", 0.05, ["{prod} vs {prod} camera test", "{prod} after {n} months", "The phone I regret buying", "Is the {prod} actually better?"]),
    ("Retro computing", 0.45, ["Restoring a {old}", "I found a {old} in the trash", "Can a {old} run in {yr}?", "What is inside a {old}?"]),
    ("Linux desktop", 0.25, ["I used {os} for {n} days", "{os} vs {os} in {yr}", "Why I left Windows for {os}", "{n} things {os} does better"]),
    ("Desk setups", -0.1, ["My {yr} desk setup", "{n} desk upgrades under $50", "Minimal desk setup tour", "Fixing my messy desk"]),
    ("Tech news recaps", -0.45, ["Tech news: {prod} leaks", "This week in tech #{n}", "The {prod} launch went badly", "{n} stories you missed this week"]),
    ("Repair & teardown", 0.3, ["{prod} teardown: can you fix it?", "Fixing a broken {prod}", "I repaired {n} dead consoles", "Why the {prod} is impossible to repair"]),
    ("AI tools", 0.4, ["I let AI build my PC", "{n} AI tools I actually use", "Running a local LLM on a {prod}", "Is AI coming for tech YouTube?"]),
    ("Monitor reviews", -0.15, ["Best monitors under {price}", "OLED burn-in after {n} months", "{n} monitors compared", "The monitor I recommend most"]),
]
CH_NAMES = ["Byte Bench", "Circuit Sunday", "Lowpoly Labs", "Kernel Panic TV", "Desk Theory", "Solder & Spite", "Frame Budget", "Patch Notes Daily",
            "Retro Relay", "Silicon Shed", "Homelab Hours", "Pocket Teardown", "Clockspeed", "Tiny Server Club", "Pixel Pushers", "The Benchmark Room",
            "Open Source Odd", "Wattage", "Keycap Garden", "Dual Boot Diaries"]


def fill(t):
    out = t
    while "{" in out:
        s, e = out.index("{"), out.index("}")
        out = out[:s] + rng.choice(FILL[out[s + 1:e]]) + out[e + 1:]
    return out


def sig3(x):
    p = 10 ** (math.floor(math.log10(x)) - 2)
    return int(round(x / p) * p)


def build():
    # Fake 2D "embedding map" positions: one centre per Topic, Videos scattered around it.
    centres = [(rng.uniform(-10, 10), rng.uniform(-10, 10)) for _ in TOPICS]
    topics = [{"id": i, "name": n, "cx": centres[i][0], "cy": centres[i][1]} for i, (n, _, _) in enumerate(TOPICS)]
    channels, videos = [], []
    for ci, name in enumerate(CH_NAMES):
        subs = sig3(10 ** (3.8 + rng.random() * 2.6))
        base = math.log(subs * (0.03 + rng.random() * 0.35))
        sigma = 0.45 + rng.random() * 0.45
        drift = rng.gauss(0, 0.15)
        shorts = 0 if rng.random() < 0.3 else rng.random() * 0.45
        span = 300 + rng.random() * 1900
        tps = rng.sample(range(len(TOPICS)), 4 + rng.randrange(4))
        channels.append({"id": ci, "name": name, "subs": subs, "topics": tps})
        for _ in range(80 + rng.randrange(420)):
            age = max(1, int(rng.random() ** 1.3 * span))
            short = rng.random() < shorts
            dur = (15 + rng.randrange(45) if rng.random() < 0.8 else 61 + rng.randrange(119)) if short else 300 + rng.randrange(2400)
            topic = rng.choice(tps)
            lv = base - drift * age / 365 + TOPICS[topic][1] + (0.7 if short else 0) + rng.gauss(0, sigma + (0.2 if short else 0))
            if rng.random() < 0.025:
                lv += 1.0 + rng.random() * 1.6  # viral hit
            views = math.exp(lv)
            if age < 30:
                views *= 0.3 + 0.7 * math.sqrt(age / 30)  # still accumulating
            cx, cy = centres[topic]
            spread = 1.0 + rng.random() * 0.8
            videos.append({
                "id": len(videos), "ch": ci, "topic": topic, "title": fill(rng.choice(TOPICS[topic][2])) + (" #shorts" if short else ""),
                "age": age, "t": TODAY_MS - age * DAY_MS, "dur": dur, "fmt": "short" if dur <= 60 else "mid" if dur <= 180 else "long",
                "views": max(40, round(views)), "mx": cx + rng.gauss(0, spread), "my": cy + rng.gauss(0, spread),
            })
    score(channels, videos)
    return {"channels": channels, "topics": topics, "videos": videos, "syncedAt": "2026-10-23"}


def score(channels, videos):
    """Outlier score: views / median of up to 15 nearest-in-time, same-format, >=30-day-old Videos of the same Channel."""
    for ch in channels:
        for fmt in ("short", "mid", "long"):
            vids = sorted((v for v in videos if v["ch"] == ch["id"] and v["fmt"] == fmt), key=lambda v: v["t"])
            pool = [v for v in vids if v["age"] >= 30]
            pool_t = [v["t"] for v in pool]
            p90 = sorted(v["views"] for v in pool)[int(len(pool) * 0.9)] if len(pool) >= 20 else math.inf
            for v in vids:
                r = bisect.bisect_left(pool_t, v["t"])
                l, nb = r - 1, []
                while len(nb) < 15 and (l >= 0 or r < len(pool)):
                    take_l = r >= len(pool) or (l >= 0 and v["t"] - pool[l]["t"] <= pool[r]["t"] - v["t"])
                    c = pool[l] if take_l else pool[r]
                    if take_l:
                        l -= 1
                    else:
                        r += 1
                    if c is not v:
                        nb.append(c)
                v["n"] = len(nb)
                v["nbrs"] = [x["id"] for x in nb]
                v["base"] = max(1000, statistics.median(x["views"] for x in nb) if nb else 0)
                v["score"] = v["views"] / v["base"] if v["n"] >= 5 else None
                v["top10"] = v["score"] is not None and v["views"] >= p90
                v["outlier"] = v["score"] is not None and (v["score"] >= 3 or v["top10"])
                v["fluke"] = v["score"] is not None and (v["score"] >= 20 or (v["score"] >= 3 and v["n"] < 10))
        mine = [v for v in videos if v["ch"] == ch["id"] and v["score"] is not None]
        ch["count"] = sum(1 for v in videos if v["ch"] == ch["id"])
        ch["outliers"] = sum(1 for v in mine if v["outlier"])
        ch["rate"] = ch["outliers"] / len(mine) if mine else 0
        long_mature = [v["views"] for v in videos if v["ch"] == ch["id"] and v["fmt"] == "long" and v["age"] >= 30]
        ch["medianLong"] = statistics.median(long_mature) if long_mature else 0


DATA = build()
app = FastAPI(title="YT-StrategizeR browse UI prototype")


@app.get("/api/data")
def data():
    return DATA
