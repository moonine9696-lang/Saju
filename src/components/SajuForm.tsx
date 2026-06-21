"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REGION_KEYS, DEFAULT_REGION } from "@/lib/saju";

const YEARS = Array.from({ length: 2050 - 1940 + 1 }, (_, i) => 1940 + i).reverse();
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

const selectCls =
  "w-full rounded-lg border border-night-600 bg-night-800 px-3 py-2.5 text-paper-200 " +
  "focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/50";

const labelCls = "block text-sm font-medium text-paper-400 mb-1.5";

export default function SajuForm() {
  const router = useRouter();
  const [calendar, setCalendar] = useState<"solar" | "lunar">("solar");
  const [isLeap, setIsLeap] = useState(false);
  const [year, setYear] = useState(1995);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [gender, setGender] = useState<"male" | "female">("female");
  const [region, setRegion] = useState<string>(DEFAULT_REGION);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      cal: calendar,
      y: String(year),
      m: String(month),
      d: String(day),
      g: gender,
      r: region,
    });
    if (calendar === "lunar" && isLeap) params.set("leap", "1");
    if (timeUnknown) {
      params.set("tu", "1");
    } else {
      params.set("h", String(hour));
      params.set("mi", String(minute));
    }
    router.push(`/result?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
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
        {calendar === "lunar" && (
          <label className="mt-2 flex items-center gap-2 text-sm text-paper-400">
            <input
              type="checkbox"
              checked={isLeap}
              onChange={(e) => setIsLeap(e.target.checked)}
              className="h-4 w-4 accent-gold-500"
            />
            윤달입니다
          </label>
        )}
      </div>

      {/* 생년월일 */}
      <div>
        <span className={labelCls}>생년월일</span>
        <div className="grid grid-cols-3 gap-2">
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={selectCls} aria-label="출생 연도">
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className={selectCls} aria-label="출생 월">
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}월</option>
            ))}
          </select>
          <select value={day} onChange={(e) => setDay(Number(e.target.value))} className={selectCls} aria-label="출생 일">
            {DAYS.map((d) => (
              <option key={d} value={d}>{d}일</option>
            ))}
          </select>
        </div>
      </div>

      {/* 출생 시각 */}
      <div>
        <span className={labelCls}>태어난 시각</span>
        <div className={`grid grid-cols-2 gap-2 ${timeUnknown ? "opacity-40" : ""}`}>
          <select
            value={hour}
            onChange={(e) => setHour(Number(e.target.value))}
            className={selectCls}
            disabled={timeUnknown}
            aria-label="출생 시"
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>{String(h).padStart(2, "0")}시</option>
            ))}
          </select>
          <select
            value={minute}
            onChange={(e) => setMinute(Number(e.target.value))}
            className={selectCls}
            disabled={timeUnknown}
            aria-label="출생 분"
          >
            {MINUTES.map((m) => (
              <option key={m} value={m}>{String(m).padStart(2, "0")}분</option>
            ))}
          </select>
        </div>
        <label className="mt-2 flex items-center gap-2 text-sm text-paper-400">
          <input
            type="checkbox"
            checked={timeUnknown}
            onChange={(e) => setTimeUnknown(e.target.checked)}
            className="h-4 w-4 accent-gold-500"
          />
          태어난 시각을 모릅니다
        </label>
      </div>

      {/* 성별 / 출생 지역 */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className={labelCls}>성별</span>
          <div className="grid grid-cols-2 gap-2">
            {(["female", "male"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  gender === g
                    ? "border-gold-500 bg-gold-500/10 text-gold-300"
                    : "border-night-600 bg-night-800 text-paper-400"
                }`}
              >
                {g === "female" ? "여성" : "남성"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className={labelCls}>태어난 지역</span>
          <select value={region} onChange={(e) => setRegion(e.target.value)} className={selectCls} aria-label="출생 지역">
            {REGION_KEYS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-gold-500 px-4 py-3.5 text-base font-bold text-night-900 transition-colors hover:bg-gold-400"
      >
        내 사주 보기
      </button>
      <p className="text-center text-xs text-paper-500">
        입력하신 정보는 풀이 화면을 보여드리는 데만 사용되며, 따로 저장하지 않습니다.
      </p>
    </form>
  );
}
