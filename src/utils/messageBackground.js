import browser from 'webextension-polyfill';

/**
 * Sends a message to the background script and returns the response.
 * @param {Object} message - The message to send to the background script.
 * @returns {Promise<Object>} - A promise that resolves with the response from the background script.
 */
export default async function messageBackground(message) {
  try {
    const resp = await browser.runtime.sendMessage(message);
    return resp;
  } catch (_) {
    /* ignore */
  }
}
