import React from 'react';
import PropTypes from 'prop-types';

import Highlight from '../Highlight';
import * as styles from './MenuItem.module.css';

MenuItem.propTypes = {
  menu: PropTypes.shape({
    item: PropTypes.shape({
      target: PropTypes.string,
      label: PropTypes.string,
      parentLabel: PropTypes.string,
      description: PropTypes.string,
    }),
    matches: PropTypes.arrayOf(
      PropTypes.shape({
        indices: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
      }),
    ),
  }),
  active: PropTypes.bool,
  handleClick: PropTypes.func,
  handleSelect: PropTypes.func,
};

function MenuItem({ menu, active, handleClick, handleSelect }) {
  const {
    item: { label, parentLabel, target, description },
    matches = [],
  } = menu;

  function renderLink() {
    function highlighted() {
      if (matches.length === 0) {
        return (
          <>
            {parentLabel ? `${parentLabel} / ` : null} {label}
          </>
        );
      } else if (matches.length === 1) {
        const indices = matches[0]?.indices || [];
        if (matches[0].key === 'label') {
          return (
            <>
              {parentLabel ? `${parentLabel} / ` : null}
              <Highlight indices={indices} source={label} />
            </>
          );
        } else {
          return (
            <>
              <Highlight indices={indices} source={parentLabel} />
              {label ? ` / ${label}` : null}
            </>
          );
        }
      } else {
        return matches.map(({ indices, value }, index) => {
          const separator = index === 1 ? ' / ' : null;
          return (
            <React.Fragment key={index}>
              {separator} <Highlight indices={indices} source={value} />
            </React.Fragment>
          );
        });
      }
    }

    return (
      <div className={styles.content}>
        <span className={styles.linkLabel}>{highlighted()}</span>
        <span className={styles.subLabel}>{target.split('?')[0]}</span>
      </div>
    );
  }

  function renderAction() {
    const indices = matches[0]?.indices || [];

    return (
      <div className={styles.content}>
        <span className={styles.actionLabel}>
          <Highlight indices={indices} source={label} />
        </span>
        <span className={styles.subLabel}>{description}</span>
      </div>
    );
  }

  return (
    <li
      role="option"
      aria-selected={active ? true : false}
      className={`${styles.menuItem} ${active ? styles.active : ''}`}
      onMouseEnter={handleSelect}
      onClick={handleClick}
    >
      {target ? renderLink() : renderAction()}
      <div className={styles.mark}>
        <span className={styles.markText}>Select</span>
        <span className={styles.markSign}>⏎</span>
      </div>
    </li>
  );
}

export default MenuItem;
