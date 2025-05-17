import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  processInput,
  processToggleSign,
  processApplyPercentage,
  formatDisplayValue,
  formatExpressionPreview,
} from './calculatorProcessor';

vi.mock('./expressionEvaluator', () => ({
  evaluateExpression: vi.fn(),
}));

const mockedEvaluateExpression = vi.mocked(
  (await import('./expressionEvaluator')).evaluateExpression
);

describe('calculatorProcessor', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('_handleDecimalInput via processInput', () => {
    it('should append "0." if expression is empty', () => {
      const result = processInput('', '0', false, '.');
      expect(result.newInternalExpression).toBe('0.');
    });

    it('should append "." if expression ends with a number', () => {
      const result = processInput('123', '123', false, '.');
      expect(result.newInternalExpression).toBe('123.');
    });

    it('should append "0." if expression ends with an operator', () => {
      const result = processInput('123+', '123+', false, '.');
      expect(result.newInternalExpression).toBe('123+0.');
    });

    it('should append "0." if expression ends with "("', () => {
      const result = processInput('(', '(', false, '.');
      expect(result.newInternalExpression).toBe('(0.');
    });

    it('should not append "." if current segment already has one', () => {
      const result = processInput('1.23', '1.23', false, '.');
      expect(result.newInternalExpression).toBe('1.23');
    });

    it('should not append "." if current segment is empty after an operator (e.g. "5+.")', () => {
      const result = processInput('5+', '5+', false, '.');
      expect(result.newInternalExpression).toBe('5+0.');
    });

    it('should allow dot after closing parenthesis (implies multiplication)', () => {
      const resultAfterParen = processInput('(5)', '(5)', false, '.');
      expect(resultAfterParen.newInternalExpression).toBe('(5)*0.');
    });
  });

  describe('_handleConsecutiveOperatorInput via processInput', () => {
    it('should replace last operator if new one is different and not for negation', () => {
      const result = processInput('5+', '5+', false, '*');
      expect(result.newInternalExpression).toBe('5*');
    });

    it('should append "-" if last operator is "*" or "/"', () => {
      let result = processInput('5*', '5*', false, '-');
      expect(result.newInternalExpression).toBe('5*-');

      result = processInput('10/', '10/', false, '-');
      expect(result.newInternalExpression).toBe('10/-');
    });

    it('should replace last operator if it is "-" and new is not for negation', () => {
      const result = processInput('5-', '5-', false, '+');
      expect(result.newInternalExpression).toBe('5+');
    });

    it('should not append if not a valid negation sequence', () => {
      const result = processInput('5+', '5+', false, '+');
      expect(result.newInternalExpression).toBe('5+');
    });
  });

  describe('processInput', () => {
    it('should start new expression with operator if value is operator after result', () => {
      const result = processInput('anyOldExpr', '10', true, '+');
      expect(result.newInternalExpression).toBe('10+');
      expect(result.newDisplayValue).toBe('10+');
      expect(result.newIsResultDisplayed).toBe(false);
    });

    it('should start new expression with value if value is number after result', () => {
      const result = processInput('anyOldExpr', '10', true, '5');
      expect(result.newInternalExpression).toBe('5');
      expect(result.newDisplayValue).toBe('5');
      expect(result.newIsResultDisplayed).toBe(false);
    });

    it('should start new expression with "0." if value is "." after result', () => {
      const result = processInput('anyOldExpr', '10', true, '.');
      expect(result.newInternalExpression).toBe('0.');
      expect(result.newDisplayValue).toBe('0.');
    });

    it('should not append if input is too long (except parentheses)', () => {
      const longExpr = '1'.repeat(20);
      let result = processInput(longExpr, longExpr, false, '5');
      expect(result.newInternalExpression).toBe(longExpr);

      result = processInput(longExpr, longExpr, false, '(');
      expect(result.newInternalExpression).toBe(longExpr + '(');
    });

    it('should replace initial "0" with a number', () => {
      const result = processInput('0', '0', false, '5');
      expect(result.newInternalExpression).toBe('5');
    });

    it('should not replace initial "0" if input is "."', () => {
      const result = processInput('0', '0', false, '.');
      expect(result.newInternalExpression).toBe('0.');
    });

    it('should add "*" for implicit multiplication after ")"', () => {
      const result = processInput('(2+3)', '(2+3)', false, '5');
      expect(result.newInternalExpression).toBe('(2+3)*5');
    });

    it('should not allow invalid operator after "(" (e.g. "(*")', () => {
      const result = processInput('(', '(', false, '*');
      expect(result.newInternalExpression).toBe('(');
    });

    it('should allow "-" after "(" for negative numbers', () => {
      const result = processInput('(', '(', false, '-');
      expect(result.newInternalExpression).toBe('(-');
    });

    it('should append numbers and operators normally', () => {
      let result = processInput('12', '12', false, '3');
      expect(result.newInternalExpression).toBe('123');

      result = processInput('123', '123', false, '+');
      expect(result.newInternalExpression).toBe('123+');

      result = processInput('123+', '123+', false, '4');
      expect(result.newInternalExpression).toBe('123+4');
    });
  });

  describe('processToggleSign', () => {
    it('should do nothing if display is "Error" or "0"', () => {
      let result = processToggleSign('123', 'Error', false);
      expect(result.newInternalExpression).toBe('123');
      expect(result.newDisplayValue).toBe('Error');

      result = processToggleSign('', '0', false);
      expect(result.newInternalExpression).toBe('');
      expect(result.newDisplayValue).toBe('0');
    });

    it('should toggle sign of a positive number result', () => {
      const result = processToggleSign('123', '123', true);
      expect(result.newInternalExpression).toBe('-123');
      expect(result.newDisplayValue).toBe('-123');
    });

    it('should toggle sign of a negative number result', () => {
      const result = processToggleSign('-123', '-123', true);
      expect(result.newInternalExpression).toBe('123');
      expect(result.newDisplayValue).toBe('123');
    });

    it('should toggle sign of a simple negative number in expression (wrapped)', () => {
      const result = processToggleSign('(-123)', '(-123)', false);
      expect(result.newInternalExpression).toBe('123');
      expect(result.newDisplayValue).toBe('123');
    });

    it('should toggle sign of last number in an expression: 10+5 -> 10+(-5)', () => {
      const result = processToggleSign('10+5', '10+5', false);
      expect(result.newInternalExpression).toBe('10+(-5)');
    });

    it('should toggle sign of last negative number in an expression: 10+(-5) -> 10+5', () => {
      const result = processToggleSign('10+(-5)', '10+(-5)', false);
      expect(result.newInternalExpression).toBe('10+5');
    });
  });

  describe('processApplyPercentage', () => {
    const mockFormatDisplay = (val: number | string) => String(val);
    const mockFormatPreview = (expr: string) => expr;

    it('should return 0 for empty expression', () => {
      const result = processApplyPercentage(
        '',
        mockFormatDisplay,
        mockFormatPreview
      );
      expect(result.newInternalExpression).toBe('');
      expect(result.newDisplayValue).toBe('0');
    });

    it('should calculate percentage of a number', () => {
      mockedEvaluateExpression.mockReturnValueOnce(50);
      const result = processApplyPercentage(
        '50',
        mockFormatDisplay,
        mockFormatPreview
      );
      expect(mockedEvaluateExpression).toHaveBeenCalledWith('50');
      expect(result.newInternalExpression).toBe('0.5');
      expect(result.newDisplayValue).toBe('0.5');
      expect(result.newExpressionPreview).toBe('(50)%');
      expect(result.newIsResultDisplayed).toBe(true);
    });

    it('should calculate percentage of an expression', () => {
      mockedEvaluateExpression.mockReturnValueOnce(25);
      const result = processApplyPercentage(
        '10+15',
        mockFormatDisplay,
        mockFormatPreview
      );
      expect(mockedEvaluateExpression).toHaveBeenCalledWith('10+15');
      expect(result.newInternalExpression).toBe('0.25');
      expect(result.newDisplayValue).toBe('0.25');
      expect(result.newExpressionPreview).toBe('(10+15)%');
    });

    it('should handle error from evaluateExpression', () => {
      mockedEvaluateExpression.mockReturnValueOnce('Error: Syntax');
      const result = processApplyPercentage(
        '10+/',
        mockFormatDisplay,
        mockFormatPreview
      );
      expect(result.newDisplayValue).toBe('Error');
      expect(result.error).toBe('Error: Syntax');
      expect(result.newInternalExpression).toBe('10+/');
      expect(result.newIsResultDisplayed).toBe(false);
    });
  });

  describe('formatDisplayValue', () => {
    const MAX_LEN = 10;

    it('should return short numbers as is', () => {
      expect(formatDisplayValue('123', MAX_LEN)).toBe('123');
      expect(formatDisplayValue('123.45', MAX_LEN)).toBe('123.45');
    });

    it('should format long integers with toExponential', () => {
      expect(formatDisplayValue(12345678901, MAX_LEN)).toBe('1.235e+10');
    });

    it('should format long decimals with toExponential', () => {
      expect(formatDisplayValue(0.123456789, MAX_LEN)).toBe('1.235e-1');
    });

    it('should truncate very long non-numeric strings or unformattable numbers', () => {
      expect(formatDisplayValue('abcdefghijklmno', MAX_LEN)).toBe('abcdefghij');
    });

    it('should handle zero correctly', () => {
      expect(formatDisplayValue(0, MAX_LEN)).toBe('0');
    });

    it('should handle small negative numbers', () => {
      expect(formatDisplayValue(-0.00000012345, MAX_LEN)).toBe('-1.2345e-7');
    });

    it('should handle numbers that result in short exponential notation', () => {
      expect(formatDisplayValue(1e5, MAX_LEN)).toBe('100000');
    });
  });

  describe('formatExpressionPreview', () => {
    const MAX_LEN = 10;

    it('should return short expressions as is', () => {
      expect(formatExpressionPreview('1+2', MAX_LEN)).toBe('1+2');
    });

    it('should truncate long expressions with "..." prefix', () => {
      expect(formatExpressionPreview('1+2+3+4+5+6', MAX_LEN)).toBe(
        '...3+4+5+6'
      );
    });

    it('should handle expressions shorter than "..." + suffix_length', () => {
      expect(formatExpressionPreview('12345', 5)).toBe('12345');
      expect(formatExpressionPreview('123456', 5)).toBe('...56');
    });
  });
});
