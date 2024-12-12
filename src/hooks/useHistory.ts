import useFetchDemandItems from './useFetchDemandItems';
import { fetchHistory } from '../utilities/api';
import { COMMAND_MODES } from '../utilities/configs/commands';

export default function useHistory() {
  
  return useFetchDemandItems({
    fetchFn: fetchHistory,
    targetMode: COMMAND_MODES.HISTORY,
    reuse: false,
  });
} 