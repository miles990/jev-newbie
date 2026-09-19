#!/usr/bin/env python3
"""Compare a recorded example output with a fresh one, tolerating small probability drift.

Structure (every label, word and line) must match exactly. Numbers may differ by at most
TOLERANCE (default 0.15: probabilities drift by a few hundredths between runs, score values on a 0..N scale by up to ~0.1). Reports the largest drift.
Exit 0 = same decisions, 1 = a label or line changed, 2 = usage.
"""
import re, sys
TOL = float(sys.argv[3]) if len(sys.argv) > 3 else 0.15
NUM = re.compile(r"-?\d+(?:\.\d+)?(%?)")
BAR = re.compile(r"[█·]+")
def shape(text):
    # Bars grow with probability and some outputs are sorted by probability, so neither is a "decision".
    # Normalize bars and numbers, group lines by their normalized shape, and compare each group's sorted
    # numbers with tolerance. Percentages are read as fractions so 92% vs 93% is a 0.01 drift.
    groups = {}
    for l in text.splitlines():
        l = re.sub(r"\d+ ms", "N ms", BAR.sub("BAR", l))
        key = NUM.sub("#", l)
        groups.setdefault(key, []).extend(float(m.group(0).rstrip("%")) / (100 if m.group(1) else 1) for m in NUM.finditer(l))
    return {k: sorted(v) for k, v in groups.items()}
if len(sys.argv) < 3:
    print(__doc__); sys.exit(2)
a, b = (open(p, encoding="utf-8").read() for p in sys.argv[1:3])
ga, gb = shape(a), shape(b)
if ga.keys() != gb.keys() or any(len(ga[k]) != len(gb[k]) for k in ga):
    import difflib
    print("\n".join(list(difflib.unified_diff(a.splitlines(), b.splitlines(), "recorded", "now", lineterm=""))[:40]))
    sys.exit(1)
drift = max((abs(x - y) for k in ga for x, y in zip(ga[k], gb[k])), default=0.0)
if drift > TOL:
    print(f"numbers drifted by {drift:.3f} (> {TOL}); same labels though"); sys.exit(1)
print(f"same decisions, max numeric drift {drift:.3f}")
