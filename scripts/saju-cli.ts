/**
 * 터미널에서 만세력 엔진을 바로 확인하는 명령
 *
 * 사용법:
 *   npm run saju -- 1990-05-15 14:30 남자            (지역 생략 시 서울)
 *   npm run saju -- 1997-09-29 17:03 여자 부산
 *   npm run saju -- 1990-05-15 모름 여자
 *   npm run saju -- --lunar 1990-01-01 10:00 남자
 *   npm run saju -- --lunar --leap 2020-04-01 12:00 여자
 */
import { calculateSaju, REGION_KEYS, DEFAULT_REGION } from "../src/lib/saju";
import type { SajuInput, Pillar, RegionKey } from "../src/lib/saju";

const args = process.argv.slice(2);
const isLunar = args.includes("--lunar");
const isLeap = args.includes("--leap");
const rest = args.filter((a) => !a.startsWith("--"));

const [dateArg, timeArg, genderArg, regionArg] = rest;

function fail(msg: string): never {
  console.error(`오류: ${msg}`);
  console.error("\n사용법: npm run saju -- <YYYY-MM-DD> <HH:MM|모름> <male|female> [--lunar] [--leap]");
  process.exit(1);
}

if (!dateArg) fail("생년월일을 입력해 주세요.");
const dateMatch = dateArg.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
if (!dateMatch) fail(`날짜 형식이 올바르지 않습니다: ${dateArg} (예: 1990-05-15)`);

const gender = ["female", "여", "여자"].includes(genderArg)
  ? "female"
  : ["male", "남", "남자"].includes(genderArg)
    ? "male"
    : null;
if (!gender) fail(`성별을 남자/여자(또는 male/female)로 입력해 주세요: ${genderArg ?? "(없음)"}`);

let region: RegionKey = DEFAULT_REGION;
if (regionArg) {
  if (!REGION_KEYS.includes(regionArg as RegionKey)) {
    fail(`알 수 없는 지역입니다: ${regionArg} (가능: ${REGION_KEYS.join(", ")})`);
  }
  region = regionArg as RegionKey;
}

const input: SajuInput = {
  calendar: isLunar ? "lunar" : "solar",
  year: Number(dateMatch[1]),
  month: Number(dateMatch[2]),
  day: Number(dateMatch[3]),
  isLeapMonth: isLeap,
  gender,
  region,
};

if (!timeArg || timeArg === "모름") {
  input.timeUnknown = true;
} else {
  const timeMatch = timeArg.match(/^(\d{1,2}):(\d{1,2})$/);
  if (!timeMatch) fail(`시각 형식이 올바르지 않습니다: ${timeArg} (예: 14:30 또는 모름)`);
  input.hour = Number(timeMatch[1]);
  input.minute = Number(timeMatch[2]);
}

try {
  const r = calculateSaju(input);

  const cell = (p: Pillar | null, part: "stem" | "branch") =>
    p ? `${p[part].name}(${p[part].hanja})` : "  ?   ";
  const tenGod = (p: Pillar | null, part: "stem" | "branch") =>
    p ? p[part].tenGod : "-";

  console.log("");
  console.log("══════════════ 사주 명식 ══════════════");
  console.log(
    `양력 ${r.solarDate.year}-${String(r.solarDate.month).padStart(2, "0")}-${String(r.solarDate.day).padStart(2, "0")}` +
      (r.time ? ` ${String(r.time.hour).padStart(2, "0")}:${String(r.time.minute).padStart(2, "0")}` : " (시각 미상)") +
      ` / ${r.gender === "male" ? "남" : "여"} / ${region}` +
      (isLunar ? ` (음력${isLeap ? " 윤달" : ""} 입력)` : "")
  );
  if (r.correction) {
    const c = r.correction;
    const p = (v: number) => String(v).padStart(2, "0");
    const parts: string[] = [];
    if (c.dstAdjusted) parts.push("서머타임 -60분");
    if (c.standardOffsetMin === 510) parts.push("표준시 UTC+8:30 적용");
    if (c.longitudeCorrectionMin !== null) parts.push(`경도 ${c.longitudeCorrectionMin > 0 ? "+" : ""}${c.longitudeCorrectionMin}분`);
    if (c.equationOfTimeMin !== null) parts.push(`균시차 ${c.equationOfTimeMin > 0 ? "+" : ""}${c.equationOfTimeMin}분`);
    if (parts.length > 0) {
      console.log(
        `시각 보정: ${parts.join(", ")} → 보정 후 ` +
          `${c.corrected.year}-${p(c.corrected.month)}-${p(c.corrected.day)} ${p(c.corrected.hour)}:${p(c.corrected.minute)}`
      );
    }
  }
  console.log("");
  console.log("        시주     일주     월주     연주");
  console.log(`천간   ${cell(r.pillars.hour, "stem")}  ${cell(r.pillars.day, "stem")}  ${cell(r.pillars.month, "stem")}  ${cell(r.pillars.year, "stem")}`);
  console.log(`지지   ${cell(r.pillars.hour, "branch")}  ${cell(r.pillars.day, "branch")}  ${cell(r.pillars.month, "branch")}  ${cell(r.pillars.year, "branch")}`);
  console.log(`십성   ${tenGod(r.pillars.hour, "stem")}     ${tenGod(r.pillars.day, "stem")}     ${tenGod(r.pillars.month, "stem")}     ${tenGod(r.pillars.year, "stem")}`);
  console.log(`(지지) ${tenGod(r.pillars.hour, "branch")}     ${tenGod(r.pillars.day, "branch")}     ${tenGod(r.pillars.month, "branch")}     ${tenGod(r.pillars.year, "branch")}`);
  console.log("");
  console.log(`일간(나): ${r.pillars.day.stem.name}(${r.pillars.day.stem.hanja}) ${r.pillars.day.stem.yinYang}${r.pillars.day.stem.element}`);
  console.log(
    `오행 분포: ` +
      (Object.entries(r.elementCount) as [string, number][])
        .map(([el, n]) => `${el}${n}`)
        .join(" ") +
      ` (총 ${r.charCount}글자)`
  );
  console.log(
    `십성 분류: ` +
      (Object.entries(r.tenGodGroupCount) as [string, number][])
        .map(([g, n]) => `${g}${n}`)
        .join(" ") +
      ` → 최강: ${r.dominantTenGodGroup}`
  );
  console.log("═══════════════════════════════════════");
  console.log("");
} catch (e) {
  fail(e instanceof Error ? e.message : String(e));
}
