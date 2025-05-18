import { describe, it, expect, vi, beforeEach } from 'vitest';
import { openBrowser } from '../openBrowser';
import * as WebBrowser from 'expo-web-browser';
import { isWeb } from 'expo-crypto-universal';

// Mock expo-web-browser
vi.mock('expo-web-browser', () => ({
  openBrowserAsync: vi.fn(),
}));

// Mock isWeb
vi.mock('expo-crypto-universal', () => ({
  isWeb: vi.fn(),
}));

// Mock window object
const mockWindow = {
  open: vi.fn(),
};

// Set up global window mock
vi.stubGlobal('window', mockWindow);

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

  it('should open in a new tab when inNewTab is true and isWeb() returns true', async () => {
    const url = 'https://example.com';
    (isWeb as any).mockReturnValue(true);
    await openBrowser(url, { inNewTab: true });

    expect(mockWindow.open).toHaveBeenCalledWith(url, '_blank');
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
  });

  it('should fallback to openBrowserAsync when inNewTab is true but isWeb() returns false', async () => {
    const url = 'https://example.com';
    (isWeb as any).mockReturnValue(false);
    await openBrowser(url, { inNewTab: true });

    expect(mockWindow.open).not.toHaveBeenCalled();
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(url, {
      windowName: '_self',
    });
  });
});