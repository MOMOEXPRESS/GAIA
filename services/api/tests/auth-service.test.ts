/**
 * Identity & Auth domain tests (Vol 6 §11.2 — extensive unit tests over
 * domain logic).
 */
import { AuthService } from '../src/modules/identity-auth/application/auth-service';
import { InProcessEventBus } from '../src/shared/event-bus';
import { createLogger } from '../src/shared/logger';
import {
  FakePasswordHasher,
  FakeTokenIssuer,
  InMemoryRefreshTokenRepository,
  InMemoryUserRepository,
} from './helpers/in-memory-adapters';

function makeService() {
  const eventBus = new InProcessEventBus(createLogger('test'));
  const service = new AuthService(
    new InMemoryUserRepository(),
    new InMemoryRefreshTokenRepository(),
    new FakePasswordHasher(),
    new FakeTokenIssuer(),
    eventBus,
  );
  return { service, eventBus };
}

const validInput = { email: 'alex@example.com', password: 'sunrise-2026', firstName: 'Alex' };

describe('AuthService.register', () => {
  it('registers a patient and returns tokens', async () => {
    const { service } = makeService();
    const result = await service.register(validInput);

    expect(result.user.email).toBe('alex@example.com');
    expect(result.user.role).toBe('patient');
    expect(result.tokens.accessToken).toContain(result.user.id);
    expect(result.tokens.expiresIn).toBe(900);
    // The password hash must never leak into the public user object.
    expect((result.user as Record<string, unknown>).passwordHash).toBeUndefined();
  });

  it('publishes user.registered on the event bus', async () => {
    const { service, eventBus } = makeService();
    const seen: string[] = [];
    eventBus.subscribe('user.registered', async (event) => {
      seen.push(event.aggregateId);
    });

    const result = await service.register(validInput);
    expect(seen).toEqual([result.user.id]);
  });

  it('rejects duplicate emails with a human message', async () => {
    const { service } = makeService();
    await service.register(validInput);
    await expect(service.register(validInput)).rejects.toThrow(
      'An account with this email already exists.',
    );
  });

  it.each([
    ['not-an-email', 'sunrise-2026', 'Alex', 'valid email'],
    ['alex@example.com', 'short1', 'Alex', 'at least 10 characters'],
    ['alex@example.com', 'nodigitshere', 'Alex', 'one letter and one number'],
    ['alex@example.com', 'sunrise-2026', '   ', 'first name'],
  ])('rejects invalid input (%s / %s / %s)', async (email, password, firstName, fragment) => {
    const { service } = makeService();
    await expect(service.register({ email, password, firstName })).rejects.toThrow(
      expect.objectContaining({ message: expect.stringContaining(fragment) }),
    );
  });
});

describe('AuthService.login', () => {
  it('returns tokens for correct credentials', async () => {
    const { service } = makeService();
    await service.register(validInput);
    const result = await service.login('alex@example.com', 'sunrise-2026');
    expect(result.tokens.accessToken).toBeTruthy();
  });

  it('uses an identical error for unknown email and wrong password (no enumeration)', async () => {
    const { service } = makeService();
    await service.register(validInput);

    const unknownEmail = service.login('nobody@example.com', 'sunrise-2026').catch((e) => e.message);
    const wrongPassword = service.login('alex@example.com', 'wrong-pass-1').catch((e) => e.message);
    expect(await unknownEmail).toBe(await wrongPassword);
  });
});

describe('AuthService.refresh', () => {
  it('rotates the refresh token: the old one stops working', async () => {
    const { service } = makeService();
    const { tokens } = await service.register(validInput);

    const newTokens = await service.refresh(tokens.refreshToken);
    expect(newTokens.refreshToken).not.toBe(tokens.refreshToken);

    await expect(service.refresh(tokens.refreshToken)).rejects.toThrow(
      'Your session has expired. Please sign in again.',
    );
  });
});
