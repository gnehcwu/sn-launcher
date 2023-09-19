import React from 'react';
import styled from 'styled-components';
import Loader from '../Loader';
import { getCommandFullLabel } from '../../configs/commands';
import useLauncherStore from '../../store/launcherStore';

const FilterContainer = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  border-bottom: 1px solid var(--sn-launcher-separator);
`;

const Input = styled.input.attrs(() => ({
  type: 'text',
  autoComplete: 'off',
  autoCorrect: 'off',
  spellCheck: false,
  autoFocus: true,
}))`
  box-shadow: none;
  border: none;
  outline: none;
  caret-color: var(--sn-launcher-brand);
  color: var(--sn-launcher-brand);

  width: 100%;
  margin: 16px 16px 8px;
  padding: 8px;
  font-size: 2em;
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
  background-color: var(--sn-launcher-surface-content);
  color: var(--sn-launcher-text-secondary);
  border-radius: 4px;
  font-size: 1.75em;
  margin-left: 16px;
  padding: 6px 8px;
  white-space: nowrap;
`;

const Loading = styled(Loader)`
  position: absolute;
  right: 16px;
  top: 26px;
`;

function Filter(_, ref) {
  const filter = useLauncherStore((state) => state.filter);
  const isLoading = useLauncherStore((state) => state.isLoading);
  const commandMode = useLauncherStore((state) => state.commandMode);
  const updateFilter = useLauncherStore((state) => state.updateFilter);
  const updateSelected = useLauncherStore((state) => state.updateSelected);

  function handleChange(event) {
    updateFilter(event.target.value);
    updateSelected(0);
  }

  return (
    <FilterContainer>
      {commandMode !== '' && <Mode>{getCommandFullLabel(commandMode)}</Mode>}
      <Input
        placeholder={commandMode ? '' : 'Type to search'}
        value={filter}
        onChange={handleChange}
        ref={ref}
      />
      {isLoading && <Loading />}
    </FilterContainer>
  );
}

export default React.forwardRef(Filter);
