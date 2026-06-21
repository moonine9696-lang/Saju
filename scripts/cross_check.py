# -*- coding: utf-8 -*-
"""PDF 엔진(manse_v2.py) ↔ 사이트 엔진 교차 검증용 — 동일 케이스의 8글자 출력
사용: python scripts/cross_check.py
사이트 쪽은: npx tsx scripts/cross-check.ts  (출력 형식 동일, diff로 비교 가능)
"""
import sys
import os
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from manse_v2 import calculate_saju

# (이름, 년, 월, 일, 시, 분, 성별, 지역)
CASES = [
    ("송수빈", 1997, 9, 29, 17, 3, "F", "부산"),
    ("문인구", 1996, 6, 26, 23, 38, "M", "부산"),
    ("경계직전(신시)", 1997, 9, 29, 17, 13, "F", "부산"),
    ("경계직후(유시)", 1997, 9, 29, 17, 15, "F", "부산"),
    ("자정역행(일주변경)", 2000, 1, 1, 0, 10, "M", "서울"),
    ("지역모름", 1996, 6, 26, 23, 38, "M", "모름"),
]


def ganji(p):
    return p["tiangan"].split("(")[0] + p["dizhi"].split("(")[0]


for (name, y, mo, d, h, mi, g, region) in CASES:
    r = calculate_saju(name=name, gender=g, year=y, month=mo, day=d,
                       hour=h, minute=mi, calendar="solar", city=region)
    by_name = {p["name"]: p for p in r["pillars"]}
    eight = " ".join(ganji(by_name[k]) for k in ("년주", "월주", "일주", "시주"))
    print(f"{name}|{eight}|{r['true_solar_time']}")
