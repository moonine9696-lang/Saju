"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 클립보드 권한이 없는 환경 대비 폴백
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="shrink-0 rounded-lg border border-gold-500/60 bg-gold-500/10 px-3 py-2 text-xs font-medium text-gold-300 transition-colors hover:bg-gold-500/20"
    >
      {copied ? "복사됨 ✓" : "계좌번호 복사"}
    </button>
  );
}
