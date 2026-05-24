/**
 * Shared helpers for mock repository implementations.
 */

import type { Audit, Id } from '@/domain/types';

let idCounter = 1;

export function genId(prefix: string): Id {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Compute the audit envelope for a new entity.
 */
export function newAudit(): Audit {
  const ts = nowISO();
  return { createdAt: ts, updatedAt: ts, version: 1 };
}

/**
 * Compute the audit envelope for the next version of an existing entity.
 */
export function bumpAudit(prev: Audit): Audit {
  return { createdAt: prev.createdAt, updatedAt: nowISO(), version: prev.version + 1 };
}

/**
 * Random between [min, max).
 */
export function randInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min));
}
