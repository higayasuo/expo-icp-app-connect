import { describe, it, expect, vi, beforeEach } from 'vitest';
import { connectToApp } from '../connectToApp';
import { toHex, updateParams, camelToKebab } from 'expo-icp-frontend-helpers';
import { openBrowser } from '../openBrowser';
import { CryptoModule } from 'expo-crypto-universal';
import { StringValueStorageWrapper } from 'expo-storage-universal';
import { DeepLinkConnectionParams } from 'expo-icp-app-connect-helpers';

vi.mock('../openBrowser', () => ({
  openBrowser: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('expo-icp-frontend-helpers', () => ({
  toHex: vi.fn(),
  updateParams: vi.fn(),
  camelToKebab: (str: string) =>
    str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(),
}));

describe('connectToApp', () => {
  const mockUrl = 'https://example.com';
  const mockSessionId = '010203';
  const mockParams: DeepLinkConnectionParams = { deepLinkType: 'icp' };
  const mockRedirectPath = '/test';

  const mockCryptoModule = {
    getRandomBytes: vi.fn(),
  } as unknown as CryptoModule;

  const mockSessionIdStorage = {
    save: vi.fn(),
  } as unknown as StringValueStorageWrapper;

  const mockRedirectPathStorage = {
    save: vi.fn(),
    remove: vi.fn(),
  } as unknown as StringValueStorageWrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockCryptoModule.getRandomBytes).mockResolvedValue(
      new Uint8Array([1, 2, 3]),
    );
    vi.mocked(toHex).mockReturnValue(mockSessionId);
    vi.mocked(updateParams).mockImplementation((searchParams, params) => {
      Object.entries(params).forEach(([key, value]) => {
        searchParams.set(camelToKebab(key), value as string);
      });
    });
    vi.mocked(mockSessionIdStorage.save).mockResolvedValue(undefined);
    vi.mocked(mockRedirectPathStorage.save).mockResolvedValue(undefined);
    vi.mocked(mockRedirectPathStorage.remove).mockResolvedValue(undefined);
    vi.mocked(openBrowser).mockResolvedValue(undefined);
  });

  it('should connect to app successfully', async () => {
    const result = await connectToApp({
      url: mockUrl,
      params: mockParams,
      redirectPath: mockRedirectPath,
      redirectPathStorage: mockRedirectPathStorage,
      sessionIdStorage: mockSessionIdStorage,
      cryptoModule: mockCryptoModule,
    });

    expect(mockRedirectPathStorage.save).toHaveBeenCalledWith(mockRedirectPath);
    expect(mockCryptoModule.getRandomBytes).toHaveBeenCalledWith(32);
    expect(toHex).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]));
    expect(mockSessionIdStorage.save).toHaveBeenCalledWith(mockSessionId);
    expect(updateParams).toHaveBeenCalledWith(expect.any(URLSearchParams), {
      ...mockParams,
      sessionId: mockSessionId,
    });
    expect(openBrowser).toHaveBeenCalledWith(
      `${mockUrl}/?deep-link-type=icp&session-id=010203`,
    );
    expect(result).toBe(mockSessionId);
  });

  it('should throw error when getRandomBytes fails', async () => {
    const error = new Error('Random bytes error');
    vi.mocked(mockCryptoModule.getRandomBytes).mockRejectedValue(error);

    await expect(
      connectToApp({
        url: mockUrl,
        params: mockParams,
        redirectPath: mockRedirectPath,
        redirectPathStorage: mockRedirectPathStorage,
        sessionIdStorage: mockSessionIdStorage,
        cryptoModule: mockCryptoModule,
      }),
    ).rejects.toThrow(error);

    expect(mockSessionIdStorage.save).not.toHaveBeenCalled();
    expect(openBrowser).not.toHaveBeenCalled();
  });

  it('should throw error when save fails', async () => {
    const error = new Error('Save error');
    vi.mocked(mockSessionIdStorage.save).mockRejectedValue(error);

    await expect(
      connectToApp({
        url: mockUrl,
        params: mockParams,
        redirectPath: mockRedirectPath,
        redirectPathStorage: mockRedirectPathStorage,
        sessionIdStorage: mockSessionIdStorage,
        cryptoModule: mockCryptoModule,
      }),
    ).rejects.toThrow(error);

    expect(openBrowser).not.toHaveBeenCalled();
  });

  it('should throw error when openBrowser fails', async () => {
    const error = new Error('Browser error');
    vi.mocked(openBrowser).mockRejectedValue(error);

    await expect(
      connectToApp({
        url: mockUrl,
        params: mockParams,
        redirectPath: mockRedirectPath,
        redirectPathStorage: mockRedirectPathStorage,
        sessionIdStorage: mockSessionIdStorage,
        cryptoModule: mockCryptoModule,
      }),
    ).rejects.toThrow(error);
  });

  it('should remove redirect path when redirectPath is undefined', async () => {
    await connectToApp({
      url: mockUrl,
      params: mockParams,
      redirectPath: undefined,
      redirectPathStorage: mockRedirectPathStorage,
      sessionIdStorage: mockSessionIdStorage,
      cryptoModule: mockCryptoModule,
    });

    expect(mockRedirectPathStorage.remove).toHaveBeenCalled();
    expect(mockRedirectPathStorage.save).not.toHaveBeenCalled();
  });
});
