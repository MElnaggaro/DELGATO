import type { Address } from '../schemas/address';

/**
 * Seed addresses — ported verbatim from the design reference's data.jsx.
 * Real implementation will fetch from /addresses.
 */
export const MOCK_ADDRESSES: Address[] = [
  {
    id: 'a1',
    label: 'home',
    street: 'شارع الجلاء',
    detail: 'بجوار صيدلية مصر · الدلنجات',
  },
  {
    id: 'a2',
    label: 'work',
    street: 'شارع الترعة',
    detail: 'محل أبو وليد · الدور التاني',
  },
  {
    id: 'a3',
    label: 'other',
    street: 'شارع المحطة',
    detail: 'منزل العيلة · الدلنجات',
  },
];

/**
 * What the "use my location" mock returns — pretends to have detected the
 * user near the brand's canonical address: شارع الجلاء بجوار صيدلية مصر.
 */
export const MOCK_DETECTED_ADDRESS = {
  street: 'شارع الجلاء',
  detail: 'بجوار صيدلية مصر · الدلنجات',
  lat: 31.0934,
  lng: 31.0089,
};
