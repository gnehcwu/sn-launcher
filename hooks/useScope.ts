import useFetchDemandItems from './useFetchDemandItems';
import { fetchScopes } from '@/utils/api';
import { COMMAND_MODES } from '@/utils/configs/constants';

export default function useScope() {
  return useFetchDemandItems({
    fetchFn: fetchScopes,
    targetMode: COMMAND_MODES.SWITCH_SCOPE,
    reuse: true,
  });
}