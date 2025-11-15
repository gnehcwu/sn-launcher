import useFetchDemandItems from './useFetchDemandItems';
import { fetchHistory } from '@/utils/api';
import { COMMAND_MODES } from '@/utils/configs/constants';

export default function useHistory() {
  return useFetchDemandItems({
    fetchFn: fetchHistory,
    targetMode: COMMAND_MODES.HISTORY,
    reuse: false,
  });
} 