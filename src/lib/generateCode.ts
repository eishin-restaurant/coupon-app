/**
 * クーポン番号を生成
 * \u4f8b-(ABCDEFGHJLMNPQRSTUVWXYZ23456789-):
 * \u7f16\u6538\u521d\u671f+8\u687e\u96c9\u587d\u8b60\u5176\u308a\u30884/8: EISHIN-A7K2-9F3M
 */
export function generateCouponCode(prefix: string = 'EISHIN'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment = (length: number) => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  return `${prefix}-${segment(4)}-${segment(4)}`;
}
