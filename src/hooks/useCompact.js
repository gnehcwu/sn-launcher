import React from 'react';

export default function useCompact(commandMode) {
  return React.useMemo(() => commandMode && commandMode !== 'switch_app', [commandMode]);
}
