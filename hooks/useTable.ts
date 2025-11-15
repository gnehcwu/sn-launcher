import useFetchDemandItems from './useFetchDemandItems';
import { fetchTables } from '@/utils/api';
import { COMMAND_MODES } from '@/utils/configs/constants';

export default function useTable() {    
  return useFetchDemandItems({
    fetchFn: fetchTables,
    targetMode: COMMAND_MODES.TABLE,
    reuse: true,
  });
}
