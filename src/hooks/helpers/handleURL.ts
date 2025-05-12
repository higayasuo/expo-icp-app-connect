import { parseParams } from 'expo-icp-frontend-helpers';
import { StringValueStorageWrapper } from 'expo-storage-universal';
import { ParamsWithSessionId } from 'expo-icp-app-connect-helpers';

/**
 * Parameters for the handleURL function.
 * @template R - The type of result parameters.
 */
type HandleURLParams<R extends ParamsWithSessionId> = {
  /**
   * The URL to parse.
   */
  url: string;
  /**
   * The storage for session IDs.
   */
  sessionIdStorage: StringValueStorageWrapper;
  /**
   * Callback for successful parsing of URL.
   * @param resultParams - The parsed hash parameters.
   */
  onSuccess: (resultParams: R) => void;
  /**
   * Callback for errors during URL handling.
   * @param error - The error that occurred.
   */
  onError: (error: unknown) => void;

  onFinally?: () => void;
};

/**
 * Handles a URL by parsing its hash parameters and verifying the session ID.
 * @template R - The type of result parameters.
 * @param params - The parameters for handling the URL.
 * @returns A promise that resolves when the URL has been handled.
 */
export const handleURL = async <R extends ParamsWithSessionId>({
  url,
  sessionIdStorage,
  onSuccess,
  onError,
  onFinally,
}: HandleURLParams<R>): Promise<void> => {
  try {
    const resultParams = parseParams<R>(new URL(url).hash);
    const sessionId = await sessionIdStorage.find();

    if (Object.keys(resultParams).length === 0) {
      return;
    }

    if (!sessionId) {
      console.log('No session ID found');
      return;
    }

    if (sessionId !== resultParams.sessionId) {
      console.log(
        'sessionId',
        sessionId,
        'resultParams.sessionId',
        resultParams.sessionId,
      );
      console.warn('Session ID mismatch');
      return;
    }

    onSuccess(resultParams);
  } catch (error) {
    console.error('Failed to handle URL:', error);
    onError(error);
  } finally {
    onFinally?.();
  }
};
