import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleURL } from '../handleURL';
import { parseParams } from 'expo-icp-frontend-helpers';
import { StringValueStorageWrapper } from 'expo-storage-universal';

vi.mock('expo-icp-frontend-helpers', () => ({
  parseParams: vi.fn(),
}));

describe('handleURL', () => {
  const mockSessionId = 'test-session-id';
  const mockHashParams = { sessionId: mockSessionId };
  const mockError = new Error('Parse error');

  const mockSessionIdStorage = {
    find: vi.fn(),
  } as unknown as StringValueStorageWrapper;

  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();
  const mockOnFinally = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call onSuccess and onFinally when session ID matches', async () => {
    vi.mocked(parseParams).mockReturnValue(mockHashParams);
    vi.mocked(mockSessionIdStorage.find).mockResolvedValue(mockSessionId);

    await handleURL({
      url: 'https://example.com#test',
      sessionIdStorage: mockSessionIdStorage,
      onSuccess: mockOnSuccess,
      onError: mockOnError,
      onFinally: mockOnFinally,
    });

    expect(parseParams).toHaveBeenCalledWith('#test');
    expect(mockSessionIdStorage.find).toHaveBeenCalled();
    expect(mockOnSuccess).toHaveBeenCalledWith(mockHashParams);
    expect(mockOnError).not.toHaveBeenCalled();
    expect(mockOnFinally).toHaveBeenCalled();
  });

  it('should call onFinally when no session ID is found', async () => {
    vi.mocked(parseParams).mockReturnValue(mockHashParams);
    vi.mocked(mockSessionIdStorage.find).mockResolvedValue(undefined);

    await handleURL({
      url: 'https://example.com#test',
      sessionIdStorage: mockSessionIdStorage,
      onSuccess: mockOnSuccess,
      onError: mockOnError,
      onFinally: mockOnFinally,
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnError).not.toHaveBeenCalled();
    expect(mockOnFinally).toHaveBeenCalled();
  });

  it('should call onFinally when session IDs do not match', async () => {
    vi.mocked(parseParams).mockReturnValue({ sessionId: 'different-id' });
    vi.mocked(mockSessionIdStorage.find).mockResolvedValue(mockSessionId);

    await handleURL({
      url: 'https://example.com#test',
      sessionIdStorage: mockSessionIdStorage,
      onSuccess: mockOnSuccess,
      onError: mockOnError,
      onFinally: mockOnFinally,
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnError).not.toHaveBeenCalled();
    expect(mockOnFinally).toHaveBeenCalled();
  });

  it('should call onError and onFinally when parseURL throws', async () => {
    vi.mocked(parseParams).mockImplementation(() => {
      throw mockError;
    });

    await handleURL({
      url: 'https://example.com#test',
      sessionIdStorage: mockSessionIdStorage,
      onSuccess: mockOnSuccess,
      onError: mockOnError,
      onFinally: mockOnFinally,
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnError).toHaveBeenCalledWith(mockError);
    expect(mockOnFinally).toHaveBeenCalled();
  });

  it('should call onFinally even when onSuccess throws', async () => {
    vi.mocked(parseParams).mockReturnValue(mockHashParams);
    vi.mocked(mockSessionIdStorage.find).mockResolvedValue(mockSessionId);
    vi.mocked(mockOnSuccess).mockImplementation(() => {
      throw mockError;
    });

    await handleURL({
      url: 'https://example.com#test',
      sessionIdStorage: mockSessionIdStorage,
      onSuccess: mockOnSuccess,
      onError: mockOnError,
      onFinally: mockOnFinally,
    });

    expect(mockOnError).toHaveBeenCalledWith(mockError);
    expect(mockOnFinally).toHaveBeenCalled();
  });
});
