import useFetchDemandItems from '@hooks/useFetchDemandItems';
import { fetchHistory } from '@utilities/api';
import { COMMAND_MODES } from '@utilities/configs/constants';

export default function useHistory() {
  return useFetchDemandItems({
    fetchFn: fetchHistory,
    targetMode: COMMAND_MODES.HISTORY,
    reuse: false,
  });
} 