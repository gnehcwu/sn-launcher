import { SN_LAUNCHER_SEND_GCK_EVENT } from '../utilities/configs/constants';
import useLauncherStore from '../store/launcherStore';

type GckEvent = {
  data: {
    from: string;
    gck: string;
  };
};

const receiveGck = async (event: GckEvent) => {
  if (event.data.from === SN_LAUNCHER_SEND_GCK_EVENT) {
    const { gck } = event.data;
    useLauncherStore.getState().updateToken(gck);
  }
};

export default function injectGckReceiver() {
  window.addEventListener('message', receiveGck as (ev: MessageEvent) => void);
}
