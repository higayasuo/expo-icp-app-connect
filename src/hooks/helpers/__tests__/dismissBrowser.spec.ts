import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dismissBrowser } from '../dismissBrowser';
import * as WebBrowser from 'expo-web-browser';

// Mock expo-web-browser
vi.mock('expo-web-browser', () => ({
  dismissBrowser: vi.fn(),
}));

// Mock setTimeout
vi.useFakeTimers();

describe('dismissBrowser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call dismissBrowser after 500ms', async () => {
    const promise = dismissBrowser();

    // Fast-forward time by 500ms
    vi.advanceTimersByTime(500);

    await promise;

    expect(WebBrowser.dismissBrowser).toHaveBeenCalledTimes(1);
  });

  it('should not call dismissBrowser before 500ms', async () => {
    const promise = dismissBrowser();

    // Fast-forward time by 499ms
    vi.advanceTimersByTime(499);

    expect(WebBrowser.dismissBrowser).not.toHaveBeenCalled();

    // Fast-forward remaining 1ms
    vi.advanceTimersByTime(1);
    await promise;

    expect(WebBrowser.dismissBrowser).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple calls', async () => {
    const promise1 = dismissBrowser();
    const promise2 = dismissBrowser();

    // Fast-forward time by 500ms
    vi.advanceTimersByTime(500);

    await Promise.all([promise1, promise2]);

    expect(WebBrowser.dismissBrowser).toHaveBeenCalledTimes(2);
  });
});