import ReactDOM from "react-dom/client";
import Palette from "@/components/palette/Palette";
import { HOST_ELEMENT_ATTR_ID } from "@/utils/configs/constants";
import registerGckReceiver from "@/utils/resources/receiveGck";
import { markRevalidationTrigger } from "@/utils/api/cache";
import { applyTheme, subscribeTheme } from "@/utils/theme";


export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: "ui",

  async main(ctx) {
    // Register gck receiver before injecting gck sender to make sure gck will be captured
    registerGckReceiver();

    // Mark a revalidation trigger only when the tab GENUINELY becomes visible
    // again — i.e. the user switched away (another tab/app) and came back, where
    // they may have changed something elsewhere (e.g. installed a plugin in
    // another tab). The palette's cache then refetches once on the next access.
    //
    // We deliberately do NOT listen to `window` "focus": it fires for in-page
    // focus shifts that are NOT a tab switch (clicking from DevTools back into
    // the page, the address bar, etc.), each of which would spuriously re-arm a
    // refetch and make the lists reload on essentially every mode-entry. While
    // the tab stays visible (the user is just operating in the palette),
    // visibilitychange never fires, so nothing refetches until the TTL.
    // ctx auto-removes this on content-script invalidation.
    ctx.addEventListener(document, "visibilitychange", () => {
      if (document.visibilityState === "visible") markRevalidationTrigger();
    });

    await injectScript("/main-world.js", {
      keepInDom: true,
    })

    const ui = await createShadowRootUi(ctx, {
      name: HOST_ELEMENT_ATTR_ID,
      position: "inline",
      anchor: "body",
      append: "first",
      onMount: (container) => {
        const wrapper = document.createElement("div");
        container.append(wrapper);

        const unsubscribe = subscribeTheme((resolved) => applyTheme(wrapper, resolved));

        const root = ReactDOM.createRoot(wrapper);
        root.render(
          <Palette />
        );

        return {
          root,
          wrapper,
          cleanup: unsubscribe,
        };
      },
      onRemove: (elements) => {
        elements?.cleanup?.();
        elements?.root.unmount();
        elements?.wrapper.remove();
      },
    });

    ui.mount();
  },
});
