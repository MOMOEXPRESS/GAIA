/**
 * In-memory adapters for unit tests — hexagonal architecture makes swapping
 * infrastructure trivial (Vol 6 §5.5: "This design ensures testability").
 */
import type {
  PasswordHasher,
  RefreshTokenRepository,
  StoredUser,
  TokenIssuer,
  UserRepository,
} from '../../src/modules/identity-auth/domain/ports';
import type {
  FhirResourceRepository,
  ResourceSearchQuery,
} from '../../src/modules/health-graph/domain/ports';
import type { TimelineEventRepository } from '../../src/modules/timeline/domain/ports';
import type { FhirResource, TimelineEvent, TimelineQuery, UserRole } from '@gaia/shared-types';

export class InMemoryUserRepository implements UserRepository {
  private users: StoredUser[] = [];

  async findByEmail(email: string): Promise<StoredUser | null> {
    return this.users.find((u) => u.email === email) ?? null;
  }
  async findById(id: string): Promise<StoredUser | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }
  async create(user: StoredUser): Promise<void> {
    this.users.push(user);
  }
}

export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  private tokens = new Map<string, { userId: string; expiresAt: Date; revoked: boolean }>();

  async save(token: string, userId: string, expiresAt: Date): Promise<void> {
    this.tokens.set(token, { userId, expiresAt, revoked: false });
  }
  async findUserId(token: string): Promise<string | null> {
    const entry = this.tokens.get(token);
    if (!entry || entry.revoked || entry.expiresAt < new Date()) return null;
    return entry.userId;
  }
  async revoke(token: string): Promise<void> {
    const entry = this.tokens.get(token);
    if (entry) entry.revoked = true;
  }
}

/** Fast, deterministic hasher for tests only. */
export class FakePasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return `hashed:${plain}`;
  }
  async verify(plain: string, hash: string): Promise<boolean> {
    return hash === `hashed:${plain}`;
  }
}

export class FakeTokenIssuer implements TokenIssuer {
  accessTtlSeconds = 900;
  refreshTtlSeconds = 2_592_000;
  private counter = 0;

  issueAccessToken(userId: string, role: UserRole): string {
    return `access:${userId}:${role}`;
  }
  issueRefreshToken(): string {
    this.counter += 1;
    return `refresh:${this.counter}`;
  }
}

export class InMemoryFhirResourceRepository implements FhirResourceRepository {
  readonly versions: FhirResource[] = [];

  async findById(id: string, subject: string): Promise<FhirResource | null> {
    const matching = this.versions
      .filter((r) => r.id === id && r.subject === subject)
      .sort((a, b) => b.meta.versionId - a.meta.versionId);
    return matching[0] ?? null;
  }

  async search(query: ResourceSearchQuery): Promise<FhirResource[]> {
    const latestById = new Map<string, FhirResource>();
    for (const resource of this.versions) {
      if (resource.subject !== query.subject) continue;
      if (query.resourceType && resource.resourceType !== query.resourceType) continue;
      const existing = latestById.get(resource.id);
      if (!existing || existing.meta.versionId < resource.meta.versionId) {
        latestById.set(resource.id, resource);
      }
    }
    return [...latestById.values()].slice(0, query.limit ?? 100);
  }

  async saveVersion(resource: FhirResource): Promise<void> {
    this.versions.push(resource);
  }
}

export class InMemoryTimelineRepository implements TimelineEventRepository {
  readonly events: TimelineEvent[] = [];

  async upsert(event: TimelineEvent): Promise<void> {
    const duplicate = this.events.some(
      (e) => e.sourceModule === event.sourceModule && e.sourceId === event.sourceId,
    );
    if (!duplicate) this.events.push(event);
  }

  async query(query: TimelineQuery): Promise<TimelineEvent[]> {
    return this.events
      .filter((e) => e.userId === query.userId)
      .filter((e) => !query.types || query.types.includes(e.eventType))
      .filter((e) => !query.start || e.timestamp >= query.start)
      .filter((e) => !query.end || e.timestamp <= query.end)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, query.limit ?? 50);
  }
}
