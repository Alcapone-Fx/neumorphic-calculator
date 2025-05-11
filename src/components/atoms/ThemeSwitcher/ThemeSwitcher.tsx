import { FunctionalComponent } from 'preact';
import { useTheme } from '../../../hooks/useTheme';
import buttonStyles from '../Button/Button.module.css';
import styles from './ThemeSwitcher.module.css';

const SunIcon = () => (
  <span className={styles.icon} role="img" aria-label="light mode">
    ☀️
  </span>
);
const MoonIcon = () => (
  <span className={styles.icon} role="img" aria-label="dark mode">
    🌙
  </span>
);

interface ThemeSwitcherProps {
  className?: string;
}

export const ThemeSwitcher: FunctionalComponent<ThemeSwitcherProps> = ({
  className,
}) => {
  const [theme, toggleTheme] = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`${buttonStyles.button} ${className || ''} ${styles.themeSwitcherButton}`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
    </button>
  );
};
