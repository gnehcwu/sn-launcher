import styled from 'styled-components';
import { Search as SearchIcon, CornerDownLeft, Loader } from 'react-feather';

interface FilterContainerProps {
  $layout: string;
}

export const FilterContainer = styled.div<FilterContainerProps>`
  display: grid;
  grid-template-columns: ${(props) => props.$layout};
  align-items: center;
  justify-content: center;
  column-gap: 12px;
  padding: 14px 16px;
`;

export const Input = styled.input.attrs(() => ({
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
  font-size: 1.65em;
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

export const Mode = styled.span`
  color: white;
  border-radius: 4px;
  border-radius: 9999px;
  white-space: nowrap;
  background-color: var(--sn-launcher-brand);
  padding: 4px 9px;
  font-size: 1.25em;
  user-select: none;

  @media (prefers-color-scheme: dark) {
    color: var(--sn-launcher-text-primary);
  }
`;

export const Mark = styled.span`
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: center;
  user-select: none;
`;

export const MarkText = styled.span`
  color: var(--sn-launcher-text-info);
  font-size: 1.25em;
`;

export const MarkTextSign = styled.span`
  display: inline-grid;
  place-content: center;
  background-color: var(--sn-launcher-surface-info);
  border-radius: 4px;
  padding: 4px;
  color: var(--sn-launcher-text-secondary);
  font-size: 1.25em;
  letter-spacing: 1px;
`;

export const StyledSearchIcon = styled(SearchIcon)`
  color: var(--sn-launcher-text-primary);
`;

export const StyledEnterIcon = styled(CornerDownLeft)`
  color: var(--sn-launcher-text-secondary);
  opacity: 0.8;
`;
