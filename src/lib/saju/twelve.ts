/**
 * 12운성(十二運星)과 12신살(十二神煞) 계산.
 * - 12운성: 일간(천간) 기준으로 대상 지지의 기운 단계
 * - 12신살: 기준 지지(보통 년지)의 삼합국 기준으로 대상 지지의 신살
 * 모두 인덱스 기반 (천간 0~9, 지지 0~11: 자=0 .. 해=11)
 */

export type TwelveStage =
  | "장생" | "목욕" | "관대" | "건록" | "제왕" | "쇠"
  | "병" | "사" | "묘" | "절" | "태" | "양";

const STAGE_ORDER: readonly TwelveStage[] = [
  "장생", "목욕", "관대", "건록", "제왕", "쇠", "병", "사", "묘", "절", "태", "양",
];

// 천간별 장생(長生) 지지 인덱스 (갑=亥 .. 계=卯)
const JANGSAENG_BRANCH: readonly number[] = [
  11, // 갑 → 해
  6,  // 을 → 오
  2,  // 병 → 인
  9,  // 정 → 유
  2,  // 무 → 인
  9,  // 기 → 유
  5,  // 경 → 사
  0,  // 신 → 자
  8,  // 임 → 신
  3,  // 계 → 묘
];

/** 일간(천간 인덱스) 기준, 대상 지지의 12운성. 양간은 순행, 음간은 역행 */
export function twelveStageOf(dayStem: number, branch: number): TwelveStage {
  const start = JANGSAENG_BRANCH[dayStem];
  const forward = dayStem % 2 === 0; // 양간(갑병무경임) 순행
  const off = forward
    ? (branch - start + 12) % 12
    : (start - branch + 12) % 12;
  return STAGE_ORDER[off];
}

export type Sinsal =
  | "지살" | "년살" | "월살" | "망신살" | "장성살" | "반안살"
  | "역마살" | "육해살" | "화개살" | "겁살" | "재살" | "천살";

// 삼합국 생지(生地)에서 순행하며 배치되는 신살 순서
const SINSAL_ORDER: readonly Sinsal[] = [
  "지살", "년살", "월살", "망신살", "장성살", "반안살",
  "역마살", "육해살", "화개살", "겁살", "재살", "천살",
];

// 각 지지가 속한 삼합국의 생지(生地) 인덱스
//  申子辰→申(8), 寅午戌→寅(2), 巳酉丑→巳(5), 亥卯未→亥(11)
const SAENGJI_OF_BRANCH: readonly number[] = (() => {
  const m = new Array<number>(12);
  const groups: [number, number[]][] = [
    [8, [8, 0, 4]],   // 신자진 (수국)
    [2, [2, 6, 10]],  // 인오술 (화국)
    [5, [5, 9, 1]],   // 사유축 (금국)
    [11, [11, 3, 7]], // 해묘미 (목국)
  ];
  for (const [saeng, members] of groups) for (const b of members) m[b] = saeng;
  return m;
})();

/** 기준 지지(년지 또는 일지)의 삼합국 기준, 대상 지지의 12신살 */
export function sinsalOf(referenceBranch: number, targetBranch: number): Sinsal {
  const saeng = SAENGJI_OF_BRANCH[referenceBranch];
  const off = (targetBranch - saeng + 12) % 12;
  return SINSAL_ORDER[off];
}
