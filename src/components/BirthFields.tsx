"use client";

import { useState } from "react";

const YEARS = Array.from({ length: 2025 - 1940 + 1 }, (_, i) => 2025 - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

const selectCls =
  "w-full rounded-lg border border-night-600 bg-night-800 px-3 py-2.5 text-paper-200 " +
  "focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/50";
const labelCls = "block text-sm font-medium text-paper-400 mb-1.5";

/**
 * 생년월일·시간·성별·양력음력 입력 묶음. 신청자(prefix="a")와 상대방(prefix="b")에 재사용.
 * 모든 input에 name={prefix + 키} 가 붙어 서버 액션에서 파싱한다.
 */
export default function BirthFields({
  prefix,
  legend,
}: {
  prefix: string;
  legend: string;
}) {
  const [calendar, setCalendar] = useState<"solar" | "lunar">("solar");
  const [timeUnknown, setTimeUnknown] = useState(false);

  const n = (k: string) => prefix + k;

  return (
    <fieldset className="space-y-4 rounded-xl border border-night-600/70 bg-night-800/40 p-4">
      <legend className="px-1 text-sm font-semibold text-gold-300">{legend}</legend>

      {/* 양력/음력 */}
      <div>
        <span className={labelCls}>달력 기준</span>
        <div className="grid grid-cols-2 gap-2">
          {(["solar", "lunar"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCalendar(c)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                calendar === c
                  ? "border-gold-500 bg-gold-500/10 text-gold-300"
                  : "border-night-600 bg-night-800 text-paper-400"
              }`}
            >
              {c === "solar" ? "양력" : "음력"}
            </button>
          ))}
        </div>
        <input type="hidden" name={n("cal")} value={calendar} />
        {calendar === "lunar" && (
          <label className="mt-2 flex items-center gap-2 text-sm text-paper-400">
            <input type="checkbox" name={n("leap")} className="h-4 w-4 accent-gold-500" />
            윤달입니다
          </label>
        )}
      </div>

      {/* 생년월일 */}
      <div>
        <span className={labelCls}>생년월일</span>
        <div className="grid grid-cols-3 gap-2">
          <select name={n("year")} defaultValue="" required className={selectCls} aria-label="출생 연도">
            <option value="" disabled>연도</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}년</option>)}
          </select>
          <select name={n("month")} defaultValue="" required className={selectCls} aria-label="출생 월">
            <option value="" disabled>월</option>
            {MONTHS.map((m) => <option key={m} value={m}>{m}월</option>)}
          </select>
          <select name={n("day")} defaultValue="" required className={selectCls} aria-label="출생 일">
            <option value="" disabled>일</option>
            {DAYS.map((d) => <option key={d} value={d}>{d}일</option>)}
          </select>
        </div>
      </div>

      {/* 태어난 시간 */}
      <div>
        <span className={labelCls}>태어난 시간</span>
        <div className={`grid grid-cols-2 gap-2 ${timeUnknown ? "opacity-40" : ""}`}>
          <select name={n("hour")} defaultValue="" disabled={timeUnknown} className={selectCls} aria-label="출생 시">
            <option value="" disabled>시</option>
            {HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}시</option>)}
          </select>
          <select name={n("min")} defaultValue="0" disabled={timeUnknown} className={selectCls} aria-label="출생 분">
            {MINUTES.map((m) => <option key={m} value={m}>{String(m).padStart(2, "0")}분</option>)}
          </select>
        </div>
        <label className="mt-2 flex items-center gap-2 text-sm text-paper-400">
          <input
            type="checkbox"
            name={n("tu")}
            checked={timeUnknown}
            onChange={(e) => setTimeUnknown(e.target.checked)}
            className="h-4 w-4 accent-gold-500"
          />
          태어난 시간을 모릅니다
        </label>
      </div>

      {/* 성별 */}
      <div>
        <span className={labelCls}>성별</span>
        <div className="grid grid-cols-2 gap-2">
          {([["female", "여성"], ["male", "남성"]] as const).map(([v, label], i) => (
            <label
              key={v}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-night-600 bg-night-800 px-3 py-2.5 text-sm text-paper-300 has-[:checked]:border-gold-500 has-[:checked]:bg-gold-500/10 has-[:checked]:text-gold-300"
            >
              <input type="radio" name={n("gender")} value={v} required={i === 0} className="accent-gold-500" />
              {label}
            </label>
          ))}
        </div>
      </div>
    </fieldset>
  );
}
