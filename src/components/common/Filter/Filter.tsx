import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import useLauncherStore from '../../../store/launcherStore';
import { isValidShortcut, isValidSysId } from '../../../utilities/validation';
import {
  isActionsMode,
  isSwitchScopeMode,
  isTableMode,
  isCompactMode,
  getCommandLabelAndPlaceholder,
  COMMAND_MODES,
  isHistoryMode,
} from '../../../utilities/configs/commands';
import Loader from '../../shared/Loader';
import {
  FilterContainer,
  Input,
  Mode,
  Mark,
  MarkText,
  MarkTextSign,
  StyledSearchIcon,
  StyledEnterIcon,
} from './Filter.styles';

function Filter() {
  const filter = useLauncherStore((state) => state.filter);
  const isLoading = useLauncherStore((state) => state.isLoading);
  const commandMode = useLauncherStore((state) => state.commandMode);
  const updateFilter = useLauncherStore((state) => state.updateFilter);
  const updateCommandMode = useLauncherStore((state) => state.updateCommandMode);

  const filterRef = useRef<HTMLInputElement>(null);

  const isCompact = isCompactMode(commandMode);
  const isActions = isActionsMode(commandMode);
  const isSwitchingApp = isSwitchScopeMode(commandMode);
  const isTable = isTableMode(commandMode);
  const isHistories = isHistoryMode(commandMode);

  const actionsLayout = useMemo(() => {
    if (isActions || isSwitchingApp || isHistories || isTable) {
      return 'auto auto 1fr';
    }
    return isCompact ? 'auto auto 1fr auto' : 'auto 1fr auto';
  }, [isActions, isSwitchingApp, isHistories, isTable, isCompact]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputVal = event.target.value;

      if (isValidSysId(inputVal)) {
        updateCommandMode(COMMAND_MODES.FIND_RECORD);
      } else if (isValidShortcut(inputVal)) {
        updateCommandMode(COMMAND_MODES.GO_TO);
      }

      updateFilter(inputVal);
    },
    [updateCommandMode, updateFilter],
  );

  const renderTips = useCallback(() => {
    if (isCompact && isLoading) {
      return <Loader size={18} stroke={2} />;
    }

    if (isCompact) {
      return (
        <Mark>
          <MarkText>Search</MarkText>
          <StyledEnterIcon size={18} />
        </Mark>
      );
    }

    if (!commandMode) {
      return (
        <Mark>
          <MarkText>Search Actions</MarkText>
          <MarkTextSign>Tab</MarkTextSign>
        </Mark>
      );
    }

    return null;
  }, [isCompact, isLoading, commandMode]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filterRef.current) {
        filterRef.current.focus();
        filterRef.current.selectionStart = filterRef.current.selectionEnd =
          filterRef.current.value.length;
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [commandMode]);

  const [label, placeholder = ''] = getCommandLabelAndPlaceholder(commandMode);

  return (
    <FilterContainer $layout={actionsLayout}>
      <StyledSearchIcon size={16} />
      {commandMode !== '' && <Mode>{label}</Mode>}
      <Input
        placeholder={commandMode ? placeholder : 'Search application menus...'}
        value={filter}
        onChange={handleChange}
        ref={filterRef}
        autoFocus
      />
      {renderTips()}
    </FilterContainer>
  );
}

export default Filter;
