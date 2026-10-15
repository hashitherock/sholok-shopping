import kurti from '@/assets/products/kurti.jpg';
import shirt from '@/assets/products/shirt.jpg';
import lipstick from '@/assets/products/lipstick.jpg';
import lotion from '@/assets/products/lotion.jpg';
import bag from '@/assets/products/bag.jpg';
import yoga from '@/assets/products/yoga.jpg';
import baby from '@/assets/products/baby.jpg';
import kettle from '@/assets/products/kettle.jpg';
import mop from '@/assets/products/mop.jpg';
import notebooks from '@/assets/products/notebooks.jpg';
import pet from '@/assets/products/pet.jpg';
import football from '@/assets/products/football.jpg';
import vacuum from '@/assets/products/vacuum.jpg';
import sunglasses from '@/assets/products/sunglasses.jpg';
import serum from '@/assets/products/serum.jpg';
import pan from '@/assets/products/pan.jpg';

export const categories = [
  { name: "Women's Clothing", image: kurti, label: 'Everyday elegance' },
  { name: "Men's Clothing", image: shirt, label: 'Fresh fits' },
  { name: 'Beauty & Makeup', image: lipstick, label: 'Your glow, elevated' },
  { name: 'Personal Care', image: lotion, label: 'A little self-care' },
  { name: 'Fashion & Lifestyle', image: bag, label: 'The finishing touch' },
  { name: 'Health & Wellness', image: yoga, label: 'Feel your best' },
  { name: 'Baby Care', image: baby, label: 'For your little one' },
  { name: 'Home & Kitchen', image: kettle, label: 'Make home yours' },
  { name: 'Cleaning Supplies', image: mop, label: 'A fresh start' },
  { name: 'Stationery & Office', image: notebooks, label: 'Big ideas start here' },
  { name: 'Pet Care', image: pet, label: 'Happy little companions' },
  { name: 'Toys & Sports', image: football, label: 'More time for play' },
  { name: 'Vehicle Essentials', image: vacuum, label: 'Ready for the road' },
] as const;
export type CategoryName = typeof categories[number]['name'];
export type Product = { id: string; name: string; category: CategoryName; brand: string; description: string; image: string; price: number; original: number; rating: number; reviews: number; stock: number; sold: number; badge?: string | undefined; featured: boolean; trending: boolean; bestseller: boolean; variants?: string[] | undefined };
const names = [
 ['Embroidered Cotton Kurti – Sage Green','Everyday Linen Blend Kurti','Classic Embroidered Long Tunic','Relaxed Fit Cotton Kurti','Premium Festive Embroidered Kurti'],
 ['Oxford Cotton Shirt – Sky Blue','Everyday Slim Fit Oxford Shirt','Classic Long Sleeve Casual Shirt','Premium Cotton Office Shirt','Relaxed Weekend Button-down Shirt'],
 ['Velvet Matte Lipstick – Coral Crush','Longwear Satin Finish Lipstick','Hydrating Colour Rich Lipstick','Soft Matte Lip Colour','Everyday Coral Lipstick'],
 ['Daily Hydrating Body Lotion – 400ml','Gentle Moisturising Body Lotion','Sensitive Skin Body Moisturiser','Nourishing Daily Care Lotion','Lightweight Hydration Lotion'],
 ['Classic Structured Handbag – Tan','Everyday Carry Tote Bag','Premium Vegan Leather Shoulder Bag','Minimalist Office Handbag','Classic Square Frame Sunglasses'],
 ['Non-slip Yoga Mat – 6mm','Comfort Yoga & Exercise Mat','Extra Cushion Fitness Mat','Everyday Stretch Yoga Mat','Premium Carry-strap Yoga Mat'],
 ['Anti-colic Baby Feeding Bottle – 240ml','Wide Neck Baby Feeding Bottle','BPA-free Easy Grip Baby Bottle','Soft Nipple Feeding Bottle','First Steps Baby Feeding Bottle'],
 ['Stainless Steel Electric Kettle – 1.8L','Quick Boil Electric Kettle – 1.5L','Non-stick Frying Pan – 28cm','Cordless Electric Kettle – 1.8L','Wood Handle Non-stick Frying Pan'],
 ['Microfibre Spray Mop with Refill','Easy Clean Floor Spray Mop','360° Microfibre Cleaning Mop','Refillable Spray Mop Set','Premium Flat Floor Cleaning Mop'],
 ['Pastel Spiral Notebook Set – 5 Pack','A5 Ruled Spiral Notebooks – Set of 3','Daily Notes Pastel Notebook Set','Premium Study Notebook Bundle','Office Essentials Spiral Notebooks'],
 ['Plush Round Pet Bed – Medium','Calming Soft Pet Bed – Small','Washable Cosy Cat & Dog Bed','Premium Comfort Pet Cushion','Round Nest Pet Bed – Large'],
 ['Classic Training Football – Size 5','Match Ready Football – Size 5','Outdoor Sports Training Football','Junior Practice Football – Size 4','All-weather Football – Size 5'],
 ['Portable Car Vacuum Cleaner – 120W','Compact Handheld Car Vacuum','High Power Auto Vacuum Cleaner','Portable Wet & Dry Car Vacuum','Easy Clean Vehicle Vacuum Kit'],
];
const prices=[1290,890,349,550,1590,690,390,1190,590,299,990,650,1290];
const brands=['Aarong','Yellow','Colourpop','Pure Care','Urban Edit','FlexFit','Little Steps','Miyako','Clean Home','Paper Studio','Pawfect','Active','AutoPro'];
export const products: Product[] = categories.flatMap((category, ci) => (names[ci] ?? []).map((name, j) => ({
 id: `sh-${ci + 1}-${j + 1}`, name, category: category.name, brand: brands[ci] ?? "Sholok",
 description: `Thoughtfully selected for everyday living. ${name} combines dependable quality with great value. Discover your next favourite from ${brands[ci]}.`,
 image: ci === 4 && j === 4 ? sunglasses : ci === 7 && (j === 2 || j === 4) ? pan : category.image,
 price: (prices[ci] ?? 500) + j * 80, original: Math.round(((prices[ci] ?? 500) + j * 80) / (0.58 + j * 0.06) / 10) * 10,
 rating: +(4.5 + (j % 3) * 0.2).toFixed(1), reviews: 128 + ci * 21 + j * 37,
 stock: j === 4 && ci === 9 ? 0 : 18 + j * 8, sold: 45 + ci * 3 + j * 7,
 badge: j === 0 ? 'Free delivery' : j === 1 ? 'New arrival' : undefined,
 featured: j < 2, trending: j === 1 || j === 2, bestseller: j === 0 || j === 3,
 variants: ci < 2 ? ['S','M','L','XL'] : undefined,
})));
export const flashProducts = [products[0],products[35],products[10],products[20],products[40],products[55]].filter((p): p is Product => Boolean(p));
export const featuredProducts = [products[5],products[15],products[25],products[30],products[45],products[60]].filter((p): p is Product => Boolean(p));
export const extraBeauty: Product = {id:'sh-serum', name:'Radiance Vitamin C Face Serum – 30ml',image:serum,category:'Personal Care',price:799,original:1190,brand:'Pure Care',description:'A lightweight daily brightening facial serum for your skincare routine.',rating:4.8,reviews:342,stock:40,sold:84,featured:true,trending:true,bestseller:true};
products.push(extraBeauty);
export const money = (amount: number) => `৳${amount.toLocaleString('en-BD')}`;
export const discount = (p: Product) => Math.round((1-p.price/p.original)*100);

export const pickProducts = (...indices: number[]): Product[] => indices.map(i => products[i]).filter((p): p is Product => Boolean(p));
