import { parseParams } from 'expo-icp-frontend-helpers';
import { StringValueStorageWrapper } from 'expo-storage-universal';
import { ParamsWithSessionId } from 'expo-icp-app-connect-helpers';

/**
 * Parameters for the handleURL function.
 * @template H - The type of hash parameters.
 */
type HandleURLParams<H extends ParamsWithSessionId> = {
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
   * @param hashParams - The parsed hash parameters.
   */
  onSuccess: (hashParams: H) => void;
  /**
   * Callback for errors during URL handling.
   * @param error - The error that occurred.
   */
  onError: (error: unknown) => void;

  onFinally?: () => void;
};

/**
 * Handles a URL by parsing its hash parameters and verifying the session ID.
 * @template H - The type of hash parameters.
 * @param params - The parameters for handling the URL.
 * @returns A promise that resolves when the URL has been handled.
 */
export const handleURL = async <H extends ParamsWithSessionId>({
  url,
  sessionIdStorage,
  onSuccess,
  onError,
  onFinally,
}: HandleURLParams<H>): Promise<void> => {
  try {
    const hashParams = parseParams<H>(new URL(url).hash);
    const sessionId = await sessionIdStorage.find();

    if (Object.keys(hashParams).length === 0) {
      return;
    }

    if (!sessionId) {
      console.log('No session ID found');
      return;
    }

    if (sessionId !== hashParams.sessionId) {
      console.log(
        'sessionId',
        sessionId,
        'hashParams.sessionId',
        hashParams.sessionId,
      );
      console.warn('Session ID mismatch');
      return;
    }

    onSuccess(hashParams);
  } catch (error) {
    console.error('Failed to handle URL:', error);
    onError(error);
  } finally {
    onFinally?.();
  }
};
