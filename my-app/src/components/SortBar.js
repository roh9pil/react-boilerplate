import React from 'react';
import styles from './SortBar.module.css';

const SortBar = ({ onSortChange, currentSort }) => {
  return (
    <div className={styles.sortBar}>
      <span>Sort by:</span>
      <button
        className={currentSort === 'relevant' ? styles.active : ''}
        onClick={() => onSortChange('relevant')}
      >
        Relevant
      </button>
      <button
        className={currentSort === 'latest' ? styles.active : ''}
        onClick={() => onSortChange('latest')}
      >
        Latest
      </button>
    </div>
  );
};

export default SortBar;
