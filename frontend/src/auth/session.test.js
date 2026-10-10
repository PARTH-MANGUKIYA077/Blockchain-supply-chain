import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeRole, saveSession, loadSession, clearSession } from './session.js';

const mockStorage = {
  store: {},
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  }
};

globalThis.window = { localStorage: mockStorage };

test('normalizeRole keeps valid values uppercase', () => {
  assert.equal(normalizeRole('manufacturer'), 'MANUFACTURER');
  assert.equal(normalizeRole('ADMIN'), 'ADMIN');
});

test('session helpers persist and restore auth data', () => {
  const session = saveSession({
    username: 'alice',
    role: 'supplier',
    account: '0x123'
  });

  assert.equal(session.isAuthenticated, true);
  assert.equal(session.user.username, 'alice');
  assert.equal(session.role, 'SUPPLIER');

  const loaded = loadSession();
  assert.equal(loaded.isAuthenticated, true);
  assert.equal(loaded.user.username, 'alice');
  assert.equal(loaded.role, 'SUPPLIER');

  clearSession();
  const cleared = loadSession();
  assert.equal(cleared.isAuthenticated, false);
  assert.equal(cleared.user, null);
});
