import { assembleReading } from "@/lib/saju/interpretation";
import type { SajuResult } from "@/lib/saju";

export default function ReadingSections({ result }: { result: SajuResult }) {
  const sections = assembleReading(result);

  if (sections.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-paper-500">
        간단한 사주풀이 텍스트를 준비하고 있습니다. 조금만 기다려 주세요.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {sections.map((s) => (
        <section key={s.id}>
          <h3 className="mb-2 font-(family-name:--font-serif-kr) text-base font-semibold text-gold-300">
            {s.title}
          </h3>
          {s.text.split("\n\n").map((para, i) => (
            <p key={i} className="mb-2 text-sm leading-relaxed text-paper-200 last:mb-0">
              {para}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
