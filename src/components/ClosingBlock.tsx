/**
 * 간단한 사주풀이를 마무리하고 정식 풀이로 이어주는 공통 블록.
 * 일주명이 들어가지 않은 고정 문구라 모든 일주(현재/추후 59개)에 공통으로 쓰인다.
 * 결과 페이지에서 CTA 카드 바로 위에 항상 렌더된다.
 */
const PARA = "text-sm leading-relaxed text-paper-200";

const BODY = [
  "지금 보신 건 사주 여덟 글자 중 큰 줄기만 짚은, 말 그대로 간단한 풀이입니다. 타고난 결과 강점, 조심할 자리, 재물의 방향까지 큰 윤곽을 그려봤어요.",
  "하지만 사람의 사주는 이보다 훨씬 입체적입니다. 같은 일주여도 나머지 글자들이 어떻게 어울리는지, 어느 시기에 어떤 운이 들어오고 나가는지, 일·재물·관계·건강이 각각 어떤 흐름을 타는지는 사람마다 전혀 다릅니다. 그 전부를 하나하나 짚어 들어가면, 지금 보신 것의 수십 배 깊이가 됩니다.",
  "정식 사주풀이는 약 100페이지에 걸쳐 당신의 사주를 그 깊이로 풀어냅니다. 타고난 본질부터 시기별 운의 흐름, 일과 재물, 사람과 인연까지 — 당신이라는 한 사람을 통째로 읽어드립니다.",
];

export default function ClosingBlock() {
  return (
    <section className="rounded-2xl border border-gold-500/40 bg-gradient-to-b from-gold-500/12 to-night-800/40 p-6">
      <h2 className="mb-3 font-(family-name:--font-serif-kr) text-lg font-bold text-gold-300">
        여기까지는 당신의 밑그림입니다
      </h2>
      {BODY.map((t, i) => (
        <p key={i} className={`${PARA}${i > 0 ? " mt-3" : ""}`}>
          {t}
        </p>
      ))}
    </section>
  );
}
