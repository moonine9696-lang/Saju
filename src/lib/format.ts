/** 가격(원) 표시 포맷. env 미설정 시 기본값 사용 */
export function formatPrice(won: number): string {
  return won.toLocaleString("ko-KR") + "원";
}

export const PRICE_PDF = Number(process.env.NEXT_PUBLIC_PRICE_PDF ?? 34900);
export const PRICE_MATCHING = Number(process.env.NEXT_PUBLIC_PRICE_MATCHING ?? 14900);
