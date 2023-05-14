import React from 'react';
import styled from 'styled-components';
import Loader from '../Loader';
import { getCommandLabel } from '../../configs/commands';
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
}))`
  box-shadow: none;
  border: none;
  outline: none;
  caret-color: var(--sn-launcher-brand);

  width: 100%;
  margin: 12px 16px;
  padding: 8px;
  font-size: 2em;
  color: var(--sn-launcher-text-primary);
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
  const [isLoading, filter, commandMode, updateFilter, updateSelected] = useLauncherStore(
    (state) => [
      state.isLoading,
      state.filter,
      state.commandMode,
      state.updateFilter,
      state.updateSelected,
    ],
  );

  function handleInput(event) {
    updateFilter(event.target.value);
    updateSelected(0);
  }

  return (
    <FilterContainer>
      {commandMode !== '' && <Mode>{getCommandLabel(commandMode)}</Mode>}
      <Input
        placeholder={commandMode ? '' : 'Type to search'}
        value={filter}
        onChange={handleInput}
        ref={ref}
      />
      {isLoading && <Loading />}
    </FilterContainer>
  );
}

export default React.forwardRef(Filter);
