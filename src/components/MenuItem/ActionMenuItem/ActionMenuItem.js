import React from 'react';
import PropTypes from 'prop-types';
import Highlight from '../../Highlight';
import * as styles from './ActionMenuItem.module.css';

ActionMenuItem.propTypes = {
  menu: PropTypes.shape({
    item: PropTypes.shape({
      label: PropTypes.string,
      action: PropTypes.func,
      mode: PropTypes.string,
    }),
    matches: PropTypes.arrayOf(
      PropTypes.shape({
        indices: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
      }),
    ),
  }),
};

function ActionMenuItem({ menu }) {
  const {
    item: { label },
    matches = [],
  } = menu;

  const indices = matches[0]?.indices || [];

  return (
    <span className={styles.action}>
      <Highlight indices={indices} source={label} />
    </span>
  );
}

export default ActionMenuItem;
