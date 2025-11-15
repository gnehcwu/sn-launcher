import ReactDOM from "react-dom/client";
import Palette from "@/components/palette/Palette";
import { HOST_ELEMENT_ATTR_ID } from "@/utils/configs/constants";
import registerGckReceiver from "@/utils/resources/receiveGck";


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

        const applyTheme = () => {
          const isDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches;
          if (isDark) {
            wrapper.classList.add("dark");
            wrapper.style.colorScheme = "dark";
          } else {
            wrapper.classList.remove("dark");
            wrapper.style.colorScheme = "light";
          }
        };

        applyTheme();

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        mediaQuery.addEventListener("change", applyTheme);

        container.append(wrapper);

        const root = ReactDOM.createRoot(wrapper);
        root.render(
          <Palette />
        );

        return {
          root,
          wrapper,
          cleanup: () => mediaQuery.removeEventListener("change", applyTheme),
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
