/**
 * URL 쿼리스트링 → SajuInput 파싱 (결과 페이지·등록 페이지 공용)
 * 입력폼(SajuForm)이 만드는 파라미터 형식과 1:1로 대응한다.
 *   cal=solar|lunar, y, m, d, g=male|female, r=지역, leap=1, tu=1, h, mi
 */
import { REGION_KEYS, type RegionKey } from "./regions";
import type { SajuInput, Gender } from "./types";

export type RawParams = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/** 파싱 실패 시 null 반환 (호출부에서 안내 화면으로 분기) */
export function parseSajuParams(params: RawParams): SajuInput | null {
  const cal = one(params.cal);
  const y = Number(one(params.y));
  const m = Number(one(params.m));
  const d = Number(one(params.d));
  const g = one(params.g);
  const r = one(params.r);

  if (cal !== "solar" && cal !== "lunar") return null;
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return null;
  if (g !== "male" && g !== "female") return null;

  const region: RegionKey = REGION_KEYS.includes(r as RegionKey) ? (r as RegionKey) : "서울";

  const input: SajuInput = {
    calendar: cal,
    year: y,
    month: m,
    day: d,
    gender: g as Gender,
    region,
  };

  if (cal === "lunar" && one(params.leap) === "1") input.isLeapMonth = true;

  if (one(params.tu) === "1") {
    input.timeUnknown = true;
  } else {
    const h = Number(one(params.h));
    const mi = Number(one(params.mi));
    if (!Number.isInteger(h) || !Number.isInteger(mi)) return null;
    input.hour = h;
    input.minute = mi;
  }

  return input;
}

/** SajuInput → 쿼리스트링 (등록 폼에서 결과로 되돌아갈 때 등 재사용) */
export function sajuParamsToQuery(input: SajuInput): URLSearchParams {
  const p = new URLSearchParams({
    cal: input.calendar,
    y: String(input.year),
    m: String(input.month),
    d: String(input.day),
    g: input.gender,
    r: input.region ?? "서울",
  });
  if (input.isLeapMonth) p.set("leap", "1");
  if (input.timeUnknown || input.hour === undefined) {
    p.set("tu", "1");
  } else {
    p.set("h", String(input.hour));
    p.set("mi", String(input.minute ?? 0));
  }
  return p;
}
