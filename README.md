# expo-icp-app-connect
This project provides hooks for invoking another application from the frontend and receiving result via deep link in Internet Computer (ICP) applications.

## API

### `useAppConnect`
A React hook for managing deep link connections to other apps, handling session, redirect, and result state. Now supports generics for connection and result parameter types.

#### Type Requirements
- `YourConnectionParams` **must extend** `DeepLinkConnectionParams` (from `expo-icp-app-connect-helpers`).
- `YourResultParams` **must extend** `ParamsWithSessionId` (from `expo-icp-app-connect-helpers`).

This ensures type safety for the connection and result parameters used in the hook.

```ts
import { useAppConnect } from 'expo-icp-app-connect';
import { DeepLinkConnectionParams, ParamsWithSessionId } from 'expo-icp-app-connect-helpers';

// Example custom types
interface MyConnectionParams extends DeepLinkConnectionParams {
  // ...other fields
}

interface MyResultParams extends ParamsWithSessionId {
  // ...fields returned from the deep link
}

const {
  appConnectResultParams,
  appConnectError,
  clearAppConnectError,
  connectToApp,
  buildAppConnectionParams,
} = useAppConnect<MyConnectionParams, MyResultParams>({
  pathname: '/myApp',
  regularStorage,
  cryptoModule,
});
```

- `appConnectResultParams`: The parameters received from the deep link, or `undefined` if not available.
- `appConnectError`: Any error encountered during the connection process.
- `clearAppConnectError()`: Clears the current error.
- `connectToApp({ url, params, redirectPath })`: Initiates a connection to another app. Returns a Promise resolving to the session ID.
- `buildAppConnectionParams(params)`: Builds connection parameters with the current pathname. Returns the connection parameters of type `YourConnectionParams`.

#### Parameters
- `pathname: string` – The pathname of the page to redirect to (used for storage keys).
- `regularStorage: Storage` – Storage instance for session and redirect path.
- `cryptoModule: CryptoModule` – Crypto module for generating secure session IDs.

---

### `connectToApp`
Establishes a secure session and opens the target app in a browser with the required parameters.

```ts
import { connectToApp } from 'expo-icp-app-connect';

await connectToApp<MyConnectionParams>({
  url: new URL('https://target.app'),
  params: { ... },
  redirectPath: '/return',
  redirectPathStorage,
  sessionIdStorage,
  cryptoModule,
  openBrowserOptions: { inNewTab: true },
});
```

#### Parameters
- `url: URL` – The URL of the app to connect to.
- `params: DeepLinkConnectionParams` – Parameters to include in the connection (will be extended with a session ID and deep link type).
- `redirectPath: string | undefined` – Path to redirect to after connecting.
- `redirectPathStorage: StringValueStorageWrapper` – Storage for the redirect path.
- `sessionIdStorage: StringValueStorageWrapper` – Storage for the session ID.
- `cryptoModule: CryptoModule` – Crypto module for generating the session ID.
- `openBrowserOptions?: OpenBrowserOptions` – Optional configuration for opening the browser.
  - `inNewTab?: boolean` – Whether to open in a new tab (web environments only).

Returns a Promise resolving to the generated session ID.

---

### `dismissBrowser`
Dismisses the web browser after a short delay (500ms).

```ts
import { dismissBrowser } from 'expo-icp-app-connect';
await dismissBrowser();
```

---

### `handleURL`
Parses a URL, verifies the session ID, and invokes callbacks for success or error.

```ts
import { handleURL } from 'expo-icp-app-connect';

await handleURL({
  url: new URL('https://example.com#test'),
  sessionIdStorage,
  onSuccess: (params) => { /* handle params */ },
  onError: (error) => { /* handle error */ },
  onFinally: () => { /* optional cleanup */ },
});
```

#### Parameters
- `url: URL` – The URL to parse.
- `sessionIdStorage: StringValueStorageWrapper` – Storage for the session ID.
- `onSuccess: (params) => void` – Callback for successful parsing and session verification.
- `onError: (error) => void` – Callback for errors.
- `onFinally?: () => void` – Optional cleanup callback.

---

### `openBrowser`
Opens a browser window with the specified URL. In web environments, supports opening in a new tab.

```ts
import { openBrowser } from 'expo-icp-app-connect';

// Open in current window/tab
await openBrowser('https://target.app');

// Open in new tab (web only)
await openBrowser('https://target.app', { inNewTab: true });
```

#### Parameters
- `url: string` – The URL to open in the browser.
- `options: OpenBrowserOptions` – Optional configuration.
  - `inNewTab?: boolean` – Whether to open in a new tab (web environments only).
