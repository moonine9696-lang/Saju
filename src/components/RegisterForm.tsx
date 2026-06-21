"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { submitRegistration, type RegisterState } from "@/app/register/actions";
import { isWithinPhoneLimit, isCompletePhone } from "@/lib/phone";

const RESIDENCE_OPTIONS = [
  "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
  "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];

const THIS_YEAR = 2025;
const BIRTH_YEARS = Array.from({ length: THIS_YEAR - 1940 + 1 }, (_, i) => THIS_YEAR - i);

const selectCls =
  "w-full rounded-lg border border-night-600 bg-night-800 px-3 py-2.5 text-paper-200 " +
  "focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/50";
const inputCls = selectCls;
const labelCls = "block text-sm font-medium text-paper-400 mb-1.5";

const initial: RegisterState = { ok: false };

export default function RegisterForm({
  sajuQuery,
  defaultGender,
  defaultBirthYear,
}: {
  sajuQuery: string;
  defaultGender: "male" | "female";
  defaultBirthYear: number;
}) {
  const [state, formAction, pending] = useActionState(submitRegistration, initial);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // 전화번호 입력(필수): 하이픈은 허용하되 숫자는 최대 11자리까지만 (초과 입력 차단)
  function onPhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (!isWithinPhoneLimit(raw)) return; // 11자리 초과 차단
    setPhone(raw);
    if (phoneError) setPhoneError(null);
  }

  // 제출 전 클라이언트 검증: 전화번호는 숫자 11자리 필수 (카카오 ID는 선택, 미검증)
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!isCompletePhone(phone)) {
      e.preventDefault();
      setPhoneError("전화번호를 다시 확인해주세요");
    }
  }

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-gold-500/50 bg-gold-500/10 p-6 text-center">
        <p className="font-(family-name:--font-serif-kr) text-lg font-bold text-gold-300">
          사전등록이 완료되었습니다
        </p>
        <p className="mt-3 text-sm leading-relaxed text-paper-300">
          잘 맞는 인연이 등록되면 알려주신 전화번호로 안내드리겠습니다.
          소중한 마음으로 기다려 주셔서 감사합니다.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-gold-500 px-5 py-3 text-sm font-bold text-night-900 hover:bg-gold-400"
        >
          처음으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-5">
      <input type="hidden" name="sajuQuery" value={sajuQuery} />

      <div>
        <label htmlFor="nickname" className={labelCls}>닉네임</label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          maxLength={20}
          required
          placeholder="상대에게 보여질 별칭"
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="gender" className={labelCls}>성별</label>
          <select id="gender" name="gender" defaultValue={defaultGender} className={selectCls}>
            <option value="female">여성</option>
            <option value="male">남성</option>
          </select>
        </div>
        <div>
          <label htmlFor="birthYear" className={labelCls}>출생연도</label>
          <select id="birthYear" name="birthYear" defaultValue={defaultBirthYear} className={selectCls}>
            {BIRTH_YEARS.map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="residence" className={labelCls}>거주 지역 (시/도)</label>
        <select id="residence" name="residence" defaultValue="서울" className={selectCls}>
          {RESIDENCE_OPTIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="phone" className={labelCls}>
          전화번호 <span className="text-el-fire">*</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="text"
          inputMode="numeric"
          maxLength={20}
          required
          value={phone}
          onChange={onPhoneChange}
          placeholder="010-0000-0000"
          className={inputCls}
        />
        {phoneError && <p className="mt-2 text-sm text-el-fire">{phoneError}</p>}
      </div>

      <label className="flex items-start gap-2.5 rounded-lg border border-night-600 bg-night-800/60 p-3 text-sm text-paper-300">
        <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 accent-gold-500" />
        <span>
          개인정보 수집·이용에 동의합니다.{" "}
          <Link href="/privacy" target="_blank" className="text-gold-300 underline underline-offset-2">
            처리방침 보기
          </Link>
          <span className="mt-1 block text-xs leading-relaxed text-paper-500">
            수집 항목: 닉네임, 성별, 출생연도, 거주 지역, 전화번호, 사주 정보 · 목적: 사주 궁합 매칭 ·
            보관: 등록 철회 또는 서비스 종료 시까지
          </span>
        </span>
      </label>

      {state.error && (
        <p className="rounded-lg border border-el-fire/40 bg-el-fire/10 px-3 py-2.5 text-sm text-el-fire">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-gold-500 px-4 py-3.5 text-base font-bold text-night-900 transition-colors hover:bg-gold-400 disabled:opacity-50"
      >
        {pending ? "등록 중…" : "무료 사전등록하기"}
      </button>
    </form>
  );
}
