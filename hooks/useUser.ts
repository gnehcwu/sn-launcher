import useFetchDemandItems from './useFetchDemandItems';
import { fetchUsers } from '@/utils/api';
import { COMMAND_MODES } from '@/utils/configs/constants';

export default function useUser() {
  return useFetchDemandItems({
    fetchFn: fetchUsers,
    targetMode: COMMAND_MODES.IMPERSONATE,
    reuse: true,
  });
}
