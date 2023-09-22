import browser from 'webextension-polyfill';

export default async function messageBackground(message) {
  try {
    const resp = await browser.runtime.sendMessage(message);
    return resp;
  } catch (_) {
    /* ignore */
  }
}
