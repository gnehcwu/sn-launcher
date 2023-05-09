import React from 'react';
import PropTypes from 'prop-types';
import useKeyDown from '../../hooks/useKeyDown';
import * as styles from './Filter.module.css';

Filter.propTypes = {
  filter: PropTypes.string,
  handleFilterChange: PropTypes.func,
  commandMode: PropTypes.string,
  setCommandMode: PropTypes.func,
  isLoading: PropTypes.bool,
};

function Filter({ filter, handleFilterChange, commandMode, setCommandMode, isLoading }) {
  function handleInput(event) {
    handleFilterChange(event.target.value);
  }

  function handleDeleteKey() {
    // When input is empty, keep deleting will revert current selected command mode.
    if (!filter && commandMode) {
      setCommandMode('');
    }
  }

  function disableArrowUpDownKeys(event) {
    event.preventDefault();
  }

  // Handle delete input characters or revert selected command mode
  useKeyDown('Backspace', handleDeleteKey);

  // Prevent cursor moving in input when navigating with arrow keys
  useKeyDown('ArrowDown', disableArrowUpDownKeys);
  useKeyDown('ArrowUp', disableArrowUpDownKeys);

  return (
    <form className={styles.form}>
      {commandMode !== '' && <span className={styles.mode}>{commandMode}</span>}
      <input
        type="text"
        className={styles.input}
        placeholder={commandMode ? '' : 'Type to search all menus'}
        value={filter}
        onChange={handleInput}
      />
      {isLoading && <span className={styles.loadingCircle}></span>}
    </form>
  );
}

export default Filter;
