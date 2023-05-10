import React from 'react';
import PropTypes from 'prop-types';
import Loading from '../Loading/Loading';
import useKeyDown from '../../hooks/useKeyDown';
import { modeActionMapping, goto, gotoTab } from '../../configs/commands';
import useLauncherStore from '../../store/launcherStore';
import * as styles from './Filter.module.css';

Filter.propTypes = {
  dismissLauncher: PropTypes.func,
};

function Filter({ dismissLauncher }, ref) {
  const [filter, commandMode, selectedMenu, updateFilter, updateCommandMode] = useLauncherStore(
    (state) => [
      state.filter,
      state.commandMode,
      state.selectedMenu,
      state.updateFilter,
      state.updateCommandMode,
    ],
  );
  const [isLoading, setIsLoading] = React.useState(false);

  function handleInput(event) {
    updateFilter(event.target.value);
  }

  function handleDeleteKey() {
    // When input is empty, keep deleting will revert current selected command mode.
    if (!filter && commandMode) {
      updateCommandMode('');
    }
  }

  function disableArrowUpDownKeys(event) {
    event.preventDefault();
  }

  function handleSubmit(event) {
    event.preventDefault();

    if ([/(.+)\.do$/, /(.+)\.list$/].some((pattern) => pattern.test(filter))) {
      dismissLauncher();
      goto(filter);
    } else if (commandMode) {
      dismissLauncher();
      modeActionMapping[commandMode]?.(filter);
    } else {
      const {
        item: { target, mode: nextCommandMode, action },
      } = selectedMenu;

      if (target) {
        dismissLauncher();
        gotoTab(target);
      } else if (nextCommandMode) {
        updateCommandMode(nextCommandMode);
        ref.current?.focus();
      } else if (action) {
        setIsLoading(true);
        action().finally(() => {
          setIsLoading(false);
          updateFilter('');
        });
      }
    }
  }

  // Handle delete input characters or revert selected command mode
  useKeyDown('Backspace', handleDeleteKey);
  useKeyDown('Enter', handleSubmit);

  // Prevent cursor moving in input when navigating with arrow keys
  useKeyDown('ArrowDown', disableArrowUpDownKeys);
  useKeyDown('ArrowUp', disableArrowUpDownKeys);

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {commandMode !== '' && <span className={styles.mode}>{commandMode}</span>}
      <input
        type="text"
        className={styles.input}
        placeholder={commandMode ? '' : 'Type to search all menus'}
        value={filter}
        onChange={handleInput}
        ref={ref}
      />
      {isLoading && <Loading className={styles.loading} />}
    </form>
  );
}

export default React.forwardRef(Filter);
