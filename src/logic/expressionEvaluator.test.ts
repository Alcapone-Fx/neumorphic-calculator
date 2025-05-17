import { evaluateExpression } from './expressionEvaluator';

describe('evaluateExpression', () => {
  test('should correctly evaluate simple addition', () => {
    expect(evaluateExpression('2 + 2')).toBe(4);
  });

  test('should correctly evaluate simple subtraction', () => {
    expect(evaluateExpression('5 - 3')).toBe(2);
  });

  test('should correctly evaluate simple multiplication', () => {
    expect(evaluateExpression('4 * 3')).toBe(12);
  });

  test('should correctly evaluate simple division', () => {
    expect(evaluateExpression('10 / 2')).toBe(5);
  });

  test('should handle decimal numbers', () => {
    expect(evaluateExpression('3.5 + 2.5')).toBe(6);
    expect(evaluateExpression('5.5 - 2.2')).toBe(3.3);
  });

  // Complex expressions tests
  test('should respect order of operations', () => {
    expect(evaluateExpression('2 + 3 * 4')).toBe(14);
    expect(evaluateExpression('(2 + 3) * 4')).toBe(20);
  });

  test('should handle nested parentheses', () => {
    expect(evaluateExpression('(2 + (3 * 4))')).toBe(14);
    expect(evaluateExpression('((2 + 3) * (4 + 5))')).toBe(45);
  });

  test('should handle negative numbers', () => {
    expect(evaluateExpression('-5 + 3')).toBe(-2);
    expect(evaluateExpression('5 * -3')).toBe(-15);
    expect(evaluateExpression('5 / -2')).toBe(-2.5);
    expect(evaluateExpression('5 * (-2)')).toBe(-10);
    expect(evaluateExpression('10/(-2)')).toBe(-5);
  });

  // Error handling tests
  test('should return error for invalid characters', () => {
    expect(evaluateExpression('2 + a')).toBe('Error: Invalid Chars');
    expect(evaluateExpression('sin(30)')).toBe('Error: Invalid Chars');
    expect(evaluateExpression('2 ^ 3')).toBe('Error: Invalid Chars');
  });

  test('should return error for malformed expressions', () => {
    expect(evaluateExpression('2 +')).toBe('Error: Operator End');
    expect(evaluateExpression('2 + + 3')).toBe('Error: Malformed');
    expect(evaluateExpression('* 3')).toBe('Error: Syntax');
  });

  test('should return error for unbalanced parentheses', () => {
    expect(evaluateExpression('(2 + 3')).toBe('Error: Parentheses');
    expect(evaluateExpression('2 + 3)')).toBe('Error: Parentheses');
    expect(evaluateExpression('((2 + 3) * 4')).toBe('Error: Parentheses');
  });

  test('should handle invalid calculations', () => {
    expect(evaluateExpression('5 / 0')).toBe('Error: Calculation');
  });

  test('should return error for malformed expressions caught by sanity check', () => {
    expect(evaluateExpression('5++3')).toBe('Error: Malformed');
    expect(evaluateExpression('5..2')).toBe('Error: Malformed');
  });

  test('should return error for syntax errors caught by new Function()', () => {
    expect(evaluateExpression('5+')).toBe('Error: Operator End');
  });

  // Edge cases tests
  test('should return 0 for empty string', () => {
    expect(evaluateExpression('')).toBe(0);
  });

  test('should return 0 for whitespace-only string', () => {
    expect(evaluateExpression('   ')).toBe(0);
  });

  test('should handle whitespace in expressions', () => {
    expect(evaluateExpression(' 2  +  2 ')).toBe(4);
  });

  test('should correctly evaluate expressions with unnecessary parentheses', () => {
    expect(evaluateExpression('(2) + (3)')).toBe(5);
  });

  test('should correctly evaluate long complex expressions', () => {
    expect(evaluateExpression('1 + 2 * 3 + (4 * 5 + 6) / 2')).toBe(20);
  });
});
