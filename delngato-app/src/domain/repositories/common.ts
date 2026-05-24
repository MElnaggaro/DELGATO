/**
 * Shared repository primitives.
 */

export type Unsubscribe = () => void;

/**
 * Backend channels for realtime subscriptions. The mock and websocket clients
 * MUST agree on this string vocabulary.
 *
 * Format:
 *  - `orders.byStore.<storeId>`
 *  - `orders.byCustomer.<customerId>`
 *  - `products.byStore.<storeId>`
 *  - `promotions.byStore.<storeId>`
 *  - `notifications.byUser.<userId>`
 *  - `reviews.byStore.<storeId>`
 *  - `stores.<storeId>`
 */
export type Channel = string;

/**
 * Re-export for repository signatures so each file doesn't have to reach into
 * the `types/common` module.
 */
export type { RequestContext } from '@/domain/types';
