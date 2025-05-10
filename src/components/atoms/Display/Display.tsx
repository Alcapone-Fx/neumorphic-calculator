import { FunctionalComponent } from 'preact';

import styles from './Display.module.css';

interface DisplayProps {
  value: string;
  expression?: string;
  error?: string;
}

export const Display: FunctionalComponent<DisplayProps> = ({
  value,
  expression,
  error,
}) => {
  return (
    <div className={styles.displayContainer} aria-live="polite">
      {expression && <div className={styles.expression}>{expression}</div>}
      <div
        id="display"
        className={`${styles.display} ${error ? styles.error : ''}`}
      >
        {error ? error : value}
      </div>
    </div>
  );
};
