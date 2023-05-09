import React from 'react';
import PropTypes from 'prop-types';

import ActionMenuItem from './ActionMenuItem/ActionMenuItem';
import LinkMenuItem from './LinkMenuItem/LinkMenuItem';
import { gotoTab } from '../../configs/commands';
import * as styles from './MenuItem.module.css';

MenuItem.propTypes = {
  menu: PropTypes.shape({
    item: PropTypes.shape({
      target: PropTypes.string,
    }),
  }),
  active: PropTypes.bool,
};

function MenuItem({ menu, active }) {
  const {
    item: { target },
  } = menu;

  function handleClick(event) {
    event.preventDefault();

    gotoTab(target);
  }

  return (
    <li
      role="option"
      aria-selected={active ? true : false}
      className={`${styles.menuItem} ${active ? styles.active : ''}`}
      onClick={handleClick}
    >
      {target ? <LinkMenuItem menu={menu} /> : <ActionMenuItem menu={menu} />}
      <div className={styles.mark}>
        <span className={styles.markText}>Select</span>
        <span className={styles.markSign}>⏎</span>
      </div>
    </li>
  );
}

export default MenuItem;
