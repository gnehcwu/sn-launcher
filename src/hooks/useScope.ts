import useFetchDemandItems from './useFetchDemandItems';
import { fetchScopes } from '../utilities/api';
import { COMMAND_MODES } from '../utilities/configs/commands';

export default function useScope() {
  
  return useFetchDemandItems({
    fetchFn: fetchScopes,
    targetMode: COMMAND_MODES.SWITCH_SCOPE,
    reuse: true,
  });
}