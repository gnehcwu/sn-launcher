import browser from 'webextension-polyfill';

interface Message {
  action: string;
  url?: string;
  [key: string]: unknown;
}

/**
 * Sends a message to the background script and returns the response.
 * @param {Message} message - The message to send to the background script.
 * @returns {Promise<unknown>} - A promise that resolves with the response from the background script.
 */
export default async function messageBackground(message: Message): Promise<unknown> {
  try {
    const response = await browser.runtime.sendMessage(message);
    return response;
  } catch (_) {
    /* ignore */
  }
} 