import useFetchDemandItems from './useFetchDemandItems';
import { fetchScopes } from '@utilities/api';
import { COMMAND_MODES } from '@utilities/configs/constants';

export default function useScope() {
  return useFetchDemandItems({
    fetchFn: fetchScopes,
    targetMode: COMMAND_MODES.SWITCH_SCOPE,
    reuse: true,
  });
}