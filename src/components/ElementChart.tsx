import type { SajuResult, Element } from "@/lib/saju";

const ELEMENT_BAR: Record<Element, string> = {
  목: "bg-el-wood",
  화: "bg-el-fire",
  토: "bg-el-earth",
  금: "bg-el-metal",
  수: "bg-el-water",
};

const ELEMENT_HANJA: Record<Element, string> = {
  목: "木",
  화: "火",
  토: "土",
  금: "金",
  수: "水",
};

const ORDER: Element[] = ["목", "화", "토", "금", "수"];

export default function ElementChart({ result }: { result: SajuResult }) {
  const total = result.charCount;
  return (
    <div className="space-y-2">
      {ORDER.map((el) => {
        const count = result.elementCount[el];
        const pct = Math.round((count / total) * 100);
        return (
          <div key={el} className="flex items-center gap-3 text-sm">
            <span className="w-12 shrink-0 text-paper-400">
              {ELEMENT_HANJA[el]} {el}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-night-700">
              <div
                className={`h-full rounded-full ${ELEMENT_BAR[el]}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-paper-400">{count}개</span>
          </div>
        );
      })}
      <p className="pt-1 text-xs text-paper-500">
        여덟 글자{result.charCount === 6 ? " 중 시주를 제외한 여섯 글자" : ""} 기준 오행 분포입니다.
      </p>
    </div>
  );
}
