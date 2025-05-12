import { useState, useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useRouter, Href } from 'expo-router';

import { handleURL } from './helpers/handleURL';
import { Storage, StringValueStorageWrapper } from 'expo-storage-universal';
import { dismissBrowser } from './helpers/dismissBrowser';
import { CryptoModule } from 'expo-crypto-universal';
import { connectToApp } from './helpers/connectToApp';
import { DeepLinkConnectionParams, ParamsWithSessionId } from 'expo-icp-app-connect-helpers';
/**
 * Parameters for the useIIIntegration hook.
 */
type UseAppConnectParams = {
  /**
   * The namespace of the target application.
   */
  namespace: string;
  /**
   * The regular storage.
   */
  regularStorage: Storage;
  /**
   * The crypto module.
   */
  cryptoModule: CryptoModule;
};

type ConnectToAppOuterParams<C extends DeepLinkConnectionParams> = {
  url: string;
  params: C;
  redirectPath: string | undefined;
};

type UseAppConnectResult<C extends DeepLinkConnectionParams, R extends ParamsWithSessionId> = {
  appConnectResultParams: R | undefined;
  appConnectError: unknown | undefined;
  clearAppConnectError: () => void;
  connectToApp: (outerParams: ConnectToAppOuterParams<C>) => Promise<string>;
};

export const useAppConnect = <C extends DeepLinkConnectionParams, R extends ParamsWithSessionId>({
  namespace,
  regularStorage,
  cryptoModule,
}: UseAppConnectParams): UseAppConnectResult<C, R> => {
  const url = Linking.useURL();
  const [appConnectError, setAppConnectError] = useState<unknown | undefined>(
    undefined,
  );
  const router = useRouter();
  const [appConnectResultParams, setAppConnectResultParams] = useState<
    R | undefined
  >(undefined);

  const sessionIdStorage = new StringValueStorageWrapper(
    regularStorage,
    `${namespace}.sessionId`,
  );
  const redirectPathStorage = new StringValueStorageWrapper(
    regularStorage,
    `${namespace}.redirectPath`,
  );

  useEffect(() => {
    if (!url) {
      return;
    }

    handleURL<R>({
      url,
      sessionIdStorage,
      onSuccess: async (params: R) => {
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
    connectToApp: ({ url, params, redirectPath }: ConnectToAppOuterParams<C>) =>
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
