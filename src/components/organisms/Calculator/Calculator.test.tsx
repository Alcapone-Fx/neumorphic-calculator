import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import { Calculator } from './Calculator';

const mockUseCalculatorState = {
  displayValue: '0',
  expression: '',
  error: null,
  handleInput: vi.fn(),
  calculate: vi.fn(),
  clearAll: vi.fn(),
  deleteLast: vi.fn(),
  toggleSign: vi.fn(),
  applyPercentage: vi.fn(),
};

vi.mock('../../../hooks/useCalculatorState', () => ({
  useCalculatorState: () => mockUseCalculatorState,
}));

vi.mock('../../atoms/ThemeSwitcher/ThemeSwitcher', () => ({
  ThemeSwitcher: () => (
    <div data-testid="mock-theme-switcher">ThemeSwitcher</div>
  ),
}));

vi.mock('../../atoms/GitHubLink/GitHubLink', () => ({
  GitHubLink: ({ url }: { url: string }) => (
    <a href={url} data-testid="mock-github-link">
      GitHub
    </a>
  ),
}));

describe('Calculator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseCalculatorState.displayValue = '0';
    mockUseCalculatorState.expression = '';
    mockUseCalculatorState.error = null;
  });

  it('should render Display with initial values from useCalculatorState', () => {
    mockUseCalculatorState.displayValue = '123';
    mockUseCalculatorState.expression = '1+2';
    render(<Calculator />);

    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText('1+2')).toBeInTheDocument();
  });

  it('should render Display with error message when error is present in useCalculatorState', () => {
    mockUseCalculatorState.error = 'Test Error';
    mockUseCalculatorState.displayValue = 'ignored';
    render(<Calculator />);

    expect(screen.getByText('Test Error')).toBeInTheDocument();
    expect(screen.queryByText('ignored')).not.toBeInTheDocument();
  });

  it('should render ThemeSwitcher and GitHubLink', () => {
    render(<Calculator />);

    expect(screen.getByTestId('mock-theme-switcher')).toBeInTheDocument();
    expect(screen.getByTestId('mock-github-link')).toBeInTheDocument();
    expect(screen.getByTestId('mock-github-link')).toHaveAttribute(
      'href',
      'https://github.com/Alcapone-Fx/neumorphic-calculator'
    );
  });

  it('should call handleInput with the correct value when a number button is clicked', () => {
    render(<Calculator />);
    const button7 = screen.getByRole('button', { name: '7' });

    fireEvent.click(button7);

    expect(mockUseCalculatorState.handleInput).toHaveBeenCalledTimes(1);
    expect(mockUseCalculatorState.handleInput).toHaveBeenCalledWith('7');
  });

  it('should call handleInput with the correct value when an operator button is clicked', () => {
    render(<Calculator />);
    const buttonPlus = screen.getByRole('button', { name: '+' });

    fireEvent.click(buttonPlus);

    expect(mockUseCalculatorState.handleInput).toHaveBeenCalledTimes(1);
    expect(mockUseCalculatorState.handleInput).toHaveBeenCalledWith('+');

    const buttonMultiply = screen.getByRole('button', { name: '×' });
    fireEvent.click(buttonMultiply);

    expect(mockUseCalculatorState.handleInput).toHaveBeenCalledTimes(2);
    expect(mockUseCalculatorState.handleInput).toHaveBeenCalledWith('*');
  });

  it('should call calculate when "=" button is clicked', () => {
    render(<Calculator />);
    const equalsButton = screen.getByRole('button', { name: '=' });

    fireEvent.click(equalsButton);

    expect(mockUseCalculatorState.calculate).toHaveBeenCalledTimes(1);
  });

  it('should call clearAll when "C" button is clicked', () => {
    render(<Calculator />);
    const clearButton = screen.getByRole('button', { name: 'C' });

    fireEvent.click(clearButton);

    expect(mockUseCalculatorState.clearAll).toHaveBeenCalledTimes(1);
  });

  it('should call deleteLast when "DEL" (Backspace) button is clicked', () => {
    render(<Calculator />);
    const deleteButton = screen.getByRole('button', {
      name: 'Delete last input',
    });

    fireEvent.click(deleteButton);

    expect(mockUseCalculatorState.deleteLast).toHaveBeenCalledTimes(1);
  });

  it('should call toggleSign when "+/-" button is clicked', () => {
    render(<Calculator />);
    const toggleSignButton = screen.getByRole('button', { name: '+/-' });

    fireEvent.click(toggleSignButton);

    expect(mockUseCalculatorState.toggleSign).toHaveBeenCalledTimes(1);
  });

  it('should call applyPercentage when "%" button is clicked', () => {
    render(<Calculator />);
    const percentageButton = screen.getByRole('button', { name: '%' });

    fireEvent.click(percentageButton);

    expect(mockUseCalculatorState.applyPercentage).toHaveBeenCalledTimes(1);
  });

  it('should correctly pass value for buttons like parenthesis and dot', () => {
    render(<Calculator />);
    const openParenButton = screen.getByRole('button', { name: '(' });

    fireEvent.click(openParenButton);

    expect(mockUseCalculatorState.handleInput).toHaveBeenCalledWith('(');
    mockUseCalculatorState.handleInput.mockClear();

    const dotButton = screen.getByRole('button', { name: '.' });

    fireEvent.click(dotButton);

    expect(mockUseCalculatorState.handleInput).toHaveBeenCalledWith('.');
  });

  it('should render buttons in their respective grid areas', () => {
    render(<Calculator />);

    expect(screen.getByRole('button', { name: 'C' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '7' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '=' })).toBeInTheDocument();
  });
});
