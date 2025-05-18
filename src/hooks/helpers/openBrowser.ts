import * as WebBrowser from 'expo-web-browser';
import { isWeb } from 'expo-crypto-universal';

/**
 * Options for opening a browser.
 * @property {boolean} [inNewTab] - Whether to open the browser in a new tab.
 */
type OpenBrowserOptions = {
  inNewTab?: boolean;
};

/**
 * Opens a browser with the specified URL.
 * @param {string} url - The URL to open in the browser.
 * @param {OpenBrowserOptions} options - The options for opening the browser.
 * @returns {Promise<void>} A promise that resolves when the browser is opened.
 */
export const openBrowser = async (url: string, options: OpenBrowserOptions = {}): Promise<void> => {
  if (isWeb() && options.inNewTab) {
    window.open(url, '_blank');
  } else {
    await WebBrowser.openBrowserAsync(url, {
      windowName: '_self',
    });
  }
};