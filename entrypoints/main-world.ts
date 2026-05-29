export default defineContentScript({
  matches: ["*://*/*"],
  world: "MAIN",
  runAt: "document_start",

  main() {
    const SN_LAUNCHER_SEND_GCK_EVENT = "sn-launcher-send-gck";
    const SN_LAUNCHER_RECAPTURE_GCK_EVENT = "sn-launcher-recapture-gck";
    const SN_LAUNCHER_SEND_SCOPE_EVENT = "sn-launcher-send-scope";
    const SN_LAUNCHER_SEND_USER_EVENT = "sn-launcher-send-user";

    function readGck(): string | undefined {
      return (window as any)?.g_ck;
    }

    function readScope(): string | undefined {
      return (window as any)?.g_user?.app?.sys_id;
    }

    // The current session's user sys_id. While impersonating this is the
    // impersonated user; captured so "Stop impersonating" can remember the
    // original admin (the value present *before* impersonation begins).
    function readUser(): string | undefined {
      return (window as any)?.g_user?.userID;
    }

    function postSnapshot() {
      const gck = readGck();
      const scope = readScope();
      const user = readUser();

      if (gck) {
        window.postMessage({ from: SN_LAUNCHER_SEND_GCK_EVENT, gck });
      }
      if (scope) {
        window.postMessage({ from: SN_LAUNCHER_SEND_SCOPE_EVENT, scope });
      }
      if (user) {
        window.postMessage({ from: SN_LAUNCHER_SEND_USER_EVENT, user });
      }
    }

    function pollSnapshot(maxRetries = 20, interval = 100) {
      let retries = 0;

      function attempt() {
        // Post whatever is available now (gck unblocks the palette; scope/user
        // may lag a tick). Keep polling until we've also captured the user id —
        // g_ck is a plain global set early, but g_user is an object that often
        // initializes slightly later, and userID is required for stop-impersonate.
        const haveGck = !!readGck();
        if (haveGck) postSnapshot();

        const done = haveGck && !!readUser();
        if (!done && retries < maxRetries) {
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
