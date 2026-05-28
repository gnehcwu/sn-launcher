import {
  SN_LAUNCHER_SEND_GCK_EVENT,
  SN_LAUNCHER_SEND_SCOPE_EVENT,
} from '@/utils/configs/constants';
import useLauncherStore from '@/utils/launcherStore';

interface IncomingMessage {
  data?: {
    from?: string;
    gck?: string;
    scope?: string;
  };
}

const receive = (event: IncomingMessage) => {
  const from = event?.data?.from;
  if (from === SN_LAUNCHER_SEND_GCK_EVENT && event.data?.gck) {
    useLauncherStore.getState().setToken(event.data.gck);
  } else if (from === SN_LAUNCHER_SEND_SCOPE_EVENT && event.data?.scope) {
    useLauncherStore.getState().setScope(event.data.scope);
  }
};

export default function registerGckReceiver() {
  window.addEventListener('message', receive as (ev: MessageEvent) => void);
}
