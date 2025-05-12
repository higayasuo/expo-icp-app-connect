import * as WebBrowser from 'expo-web-browser';

/**
 * Opens a browser with the specified URL.
 * @param {string} url - The URL to open in the browser.
 * @returns {Promise<void>} A promise that resolves when the browser is opened.
 */
export const openBrowser = async (url: string): Promise<void> => {
  await WebBrowser.openBrowserAsync(url, {
    windowName: '_self',
  });
};