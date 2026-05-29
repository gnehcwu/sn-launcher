import useFetchDemandItems from './useFetchDemandItems';
import { fetchUpdateSets } from '@/utils/api';
import { COMMAND_MODES } from '@/utils/configs/constants';

export default function useUpdateSet() {
  return useFetchDemandItems({
    fetchFn: fetchUpdateSets,
    targetMode: COMMAND_MODES.SWITCH_UPDATE_SET,
    // Refetch on each entry (not cached) — in-progress sets change often.
    reuse: false,
  });
}
