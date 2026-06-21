import type { Pillar, SajuResult } from "@/lib/saju";
import type { Element } from "@/lib/saju";

const ELEMENT_TEXT: Record<Element, string> = {
  목: "text-el-wood",
  화: "text-el-fire",
  토: "text-el-earth",
  금: "text-el-metal",
  수: "text-el-water",
};

function CharCell({
  hanja,
  name,
  element,
  yinYang,
  tenGod,
}: {
  hanja: string;
  name: string;
  element: Element;
  yinYang: string;
  tenGod: string;
}) {
  return (
    <div className="rounded-lg border border-night-600/70 bg-night-700/50 px-1 py-2.5 text-center">
      <div className={`font-(family-name:--font-serif-kr) text-2xl sm:text-3xl font-bold ${ELEMENT_TEXT[element]}`}>
        {hanja}
      </div>
      <div className="mt-1 text-[11px] leading-tight text-paper-400">
        {name} · {yinYang}
        {element}
      </div>
      <div className="mt-0.5 text-[11px] font-medium text-gold-300">{tenGod}</div>
    </div>
  );
}

function EmptyCell() {
  return (
    <div className="rounded-lg border border-dashed border-night-600/70 px-1 py-2.5 text-center">
      <div className="text-2xl sm:text-3xl text-night-500">─</div>
      <div className="mt-1 text-[11px] text-night-500">시각 미상</div>
      <div className="mt-0.5 text-[11px] text-night-500">&nbsp;</div>
    </div>
  );
}

function PillarColumn({ label, pillar }: { label: string; pillar: Pillar | null }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-center text-xs font-medium text-paper-500">{label}</div>
      {pillar ? (
        <>
          <CharCell
            hanja={pillar.stem.hanja}
            name={pillar.stem.name}
            element={pillar.stem.element}
            yinYang={pillar.stem.yinYang}
            tenGod={pillar.stem.tenGod}
          />
          <CharCell
            hanja={pillar.branch.hanja}
            name={pillar.branch.name}
            element={pillar.branch.element}
            yinYang={pillar.branch.yinYang}
            tenGod={pillar.branch.tenGod}
          />
        </>
      ) : (
        <>
          <EmptyCell />
          <EmptyCell />
        </>
      )}
    </div>
  );
}

export default function PillarTable({ result }: { result: SajuResult }) {
  return (
    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
      <PillarColumn label="시주" pillar={result.pillars.hour} />
      <PillarColumn label="일주" pillar={result.pillars.day} />
      <PillarColumn label="월주" pillar={result.pillars.month} />
      <PillarColumn label="연주" pillar={result.pillars.year} />
    </div>
  );
}
