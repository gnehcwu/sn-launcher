export default defineContentScript({
  matches: ["*://*/*"],
  world: "MAIN",
  runAt: "document_start",

  main() {
    const SN_LAUNCHER_SEND_GCK_EVENT = "sn-launcher-send-gck";

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

    // Wait for page to load before trying to get GCK
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => sendGck());
    } else {
      sendGck();
    }
  },
});
