import { toHex, updateParams } from 'expo-icp-frontend-helpers';
import { CryptoModule } from 'expo-crypto-universal';
import { StringValueStorageWrapper } from 'expo-storage-universal';
import { openBrowser } from './openBrowser';
import { DeepLinkConnectionParams } from 'expo-icp-app-connect-helpers';

/**
 * Parameters required to connect to an app.
 * @template C - The type of connection parameters that extends DeepLinkConnectionParams.
 */
export type ConnectToAppParams<C extends DeepLinkConnectionParams> = {
  /**
   * The URL of the app to connect to.
   */
  url: string;
  /**
   * The parameters to include in the connection.
   * Will be extended with a session ID and a deep link type.
   */
  params: C;
  /**
   * The path to redirect to after connecting to the app.
   * If undefined, any existing redirect path will be removed.
   */
  redirectPath: string | undefined;
  /**
   * The storage for managing the redirect path.
   */
  redirectPathStorage: StringValueStorageWrapper;
  /**
   * The storage for managing the session ID.
   */
  sessionIdStorage: StringValueStorageWrapper;
  /**
   * The crypto module used for generating a secure random session ID.
   */
  cryptoModule: CryptoModule;
};

/**
 * Connects to an app by establishing a secure session and opening it in a browser.
 *
 * This function:
 * 1. Manages the redirect path (saves or removes based on input)
 * 2. Generates a secure random session ID
 * 3. Saves the session ID for later verification
 * 4. Constructs the app URL with all necessary parameters
 * 5. Opens the app in a browser
 *
 * @template C - The type of connection parameters that extends DeepLinkConnectionParams.
 * @param {ConnectToAppParams<C>} params - The parameters required to connect to the app.
 * @param {string} params.url - The URL of the app to connect to.
 * @param {C} params.params - The parameters to include in the connection.
 * @param {string | undefined} params.redirectPath - The path to redirect to after connecting.
 * @param {StringValueStorageWrapper} params.redirectPathStorage - Storage for the redirect path.
 * @param {StringValueStorageWrapper} params.sessionIdStorage - Storage for the session ID.
 * @param {CryptoModule} params.cryptoModule - Crypto module for generating the session ID.
 * @returns {Promise<string>} A promise that resolves to the generated session ID.
 * @throws {Error} If any of the operations (saving, generating session ID, opening browser) fail.
 *
 */
export const connectToApp = async <C extends DeepLinkConnectionParams>({
  url,
  params,
  redirectPath,
  redirectPathStorage,
  sessionIdStorage,
  cryptoModule,
}: ConnectToAppParams<C>): Promise<string> => {
  try {
    if (redirectPath) {
      await redirectPathStorage.save(redirectPath);
    } else {
      await redirectPathStorage.remove();
    }
    const sessionId = toHex(await cryptoModule.getRandomBytes(32));
    await sessionIdStorage.save(sessionId);

    params.sessionId = sessionId;
    const appUrl = new URL(url);
    updateParams(appUrl.searchParams, params);

    await openBrowser(appUrl.toString());

    return sessionId;
  } catch (error) {
    console.error('Failed to connect to app:', error);
    throw error;
  }
};
