/**
 * 해석 데이터베이스 빈 틀 생성 스크립트
 *
 * 60갑자 일주 풀이 JSON의 뼈대를 만든다.
 * 이미 파일이 있으면 채워진 텍스트는 그대로 보존하고 빠진 항목만 추가한다.
 * (텍스트를 채운 뒤 다시 실행해도 안전함)
 *
 * 실행: npx tsx scripts/generate-interpretation-skeleton.ts
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { STEMS, STEMS_HANJA, BRANCHES, BRANCHES_HANJA } from "../src/lib/saju/constants";

interface DayPillarEntry {
  id: string;
  ganji: string;
  hanja: string;
  core: string; // 성격 핵심 (2~3문장)
  strengths: string; // 강점 (2~3문장)
  cautions: string; // 주의점 (2~3문장)
}

const outPath = path.join(
  __dirname, "..", "src", "lib", "saju", "interpretation", "data", "day-pillars.json"
);

let existing: Record<string, DayPillarEntry> = {};
if (fs.existsSync(outPath)) {
  existing = JSON.parse(fs.readFileSync(outPath, "utf8"));
}

const result: Record<string, DayPillarEntry> = {};
for (let i = 0; i < 60; i++) {
  const ganji = STEMS[i % 10] + BRANCHES[i % 12];
  const hanja = STEMS_HANJA[i % 10] + BRANCHES_HANJA[i % 12];
  result[ganji] = existing[ganji] ?? {
    id: `dp-${ganji}`,
    ganji,
    hanja,
    core: "",
    strengths: "",
    cautions: "",
  };
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");

const filled = Object.values(result).filter((e) => e.core.trim() !== "").length;
console.log(`생성 완료: 60갑자 일주 틀 → ${outPath}`);
console.log(`내용이 채워진 항목: ${filled}/60`);
