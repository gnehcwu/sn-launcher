import React from 'react';
import * as styles from './Footer.module.css';

function Footer() {
  return (
    <div className={styles.footerContainer}>
      <div className={styles.mark}>
        <span className={styles.markTextSign}>ESC</span> to close
      </div>
      <div className={styles.mark}>
        <span className={styles.markSign}>↑</span>
        <span className={styles.markSign}>↓</span> to navigate
      </div>
    </div>
  );
}

export default React.memo(Footer);
