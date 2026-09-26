import '@testing-library/jest-dom/vitest';

// Node 25 globalThis.localStorage.setItem is undefined without --localstorage-file flag.
// Override with an in-memory shim so persist middleware works in tests.
class MemoryStorage implements Storage {
  private store: Record<string, string> = {};
  get length(): number {
    return Object.keys(this.store).length;
  }
  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }
  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: new MemoryStorage(),
  writable: true,
  configurable: true,
});
