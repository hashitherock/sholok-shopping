// Demo-only pricing rules. No real payments or orders are processed.
export type Coupon = {
  code: string;
  label: string;
  kind: 'percent' | 'flat' | 'shipping';
  value: number;
  min: number;
  cap?: number;
  expired?: boolean;
};

export const DELIVERY_FEE = 60;
export const FREE_DELIVERY_FROM = 1500;

export const coupons: Coupon[] = [
  { code: 'SHOLOK10', label: '10% off orders over ৳1,000 (up to ৳300)', kind: 'percent', value: 10, min: 1000, cap: 300 },
  { code: 'WELCOME150', label: '৳150 off orders over ৳800', kind: 'flat', value: 150, min: 800 },
  { code: 'FREESHIP', label: 'Free delivery on orders over ৳500', kind: 'shipping', value: 0, min: 500 },
  { code: 'EID2025', label: 'Eid 2025 special', kind: 'percent', value: 20, min: 0, expired: true },
];

const taka = (n: number) => `৳${n.toLocaleString('en-BD')}`;

export type CouponCheck = { ok: true; coupon: Coupon; message: string } | { ok: false; message: string };

export function validateCoupon(raw: string, subtotal: number): CouponCheck {
  const code = raw.trim().toUpperCase();
  if (!code) return { ok: false, message: 'Please enter a coupon code.' };
  const coupon = coupons.find((c) => c.code === code);
  if (!coupon) return { ok: false, message: `“${code}” is not a valid coupon code.` };
  if (coupon.expired) return { ok: false, message: `${code} has expired.` };
  if (subtotal < coupon.min) return { ok: false, message: `Add ${taka(coupon.min - subtotal)} more to use ${code} (minimum ${taka(coupon.min)}).` };
  return { ok: true, coupon, message: `${code} applied — ${coupon.label}.` };
}

export function couponDiscount(coupon: Coupon | undefined, subtotal: number) {
  if (!coupon || coupon.expired || subtotal < coupon.min) return 0;
  if (coupon.kind === 'percent') return Math.min(Math.round((subtotal * coupon.value) / 100), coupon.cap ?? Infinity);
  if (coupon.kind === 'flat') return Math.min(coupon.value, subtotal);
  return 0;
}

export function calculateTotals(lines: { price: number; original: number; quantity: number }[], couponCode?: string | null) {
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const itemSavings = lines.reduce((s, l) => s + (l.original - l.price) * l.quantity, 0);
  const coupon = couponCode ? coupons.find((c) => c.code === couponCode) : undefined;
  const couponValid = Boolean(coupon && !coupon.expired && subtotal >= coupon.min);
  const discount = couponDiscount(coupon, subtotal);
  const freeShipping = subtotal >= FREE_DELIVERY_FROM || (couponValid && coupon?.kind === 'shipping');
  const delivery = subtotal === 0 || freeShipping ? 0 : DELIVERY_FEE;
  const items = lines.reduce((s, l) => s + l.quantity, 0);
  return { items, subtotal, itemSavings, discount, delivery, total: Math.max(0, subtotal - discount + delivery), coupon, couponValid };
}
