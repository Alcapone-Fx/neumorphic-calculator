import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/preact';
import { useCalculatorState } from './useCalculatorState';

vi.mock('../logic/expressionEvaluator', () => ({
  evaluateExpression: vi.fn(),
}));

vi.mock('../logic/calculatorProcessor', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../logic/calculatorProcessor')>();
  return {
    processInput: vi.fn(),
    processToggleSign: vi.fn(),
    processApplyPercentage: vi.fn(),
    formatDisplayValue: actual.formatDisplayValue,
    formatExpressionPreview: actual.formatExpressionPreview,
  };
});

const mockedEvaluateExpression = vi.mocked(
  (await import('../logic/expressionEvaluator')).evaluateExpression
);
const mockedProcessInput = vi.mocked(
  (await import('../logic/calculatorProcessor')).processInput
);
const mockedProcessToggleSign = vi.mocked(
  (await import('../logic/calculatorProcessor')).processToggleSign
);
const mockedProcessApplyPercentage = vi.mocked(
  (await import('../logic/calculatorProcessor')).processApplyPercentage
);

describe('useCalculatorState', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockedProcessInput.mockReturnValue({
      newInternalExpression: '',
      newDisplayValue: '0',
      newIsResultDisplayed: false,
    });
    mockedProcessToggleSign.mockReturnValue({
      newInternalExpression: '',
      newDisplayValue: '0',
      newIsResultDisplayed: false,
    });
    mockedProcessApplyPercentage.mockReturnValue({
      newInternalExpression: '',
      newDisplayValue: '0',
      newIsResultDisplayed: false,
    });
    mockedEvaluateExpression.mockReturnValue(0);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useCalculatorState());
    expect(result.current.displayValue).toBe('0');
    expect(result.current.expression).toBe('');
    expect(result.current.error).toBeNull();
  });

  describe('handleInput', () => {
    it('should call processInput and update state accordingly', () => {
      const mockUpdate = {
        newInternalExpression: '123',
        newDisplayValue: '123',
        newIsResultDisplayed: false,
      };
      mockedProcessInput.mockReturnValue(mockUpdate);

      const { result } = renderHook(() => useCalculatorState());
      act(() => {
        result.current.handleInput('1');
      });

      expect(mockedProcessInput).toHaveBeenCalledWith('', '0', false, '1');
      expect(result.current.displayValue).toBe('123');
    });

    it('should clear expressionPreview if newIsResultDisplayed is false from processInput', () => {
      mockedProcessInput.mockReturnValue({
        newInternalExpression: '1+',
        newDisplayValue: '1+',
        newIsResultDisplayed: false,
      });

      const { result } = renderHook(() => useCalculatorState());

      act(() => {});

      act(() => {
        result.current.handleInput('+');
      });
      expect(result.current.expression).toBe('');
    });

    it('should clear error when input is handled', () => {
      const { result } = renderHook(() => useCalculatorState());

      act(() => {
        mockedEvaluateExpression.mockReturnValue('Error: Syntax');
        result.current.calculate();
      });
      expect(result.current.error).toBeNull();

      act(() => {
        result.current.handleInput('1');
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe('calculate', () => {
    it('should call evaluateExpression and update display with result', () => {
      mockedEvaluateExpression.mockReturnValue(15);
      const { result } = renderHook(() => useCalculatorState());

      act(() => {
        mockedProcessInput.mockImplementationOnce((_i, _d, _isr, val) => ({
          newInternalExpression: val,
          newDisplayValue: val,
          newIsResultDisplayed: false,
        }));
        result.current.handleInput('10+5');
      });

      act(() => {
        result.current.calculate();
      });

      expect(mockedEvaluateExpression).toHaveBeenCalledWith('10+5');
      expect(result.current.displayValue).toBe('15');
      expect(result.current.expression.endsWith('=')).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should handle evaluation error and set error state', () => {
      mockedEvaluateExpression.mockReturnValue('Error: Syntax');
      const { result } = renderHook(() => useCalculatorState());

      act(() => {
        mockedProcessInput.mockImplementationOnce((_i, _d, _isr, val) => ({
          newInternalExpression: val,
          newDisplayValue: val,
          newIsResultDisplayed: false,
        }));
        result.current.handleInput('10+/5');
      });

      act(() => {
        result.current.calculate();
      });

      expect(mockedEvaluateExpression).toHaveBeenCalledWith('10+/5');
      expect(result.current.displayValue).toBe('Error');
      expect(result.current.error).toBe('Error: Syntax');
    });

    it('should correctly update state after handleInput and then calculate', () => {
      const { result } = renderHook(() => useCalculatorState());

      mockedProcessInput.mockImplementationOnce(() => {
        return {
          newInternalExpression: '5+5',
          newDisplayValue: '5+5',
          newIsResultDisplayed: false,
        };
      });

      act(() => {
        result.current.handleInput('mockTrigger');
      });

      expect(result.current.displayValue).toBe('5+5');
      expect(result.current.expression).toBe('');
      expect(result.current.error).toBeNull();

      mockedEvaluateExpression.mockReturnValueOnce(10);

      act(() => {
        result.current.calculate();
      });

      expect(mockedEvaluateExpression).toHaveBeenCalledTimes(1);
      expect(mockedEvaluateExpression).toHaveBeenCalledWith('5+5');
      expect(result.current.displayValue).toBe('10');
      expect(result.current.expression.includes('5+5=')).toBe(true);
    });
  });

  describe('clearAll', () => {
    it('should reset state via clearAll and then allow new calculations correctly', () => {
      const { result } = renderHook(() => useCalculatorState());

      act(() => {
        mockedProcessInput.mockReturnValueOnce({
          newInternalExpression: '123',
          newDisplayValue: '123',
          newIsResultDisplayed: false,
        });
        result.current.handleInput('any_initial_input');

        mockedEvaluateExpression.mockReturnValueOnce(123);
        result.current.calculate();
      });
      expect(result.current.displayValue).toBe('123');

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.displayValue).toBe('0');
      expect(result.current.expression).toBe('');
      expect(result.current.error).toBeNull();

      mockedProcessInput.mockClear();
      mockedEvaluateExpression.mockClear();

      act(() => {
        mockedProcessInput.mockImplementationOnce(
          (currentInternal, currentDisplay, isResultDisplayed, inputValue) => {
            expect(currentInternal).toBe('');
            expect(currentDisplay).toBe('0');
            expect(isResultDisplayed).toBe(false);
            expect(inputValue).toBe('1+1');

            return {
              newInternalExpression: '1+1',
              newDisplayValue: '1+1',
              newIsResultDisplayed: false,
            };
          }
        );

        result.current.handleInput('1+1');
      });

      act(() => {
        mockedEvaluateExpression.mockReturnValueOnce(2);
        result.current.calculate();
      });

      expect(mockedEvaluateExpression).toHaveBeenCalledTimes(1);
      expect(mockedEvaluateExpression).toHaveBeenCalledWith('1+1');
      expect(result.current.expression.includes('1+1=')).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });

  describe('deleteLast', () => {
    it('should remove the last character from internalExpression if not result', () => {
      const { result } = renderHook(() => useCalculatorState());
      act(() => {
        mockedProcessInput.mockReturnValueOnce({
          newInternalExpression: '123',
          newDisplayValue: '123',
          newIsResultDisplayed: false,
        });
        result.current.handleInput('123');
      });
      expect(result.current.displayValue).toBe('123');

      act(() => {
        result.current.deleteLast();
      });
      expect(result.current.displayValue).toBe('12');

      act(() => {
        result.current.deleteLast();
      });
      expect(result.current.displayValue).toBe('1');

      act(() => {
        result.current.deleteLast();
      });
      expect(result.current.displayValue).toBe('0');
    });

    it('should call clearAll if isResultDisplayed is true', () => {
      const { result } = renderHook(() => useCalculatorState());
      act(() => {
        mockedProcessInput.mockReturnValueOnce({
          newInternalExpression: '10',
          newDisplayValue: '10',
          newIsResultDisplayed: false,
        });
        result.current.handleInput('10');
        mockedEvaluateExpression.mockReturnValueOnce(10);
        result.current.calculate();
      });
      expect(result.current.displayValue).toBe('10');

      act(() => {
        result.current.deleteLast();
      });
      expect(result.current.displayValue).toBe('1');
      expect(result.current.expression).toBe('');
    });
  });

  describe('toggleSign', () => {
    it('should call processToggleSign and update state', () => {
      const mockUpdate = {
        newInternalExpression: '-123',
        newDisplayValue: '-123',
        newIsResultDisplayed: false,
      };
      mockedProcessToggleSign.mockReturnValue(mockUpdate);
      const { result } = renderHook(() => useCalculatorState());

      act(() => {
        mockedProcessInput.mockReturnValueOnce({
          newInternalExpression: '123',
          newDisplayValue: '123',
          newIsResultDisplayed: false,
        });
        result.current.handleInput('123');
      });

      act(() => {
        result.current.toggleSign();
      });

      expect(mockedProcessToggleSign).toHaveBeenCalledWith('123', '123', false);
      expect(result.current.displayValue).toBe('-123');
      expect(result.current.expression).toBe('');
    });
  });

  describe('applyPercentage', () => {
    it('should call processApplyPercentage and update state', () => {
      const mockUpdate = {
        newInternalExpression: '0.5',
        newDisplayValue: '0.5',
        newExpressionPreview: '(50)%',
        newIsResultDisplayed: true,
      };
      mockedProcessApplyPercentage.mockReturnValue(mockUpdate);
      const { result } = renderHook(() => useCalculatorState());

      act(() => {
        mockedProcessInput.mockReturnValueOnce({
          newInternalExpression: '50',
          newDisplayValue: '50',
          newIsResultDisplayed: false,
        });
        result.current.handleInput('50');
      });

      act(() => {
        result.current.applyPercentage();
      });

      expect(mockedProcessApplyPercentage).toHaveBeenCalled();
      expect(result.current.displayValue).toBe('0.5');
      expect(result.current.expression).toBe('(50)%');
      mockedEvaluateExpression.mockClear();
      act(() => {
        result.current.calculate();
      });
      expect(mockedEvaluateExpression).not.toHaveBeenCalled();
    });

    it('should not proceed if displayValue is Error or internalExpression is empty', () => {
      const { result } = renderHook(() => useCalculatorState());

      act(() => {
        result.current.applyPercentage();
      });
      expect(mockedProcessApplyPercentage).not.toHaveBeenCalled();

      act(() => {
        mockedEvaluateExpression.mockReturnValueOnce('Error: Syntax');
        mockedProcessInput.mockReturnValueOnce({
          newInternalExpression: 'errorprone',
          newDisplayValue: 'errorprone',
          newIsResultDisplayed: false,
        });
        result.current.handleInput('errorprone');
      });

      act(() => {
        result.current.calculate();
      });
      expect(result.current.displayValue).toBe('Error');
      mockedProcessApplyPercentage.mockClear();

      act(() => {
        result.current.applyPercentage();
      });
      expect(mockedProcessApplyPercentage).not.toHaveBeenCalled();
    });
  });
});
