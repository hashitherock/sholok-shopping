import { describe, expect, it } from 'vitest';
import { calculateTotals, validateCoupon } from '@/lib/pricing';
const line = (price: number, quantity: number) => ({ price, original: price, quantity });
describe('demo coupons and totals', () => {
  it('SHOLOK10 gives 10% off, capped at ৳300', () => {
    expect(calculateTotals([line(1200, 1)], 'SHOLOK10').discount).toBe(120);
    expect(calculateTotals([line(5000, 1)], 'SHOLOK10').discount).toBe(300);
  });
  it('SHOLOK10 needs a ৳1,000 subtotal', () => { expect(validateCoupon('sholok10', 900).ok).toBe(false); });
  it('WELCOME150 takes ৳150 off over ৳800', () => { expect(calculateTotals([line(900, 1)], 'WELCOME150').total).toBe(900 - 150 + 60); });
  it('delivery is ৳60 and free from ৳1,500', () => {
    expect(calculateTotals([line(500, 2)]).delivery).toBe(60);
    expect(calculateTotals([line(750, 2)]).delivery).toBe(0);
  });
  it('FREESHIP removes delivery over ৳500', () => { expect(calculateTotals([line(600, 1)], 'FREESHIP').delivery).toBe(0); });
  it('rejects unknown and expired codes', () => {
    expect(validateCoupon('NOPE', 5000).ok).toBe(false);
    expect(validateCoupon('EID2025', 5000).message).toMatch(/expired/);
  });
});
