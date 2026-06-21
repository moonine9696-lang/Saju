import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "환불 정책 — 사주의 길",
};

export const dynamic = "force-static";

const para = "text-sm leading-relaxed text-paper-300";

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-xl px-4 pt-8 pb-14">
      <h1 className="font-(family-name:--font-serif-kr) text-2xl font-bold text-paper-100">
        환불 정책
      </h1>

      <ul className="mt-6 space-y-3">
        <li className={para}>
          · 발송 전(풀이 작성 시작 전)에는 전액 환불해 드립니다.
        </li>
        <li className={para}>
          · 발송이 시작된 이후에는 사주 풀이가 회수 불가능한 디지털 콘텐츠이므로 환불이 제한됩니다.
        </li>
        <li className={para}>
          · 다만 발송 누락, 잘못된 정보로 인한 오작성 등 제공자 측 사유가 있는 경우에는
          환불 또는 재발송해 드립니다.
        </li>
        <li className={para}>· 환불 요청은 입금하신 계좌로 처리됩니다.</li>
      </ul>
    </div>
  );
}
