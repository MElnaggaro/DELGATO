import type { MockLatencyProfile } from '@/infrastructure/config';
import { NetworkError } from '@/domain/errors';

export type LatencyOpKind = 'read' | 'write' | 'auth';

export class LatencyEngine {
  private failRate: number;

  constructor(private profile: MockLatencyProfile, failRate = 0) {
    this.failRate = failRate;
  }

  /**
   * Sleep for the configured window for the given operation kind.
   * Optionally throws `NetworkError` to exercise the rollback path.
   */
  async sleep(kind: LatencyOpKind = 'write'): Promise<void> {
    const [min, max] = this.profile[kind];
    const ms = Math.floor(min + Math.random() * (max - min));
    await new Promise<void>((resolve) => setTimeout(resolve, ms));
    if (this.failRate > 0 && Math.random() < this.failRate) {
      throw new NetworkError('Simulated mock failure', true);
    }
  }

  setFailRate(rate: number): void {
    this.failRate = Math.max(0, Math.min(1, rate));
  }

  setProfile(profile: MockLatencyProfile): void {
    this.profile = profile;
  }
}
