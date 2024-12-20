import { SN_LAUNCHER_SEND_GCK_EVENT } from '@utilities/configs/constants';

function sendGck(maxRetries = 10, interval = 100) {
  let retries = 0;

  function trySendGck() {
    const gck = (window as any)?.g_ck;

    if (gck) {
      window.postMessage({
        from: SN_LAUNCHER_SEND_GCK_EVENT,
        gck: gck,
      });
    } else if (retries < maxRetries) {
      retries++;
      setTimeout(trySendGck, interval);
    }
  }

  trySendGck();
}

sendGck();
