export default defineContentScript({
  matches: ["*://*/*"],
  world: "MAIN",
  runAt: "document_start",

  main() {
    const SN_LAUNCHER_SEND_GCK_EVENT = "sn-launcher-send-gck";
    const SN_LAUNCHER_RECAPTURE_GCK_EVENT = "sn-launcher-recapture-gck";
    const SN_LAUNCHER_SEND_SCOPE_EVENT = "sn-launcher-send-scope";

    function readGck(): string | undefined {
      return (window as any)?.g_ck;
    }

    function readScope(): string | undefined {
      return (window as any)?.g_user?.app?.sys_id;
    }

    function postSnapshot() {
      const gck = readGck();
      const scope = readScope();

      if (gck) {
        window.postMessage({ from: SN_LAUNCHER_SEND_GCK_EVENT, gck });
      }
      if (scope) {
        window.postMessage({ from: SN_LAUNCHER_SEND_SCOPE_EVENT, scope });
      }
    }

    function pollSnapshot(maxRetries = 10, interval = 100) {
      let retries = 0;

      function attempt() {
        if (readGck()) {
          postSnapshot();
        } else if (retries < maxRetries) {
          retries++;
          setTimeout(attempt, interval);
        }
      }

      attempt();
    }

    // Initial capture
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => pollSnapshot());
    } else {
      pollSnapshot();
    }

    // On-demand recapture (triggered by content script on 401)
    window.addEventListener("message", (event: MessageEvent) => {
      if (event?.data?.from === SN_LAUNCHER_RECAPTURE_GCK_EVENT) {
        postSnapshot();
      }
    });
  },
});
