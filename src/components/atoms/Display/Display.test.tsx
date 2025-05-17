import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { Display } from './Display';
import styles from './Display.module.css';

describe('Display Component', () => {
  const defaultValue = '12345';
  const defaultExpression = '10+20+';
  const defaultError = 'Error: Syntax';

  it('should render the main value correctly when no error or expression is provided', () => {
    render(<Display value={defaultValue} />);
    const displayElement = screen.getByText(defaultValue);

    expect(displayElement).toBeInTheDocument();
    expect(displayElement).toHaveClass(styles.display);
    expect(displayElement.id).toBe('display');
    expect(screen.queryByText(defaultExpression)).not.toBeInTheDocument();
    expect(displayElement).not.toHaveClass(styles.error);
  });

  it('should render the expression when provided', () => {
    render(<Display value={defaultValue} expression={defaultExpression} />);

    expect(screen.getByText(defaultExpression)).toBeInTheDocument();
    expect(screen.getByText(defaultExpression)).toHaveClass(styles.expression);
  });

  it('should render the error message instead of the value when error is provided', () => {
    render(<Display value={defaultValue} error={defaultError} />);
    const displayElement = screen.getByText(defaultError);

    expect(displayElement).toBeInTheDocument();
    expect(screen.queryByText(defaultValue)).not.toBeInTheDocument();
    expect(displayElement).toHaveClass(styles.display);
    expect(displayElement).toHaveClass(styles.error);
  });

  it('should not apply error class when no error is provided', () => {
    render(<Display value={defaultValue} />);
    const displayElement = screen.getByText(defaultValue);
    expect(displayElement).not.toHaveClass(styles.error);
  });

  it('should render both expression and error if both are provided (error takes precedence for main display)', () => {
    render(
      <Display
        value={defaultValue}
        expression={defaultExpression}
        error={defaultError}
      />
    );

    expect(screen.getByText(defaultExpression)).toBeInTheDocument();
    expect(screen.getByText(defaultError)).toBeInTheDocument();
    expect(screen.queryByText(defaultValue)).not.toBeInTheDocument();
    expect(screen.getByText(defaultError)).toHaveClass(styles.error);
  });

  it('should have aria-live="polite" on the container for accessibility', () => {
    render(<Display value={defaultValue} />);

    const containerElement = screen
      .getByText(defaultValue)
      .closest(`.${styles.displayContainer}`);

    expect(containerElement).toBeInTheDocument();
    if (containerElement) {
      expect(containerElement).toHaveAttribute('aria-live', 'polite');
    } else {
      throw new Error('Display container not found for aria-live test');
    }
  });

  it('should render an empty string for value if value is empty and no error', () => {
    render(<Display value="" />);
    const displayElement = document.getElementById('display');

    expect(displayElement).toBeInTheDocument();
    expect(displayElement).toHaveTextContent('');
    expect(displayElement).not.toHaveClass(styles.error);
  });

  it('should not render an empty string for expression if expression is empty string', () => {
    render(<Display value={defaultValue} expression="" />);
    const expressionElement = document.querySelector(`.${styles.expression}`);

    expect(expressionElement).not.toBeInTheDocument();
  });
});
