import React, { useCallback, useEffect, useRef } from 'react';
import useLauncherStore from '../../../store/launcherStore';
import { isValidShortcut, isValidSysId } from '../../../utilities/validation';
import {
  isCompactLayoutMode,
  getCommandLabelAndPlaceholder,
} from '../../../utilities/configs/commands';
import { COMMAND_MODES } from '../../../utilities/configs/constants';
import { Loader } from '../../shared';
import {
  FilterContainer,
  Input,
  Mode,
  Mark,
  MarkText,
  KeyboardTab,
  StyledSearchIcon,
  StyledEnterIcon,
} from './Filter.styles';

type HintConfig = {
  text?: string;
  icon: React.ReactNode;
};

const HINT_CONFIG: Record<string, HintConfig> = {
  loadingCompact: {
    icon: <Loader size={18} stroke={2} />,
  },
  compact: {
    text: 'Search',
    icon: <StyledEnterIcon size={18} />,
  },
  default: {
    text: 'More Actions',
    icon: <KeyboardTab>Tab</KeyboardTab>,
  },
};

function Filter() {
  const filter = useLauncherStore((state) => state.filter);
  const isLoading = useLauncherStore((state) => state.isLoading);
  const commandMode = useLauncherStore((state) => state.commandMode);
  const updateFilter = useLauncherStore((state) => state.updateFilter);
  const updateCommandMode = useLauncherStore((state) => state.updateCommandMode);

  const filterRef = useRef<HTMLInputElement>(null);

  const isCompact = isCompactLayoutMode(commandMode);

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

  const renderHints = () => {
    if (isCompact && isLoading) {
      return HINT_CONFIG.loadingCompact.icon;
    }

    const hintConfig = isCompact ? HINT_CONFIG.compact : !commandMode ? HINT_CONFIG.default : null;

    if (!hintConfig) return null;

    return (
      <Mark>
        <MarkText>{hintConfig.text}</MarkText>
        {hintConfig.icon}
      </Mark>
    );
  };

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
    <FilterContainer $commandMode={commandMode}>
      <StyledSearchIcon size={16} />
      {commandMode !== '' && <Mode>{label}</Mode>}
      <Input
        placeholder={commandMode ? placeholder : 'Type to search all menus...'}
        value={filter}
        onChange={handleChange}
        ref={filterRef}
        autoFocus
      />
      {renderHints()}
    </FilterContainer>
  );
}

export default Filter;
