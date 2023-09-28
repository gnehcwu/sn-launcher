import React from 'react';
import styled from 'styled-components';
import useLauncherStore from '../../store/launcherStore';
import { Search as SearchIcon, CornerDownLeft, Loader } from 'react-feather';
import { isValidShortcut, IsValidSysId } from '../../utils/helpers';
import {
  isActionsMode,
  isSwitchAppMode,
  isCompactMode,
  getCommandLabelAndPlaceholder,
  COMMAND_MODES,
} from '../../configs/commands';

const FilterContainer = styled.div`
  display: grid;
  grid-template-columns: ${(props) => props.$layout};
  align-items: center;
  justify-content: center;
  column-gap: 12px;
  padding: 16px;
`;

const Input = styled.input.attrs(() => ({
  type: 'text',
  autoComplete: 'off',
  autoCorrect: 'off',
  spellCheck: false,
}))`
  box-shadow: none;
  border: none;
  outline: none;
  caret-color: var(--sn-launcher-text-primary);
  color: var(--sn-launcher-text-primary);

  width: 100%;
  font-size: 1.75em;
  line-height: 1.75em;
  padding: 0;
  background-color: transparent;

  &::placeholder {
    color: var(--sn-launcher-text-info);
  }

  &:focus,
  &:active {
    outline: none;
  }
`;

const Mode = styled.span`
  color: white;
  border-radius: 4px;
  border-radius: 9999px;
  white-space: nowrap;
  background-color: var(--sn-launcher-brand);
  padding: 5px 10px;
  font-size: 1.3em;
  font-weight: 500;
  user-select: none;

  @media (prefers-color-scheme: dark) {
    color: var(--sn-launcher-text-primary);
  }
`;

const Mark = styled.span`
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  user-select: none;
`;

const MarkText = styled.span`
  color: var(--sn-launcher-text-info);
  font-size: 1.35em;
  font-weight: 500;
`;

const MarkTextSign = styled.span`
  display: inline-grid;
  place-content: center;
  background-color: var(--sn-launcher-surface-info);
  border-radius: 4px;
  padding: 5px;
  color: var(--sn-launcher-text-secondary);
  font-size: 1.25em;
  font-weight: 500;
  letter-spacing: 1px;
`;

const StyledSearchIcon = styled(SearchIcon)`
  color: var(--sn-launcher-text-primary);
`;

const StyledEnterIcon = styled(CornerDownLeft)`
  color: var(--sn-launcher-text-secondary);
  opacity: 0.8;
`;

const StyledLoader = styled(Loader)`
  color: var(--sn-launcher-brand);
  animation: spin 1s linear infinite;
  transform-origin: center;

  @keyframes spin {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

function Filter(_, ref) {
  const filter = useLauncherStore((state) => state.filter);
  const commandMode = useLauncherStore((state) => state.commandMode);
  const updateFilter = useLauncherStore((state) => state.updateFilter);
  const updateSelected = useLauncherStore((state) => state.updateSelected);
  const isLoading = useLauncherStore((state) => state.isLoading);
  const updateCommandMode = useLauncherStore((state) => state.updateCommandMode);
  const isCompact = isCompactMode(commandMode);
  const isActions = isActionsMode(commandMode);
  const isSwitchingApp = isSwitchAppMode(commandMode);
  const actionsLayout =
    isActions || isSwitchingApp
      ? 'auto auto 1fr'
      : isCompact
      ? 'auto auto 1fr auto'
      : 'auto 1fr auto';

  function handleChange(event) {
    const inputVal = event.target.value;
    const trimmedInputVal = inputVal.trim();
    if (IsValidSysId(trimmedInputVal)) {
      updateCommandMode(COMMAND_MODES.FIND_RECORD);
    } else if (isValidShortcut(trimmedInputVal)) {
      updateCommandMode(COMMAND_MODES.GO_TO);
    }

    updateFilter(inputVal);
    updateSelected(0);
  }

  const renderTips = () => {
    if (isCompact && isLoading) {
      return <StyledLoader size={18} />;
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
  };

  const [label, placeholder = ''] = getCommandLabelAndPlaceholder(commandMode);

  return (
    <FilterContainer $layout={actionsLayout}>
      <StyledSearchIcon size={16} />
      {commandMode !== '' && <Mode>{label}</Mode>}
      <Input
        placeholder={commandMode ? placeholder : 'Type to search'}
        value={filter}
        onChange={handleChange}
        ref={ref}
      />
      {renderTips()}
    </FilterContainer>
  );
}

export default React.forwardRef(Filter);
