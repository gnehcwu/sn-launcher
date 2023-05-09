import React from 'react';
import PropTypes from 'prop-types';
import Highlight from '../../Highlight';
import * as styles from './LinkMenuItem.module.css';

LinkMenuItem.propTypes = {
  menu: PropTypes.shape({
    item: PropTypes.shape({
      label: PropTypes.string,
      parentLabel: PropTypes.string,
      target: PropTypes.string,
    }),
    matches: PropTypes.arrayOf(
      PropTypes.shape({
        indices: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
      }),
    ),
  }),
};

function LinkMenuItem({ menu }) {
  const {
    item: { label, parentLabel, target },
    matches = [],
  } = menu;

  const renderContent = () => {
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
      return matches.map(({ indices, value, label }, index) => {
        const separator = index === 1 ? ' / ' : null;
        return (
          <>
            {separator} <Highlight key={label} indices={indices} source={value} />
          </>
        );
      });
    }
  };

  return (
    <div className={styles.content}>
      <span className={styles.labelContent}>{renderContent()}</span>
      <span className={styles.targetContent}>{target.split('?')[0]}</span>
    </div>
  );
}

export default LinkMenuItem;
