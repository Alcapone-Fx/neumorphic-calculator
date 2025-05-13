import { FunctionalComponent } from 'preact';

import { Button } from '../../atoms/Button/Button';
import { Display } from '../../atoms/Display/Display';
import { ThemeSwitcher } from '../../atoms/ThemeSwitcher/ThemeSwitcher';
import generalButtonStyles from '../../atoms/Button/Button.module.css';
import { GitHubLink } from '../../atoms/GitHubLink/GitHubLink';
import { useCalculatorState } from '../../../hooks/useCalculatorState';
import styles from './Calculator.module.css';

const GITHUB_REPO_URL = 'https://github.com/Alcapone-Fx/neumorphic-calculator';

const BackspaceIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
    <line x1="18" y1="9" x2="12" y2="15"></line>
    <line x1="12" y1="9" x2="18" y2="15"></line>
  </svg>
);

export const Calculator: FunctionalComponent = () => {
  const {
    displayValue,
    expression,
    error,
    handleInput,
    calculate,
    clearAll,
    deleteLast,
    toggleSign,
    applyPercentage,
  } = useCalculatorState();

  const onButtonClick = (value: string) => {
    switch (value) {
      case '=':
        calculate();
        break;
      case 'C':
        clearAll();
        break;
      case 'DEL':
        deleteLast();
        break;
      case '+/-':
        toggleSign();
        break;
      case '%':
        applyPercentage();
        break;
      default:
        handleInput(value);
    }
  };

  return (
    <div className={styles.calculator}>
      <Display value={displayValue} error={error} expression={expression} />
      <div className={styles.topControls}>
        <div />
        <Button
          label="C"
          onClick={() => onButtonClick('C')}
          className={`${generalButtonStyles.topRow} ${generalButtonStyles.accent}`}
        />
        <ThemeSwitcher className={generalButtonStyles.topRow} />
        <Button
          label=""
          onClick={() => onButtonClick('DEL')}
          value="DEL"
          aria-label="Delete last input"
          className={`${generalButtonStyles.topRow} ${generalButtonStyles.deleteIcon}`}
        >
          <BackspaceIcon />
        </Button>
      </div>

      <div className={styles.buttonsGrid}>
        <Button
          label="("
          onClick={onButtonClick}
          value="("
          className={generalButtonStyles.parenthesis}
        />
        <Button
          label=")"
          onClick={onButtonClick}
          value=")"
          className={generalButtonStyles.parenthesis}
        />
        <Button
          label="%"
          onClick={() => onButtonClick('%')}
          className={generalButtonStyles.operator}
        />
        <Button
          label="÷"
          onClick={onButtonClick}
          value="/"
          className={generalButtonStyles.operator}
        />

        {/* Row 2 */}
        <Button label="7" onClick={onButtonClick} />
        <Button label="8" onClick={onButtonClick} />
        <Button label="9" onClick={onButtonClick} />
        <Button
          label="×"
          onClick={onButtonClick}
          value="*"
          className={generalButtonStyles.operator}
        />

        {/* Row 3 */}
        <Button label="4" onClick={onButtonClick} />
        <Button label="5" onClick={onButtonClick} />
        <Button label="6" onClick={onButtonClick} />
        <Button
          label="-"
          onClick={onButtonClick}
          value="-"
          className={generalButtonStyles.operator}
        />

        {/* Row 4 */}
        <Button label="1" onClick={onButtonClick} />
        <Button label="2" onClick={onButtonClick} />
        <Button label="3" onClick={onButtonClick} />
        <Button
          label="+"
          onClick={onButtonClick}
          value="+"
          className={generalButtonStyles.operator}
        />

        {/* Row 5 */}
        <Button label="+/-" onClick={() => onButtonClick('+/-')} />
        <Button label="0" onClick={onButtonClick} />
        <Button label="." onClick={onButtonClick} value="." />
        <Button
          label="="
          onClick={() => onButtonClick('=')}
          className={generalButtonStyles.accent}
        />
      </div>
      <div className={styles.footerControls}>
        <GitHubLink url={GITHUB_REPO_URL} tooltipText="View on GitHub" />
      </div>
    </div>
  );
};
