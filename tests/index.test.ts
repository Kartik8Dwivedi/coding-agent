import { afterEach, describe, expect, it, vi } from 'vitest';
import { main } from '../src/main.js';

describe('main', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prints a startup message', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    main();

    expect(log).toHaveBeenCalledWith('Coding agent starter is ready.');
  });
});
