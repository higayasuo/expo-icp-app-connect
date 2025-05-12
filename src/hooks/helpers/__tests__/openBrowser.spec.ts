import { describe, it, expect, vi, beforeEach } from 'vitest';
import { openBrowser } from '../openBrowser';
import * as WebBrowser from 'expo-web-browser';

// Mock expo-web-browser
vi.mock('expo-web-browser', () => ({
  openBrowserAsync: vi.fn(),
}));

describe('openBrowser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call openBrowserAsync with correct parameters', async () => {
    const url = 'https://example.com';
    await openBrowser(url);

    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(url, {
      windowName: '_self',
    });
  });

  it('should handle empty URL', async () => {
    const url = '';
    await openBrowser(url);

    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(url, {
      windowName: '_self',
    });
  });

  it('should handle URL with query parameters', async () => {
    const url = 'https://example.com?param1=value1&param2=value2';
    await openBrowser(url);

    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(url, {
      windowName: '_self',
    });
  });

  it('should handle URL with hash', async () => {
    const url = 'https://example.com#section1';
    await openBrowser(url);

    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(url, {
      windowName: '_self',
    });
  });

  it('should handle URL with special characters', async () => {
    const url = 'https://example.com/path with spaces/日本語';
    await openBrowser(url);

    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(url, {
      windowName: '_self',
    });
  });
});