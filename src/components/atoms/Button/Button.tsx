import { FunctionalComponent } from 'preact';

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
  className,
}) => {
  const handleClick = () => {
    onClick(value !== undefined ? value : label);
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      aria-label={label === '*' ? 'multiply' : label === '/' ? 'divide' : label}
    >
      {label}
    </button>
  );
};
