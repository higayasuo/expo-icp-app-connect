import { useState, useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useRouter, Href } from 'expo-router';

import { handleURL } from './helpers/handleURL';
import { Storage, StringValueStorageWrapper } from 'expo-storage-universal';
import { dismissBrowser } from './helpers/dismissBrowser';
import { CryptoModule } from 'expo-crypto-universal';
import { connectToApp } from './helpers/connectToApp';
import { DeepLinkConnectionParams } from 'expo-icp-app-connect-helpers';
/**
 * Parameters for the useIIIntegration hook.
 */
type UseAppConnectParams = {
  /**
   * The name of the target application.
   */
  targetName: string;
  /**
   * The regular storage.
   */
  regularStorage: Storage;
  /**
   * The crypto module.
   */
  cryptoModule: CryptoModule;
};

type ConnectToAppOuterParams<P extends DeepLinkConnectionParams> = {
  url: string;
  params: P;
  redirectPath: string | undefined;
};

type UseAppConnectResult<P extends DeepLinkConnectionParams> = {
  appConnectResultParams: P | undefined;
  appConnectError: unknown | undefined;
  clearAppConnectError: () => void;
  connectToApp: (outerParams: ConnectToAppOuterParams<P>) => Promise<string>;
};

export const useAppConnect = <P extends DeepLinkConnectionParams>({
  targetName,
  regularStorage,
  cryptoModule,
}: UseAppConnectParams): UseAppConnectResult<P> => {
  const url = Linking.useURL();
  const [appConnectError, setAppConnectError] = useState<unknown | undefined>(
    undefined,
  );
  const router = useRouter();
  const [appConnectResultParams, setAppConnectResultParams] = useState<
    P | undefined
  >(undefined);

  const sessionIdStorage = new StringValueStorageWrapper(
    regularStorage,
    `${targetName}.sessionId`,
  );
  const redirectPathStorage = new StringValueStorageWrapper(
    regularStorage,
    `${targetName}.redirectPath`,
  );

  useEffect(() => {
    if (!url) {
      return;
    }

    handleURL<P>({
      url,
      sessionIdStorage,
      onSuccess: async (params: P) => {
        setAppConnectResultParams(params);
        const path = await redirectPathStorage.find();

        if (path) {
          router.replace(path as Href);
        }

        dismissBrowser();
      },
      onError: setAppConnectError,
      onFinally: async () => {
        await sessionIdStorage.remove();
        await redirectPathStorage.remove();
      },
    });
  }, [url]);

  return {
    appConnectResultParams,
    connectToApp: ({ url, params, redirectPath }: ConnectToAppOuterParams<P>) =>
      connectToApp({
        url,
        params,
        redirectPath,
        redirectPathStorage,
        sessionIdStorage,
        cryptoModule,
      }),
    appConnectError,
    clearAppConnectError: () => setAppConnectError(undefined),
  };
};
