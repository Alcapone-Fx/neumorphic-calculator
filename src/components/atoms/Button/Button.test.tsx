import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import { Button } from './Button';
import styles from './Button.module.css';

describe('Button Component', () => {
  const defaultProps = {
    label: 'Click Me',
    onClick: vi.fn(),
  };

  beforeEach(() => {
    defaultProps.onClick.mockClear();
  });

  it('should render with the correct label', () => {
    render(<Button {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: 'Click Me' })
    ).toBeInTheDocument();
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('should call onClick with the label when value is not provided', () => {
    render(<Button {...defaultProps} label="TestLabel" />);
    const buttonElement = screen.getByRole('button', { name: 'TestLabel' });

    fireEvent.click(buttonElement);

    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClick).toHaveBeenCalledWith('TestLabel');
  });

  it('should call onClick with the value when value is provided', () => {
    render(<Button {...defaultProps} label="Display" value="ActualValue" />);
    const buttonElement = screen.getByRole('button', { name: 'Display' });

    fireEvent.click(buttonElement);

    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClick).toHaveBeenCalledWith('ActualValue');
  });

  it('should apply default and type-specific CSS classes', () => {
    render(<Button {...defaultProps} type="operator" />);
    const buttonElement = screen.getByRole('button', { name: 'Click Me' });

    expect(buttonElement).toHaveClass(styles.button);
    expect(buttonElement).toHaveClass(styles.operator);
  });

  it('should apply additional className if provided', () => {
    const customClass = 'my-custom-button-class';
    render(<Button {...defaultProps} className={customClass} />);
    const buttonElement = screen.getByRole('button', { name: 'Click Me' });

    expect(buttonElement).toHaveClass(styles.button);
    expect(buttonElement).toHaveClass(customClass);
  });

  it('should not apply a type class if type is not provided or invalid', () => {
    render(<Button {...defaultProps} />);
    const buttonElement = screen.getByRole('button', { name: 'Click Me' });

    expect(buttonElement).toHaveClass(styles.button);
    expect(buttonElement.classList.contains(styles.operator)).toBe(false);
  });

  describe('aria-label generation', () => {
    it('should use label as aria-label by default', () => {
      render(<Button {...defaultProps} label="Add" />);

      expect(screen.getByRole('button', { name: 'Add' })).toHaveAttribute(
        'aria-label',
        'Add'
      );
    });

    it('should use "multiply" as aria-label for "*" label', () => {
      render(<Button {...defaultProps} label="*" />);

      expect(screen.getByRole('button', { name: 'multiply' })).toHaveAttribute(
        'aria-label',
        'multiply'
      );
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should use "divide" as aria-label for "/" label', () => {
      render(<Button {...defaultProps} label="/" />);
      expect(screen.getByRole('button', { name: 'divide' })).toHaveAttribute(
        'aria-label',
        'divide'
      );
      expect(screen.getByText('/')).toBeInTheDocument();
    });
  });

  it('should render children if provided', () => {
    const childText = 'Child Content';
    render(
      <Button {...defaultProps} label="Parent">
        <p>{childText}</p>
      </Button>
    );

    expect(screen.getByRole('button', { name: 'Parent' })).toBeInTheDocument();
    expect(screen.getByText(childText)).toBeInTheDocument();
  });

  it('should handle label being an empty string', () => {
    render(<Button {...defaultProps} label="" />);
    const buttonElement = screen.getByRole('button');

    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveAttribute('aria-label', '');
  });
});
