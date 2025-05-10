import { FunctionalComponent } from 'preact';

import styles from './Button.module.css';

interface ButtonProps {
  label: string;
  onClick: (value: string) => void;
  value?: string;
  type?: 'number' | 'operator' | 'action' | 'equals';
  className?: string;
}

export const Button: FunctionalComponent<ButtonProps> = ({
  label,
  onClick,
  value,
  type,
  className,
}) => {
  const handleClick = () => {
    onClick(value !== undefined ? value : label);
  };

  return (
    <button
      className={`${className} ${styles.button} ${styles[type]}`}
      onClick={handleClick}
      aria-label={label === '*' ? 'multiply' : label === '/' ? 'divide' : label}
    >
      {label}
    </button>
  );
};
