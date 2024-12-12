import useFetchDemandItems from './useFetchDemandItems';
import { fetchTables } from '../utilities/api';
import { COMMAND_MODES } from '../utilities/configs/constants';

export default function useTable() {    
  return useFetchDemandItems({
    fetchFn: fetchTables,
    targetMode: COMMAND_MODES.TABLE,
    reuse: true,
  });
}
