import { API_MODE } from '../config';
import { http } from '../client';
import { mockDelay } from '../delay';
import { MOCK_ADDRESSES, MOCK_DETECTED_ADDRESS } from '../mocks/addresses';
import {
  AddressSchema,
  type Address,
  type AddressInput,
} from '../schemas/address';

let mockStore: Address[] = [...MOCK_ADDRESSES];
let mockSeq = 100;

export async function listAddresses(): Promise<Address[]> {
  if (API_MODE === 'mock') {
    await mockDelay();
    return mockStore.map((a) => AddressSchema.parse(a));
  }
  const { data } = await http.get('/addresses');
  return (data as unknown[]).map((row) => AddressSchema.parse(row));
}

export async function addAddress(input: AddressInput): Promise<Address> {
  if (API_MODE === 'mock') {
    await mockDelay();
    const created: Address = { id: `a-mock-${mockSeq++}`, ...input };
    mockStore = [created, ...mockStore];
    return AddressSchema.parse(created);
  }
  const { data } = await http.post('/addresses', input);
  return AddressSchema.parse(data);
}

export async function detectAddress(): Promise<{ street: string; detail: string; lat?: number; lng?: number }> {
  if (API_MODE === 'mock') {
    await mockDelay(900, 1400);
    return { ...MOCK_DETECTED_ADDRESS };
  }
  const { data } = await http.get('/addresses/detect');
  return data as { street: string; detail: string; lat?: number; lng?: number };
}
