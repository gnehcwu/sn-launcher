import ReactDOM from "react-dom/client";
import Palette from "@/components/palette/Palette";
import { HOST_ELEMENT_ATTR_ID } from "@/utils/configs/constants";
import registerGckReceiver from "@/utils/resources/receiveGck";
import { applyTheme, subscribeTheme } from "@/utils/theme";


export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: "ui",

  async main(ctx) {
    // Register gck receiver before injecting gck sender to make sure gck will be captured
    registerGckReceiver();

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
