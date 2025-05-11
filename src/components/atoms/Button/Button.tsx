import { FunctionalComponent, ComponentChildren } from 'preact';

import styles from './Button.module.css';

interface ButtonProps {
  label: string;
  onClick: (value: string) => void;
  value?: string;
  type?: 'number' | 'operator' | 'action' | 'equals';
  className?: string;
  children?: ComponentChildren;
}

export const Button: FunctionalComponent<ButtonProps> = ({
  label,
  onClick,
  value,
  type,
  className,
  children,
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
      {label ?? label}
      {children}
    </button>
  );
};
