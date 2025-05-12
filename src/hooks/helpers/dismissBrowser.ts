import * as WebBrowser from 'expo-web-browser';

/**
 * Dismisses the web browser.
 */
export const dismissBrowser = async (): Promise<void> => {
  setTimeout(async () => {
    await WebBrowser.dismissBrowser();
  }, 500);
};