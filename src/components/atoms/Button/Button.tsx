import { FunctionalComponent, ComponentChildren } from 'preact';

import styles from './Button.module.css';

interface ButtonProps {
  label: string;
  onClick: (value: string) => void;
  value?: string;
  type?: 'number' | 'operator' | 'action' | 'equals';
  className?: string;
  children?: ComponentChildren;
  ['aria-label']?: string;
}

export const Button: FunctionalComponent<ButtonProps> = ({
  label,
  onClick,
  value,
  type,
  className,
  children,
  ['aria-label']: ariaLabel,
}) => {
  let effectiveAriaLabel = ariaLabel;

  if (!effectiveAriaLabel) {
    if (label === '*') {
      effectiveAriaLabel = 'multiply';
    } else if (label === '/') {
      effectiveAriaLabel = 'divide';
    } else {
      effectiveAriaLabel = label;
    }
  }

  const buttonContent = children ?? label;

  const typeClassName = type && styles[type] ? styles[type] : '';
  const classNames = [className, styles.button, typeClassName]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    onClick(value !== undefined ? value : label);
  };

  return (
    <button
      className={classNames}
      onClick={handleClick}
      aria-label={effectiveAriaLabel}
    >
      {buttonContent}
    </button>
  );
};
