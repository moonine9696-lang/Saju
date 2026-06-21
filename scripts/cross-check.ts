/**
 * 사이트 엔진 ↔ PDF 엔진(manse_v2.py) 교차 검증용 — 동일 케이스의 8글자 출력
 * 사용: npx tsx scripts/cross-check.ts
 * 파이썬 쪽은: python scripts/cross_check.py (출력 형식 동일)
 */
import { calculateSaju } from "../src/lib/saju";
import type { RegionKey, Gender } from "../src/lib/saju";

const CASES: [string, number, number, number, number, number, Gender, RegionKey][] = [
  ["송수빈", 1997, 9, 29, 17, 3, "female", "부산"],
  ["문인구", 1996, 6, 26, 23, 38, "male", "부산"],
  ["경계직전(신시)", 1997, 9, 29, 17, 13, "female", "부산"],
  ["경계직후(유시)", 1997, 9, 29, 17, 15, "female", "부산"],
  ["자정역행(일주변경)", 2000, 1, 1, 0, 10, "male", "서울"],
  ["지역모름", 1996, 6, 26, 23, 38, "male", "모름"],
];

for (const [name, y, mo, d, h, mi, gender, region] of CASES) {
  const r = calculateSaju({
    calendar: "solar", year: y, month: mo, day: d, hour: h, minute: mi, gender, region,
  });
  const eight = [
    r.pillars.year.ganjiHanja,
    r.pillars.month.ganjiHanja,
    r.pillars.day.ganjiHanja,
    r.pillars.hour!.ganjiHanja,
  ].join(" ");
  const c = r.correction!.corrected;
  const p = (v: number) => String(v).padStart(2, "0");
  console.log(
    `${name}|${eight}|${c.year}-${p(c.month)}-${p(c.day)} ${p(c.hour)}:${p(c.minute)}`
  );
}
