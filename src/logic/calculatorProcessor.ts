import { evaluateExpression } from './expressionEvaluator';

// This file handles the expression transformation logic.

const MAX_INPUT_LENGTH = 20;
const OPERATORS = ['+', '-', '*', '/'];

interface DecimalAnalysis {
  canAppend: boolean;
  updatedExpression: string;
}

/**
 * Handles the input of a decimal point.
 * Validates if a decimal point can be added and ensures proper number formatting.
 *
 * @param currentInternal - The current expression
 * @returns An object containing whether decimal can be appended and the updated expression
 */
const _handleDecimalInput = (currentInternal: string): DecimalAnalysis => {
  const segments = currentInternal.split(/[+\-*/()]/);
  const currentSegment = segments[segments.length - 1];

  const cannotAppendDot =
    currentSegment.includes('.') ||
    (currentSegment === '' &&
      !currentInternal.endsWith(')') &&
      !OPERATORS.includes(currentInternal.slice(-1)) &&
      currentInternal !== '' &&
      !currentInternal.endsWith('('));

  if (cannotAppendDot) {
    return { canAppend: false, updatedExpression: currentInternal };
  }

  const needsLeadingZero =
    currentInternal === '' ||
    OPERATORS.includes(currentInternal.slice(-1)) ||
    currentInternal.endsWith('(');

  if (needsLeadingZero) {
    return { canAppend: true, updatedExpression: currentInternal + '0.' };
  } else {
    return { canAppend: true, updatedExpression: currentInternal + '.' };
  }
};

/**
 * Handles input when consecutive operators are entered.
 * Manages operator replacement and special cases for negative numbers.
 *
 * @param currentInternal - The current calculator expression
 * @param newOperatorValue - The new operator being input
 * @returns The updated expression string after handling consecutive operators
 */
const _handleConsecutiveOperatorInput = (
  currentInternal: string,
  newOperatorValue: string
): string => {
  const lastCharIsOperator = OPERATORS.includes(currentInternal.slice(-1));
  const newCharIsOperator = OPERATORS.includes(newOperatorValue);

  if (lastCharIsOperator && newCharIsOperator) {
    const allowChainedNegative =
      newOperatorValue === '-' &&
      (currentInternal.slice(-1) === '*' || currentInternal.slice(-1) === '/');

    if (allowChainedNegative) {
      return currentInternal + newOperatorValue;
    } else {
      return currentInternal.slice(0, -1) + newOperatorValue;
    }
  }
  return currentInternal + newOperatorValue;
};

export interface ExpressionUpdate {
  newInternalExpression: string;
  newDisplayValue: string;
  newExpressionPreview?: string;
  newIsResultDisplayed?: boolean;
  error?: string | null;
}

/**
 * Handles numeric, decimal, and parenthesis input to build calculator expressions.
 * Manages the transformation of input values based on the current state and validates input rules.
 *
 * @param currentInternal - The current internal expression string being built
 * @param currentDisplay - The current value shown on the calculator display
 * @param isResult - Flag indicating if the current display shows a calculation result
 * @param value - The new input value to process (number, operator, decimal point, or parenthesis)
 * @returns An ExpressionUpdate object containing the new internal expression, display value and state
 */
export const processInput = (
  currentInternal: string,
  currentDisplay: string,
  isResult: boolean,
  value: string
): ExpressionUpdate => {
  let newInternal = currentInternal;
  let newDisplay = currentDisplay;
  let newIsResult = isResult;

  // Input after a result is already displayed ---
  if (isResult) {
    const isNewInputOperator = OPERATORS.includes(value);
    if (isNewInputOperator) {
      newInternal = currentDisplay + value; // The previous result is the start of a new expression
    } else {
      newInternal = value === '.' ? '0.' : value;
    }
    newDisplay = newInternal;
    newIsResult = false;
  } else {
    const isInputTooLong =
      newInternal.length >= MAX_INPUT_LENGTH && !['(', ')'].includes(value); // Allow parentheses for closing complex expressions

    if (isInputTooLong) {
      return {
        newInternalExpression: currentInternal,
        newDisplayValue: currentDisplay,
      };
    }

    if (value === '.') {
      const decimalResult = _handleDecimalInput(newInternal);
      if (!decimalResult.canAppend) {
        return {
          newInternalExpression: currentInternal,
          newDisplayValue: currentDisplay,
        };
      }
      newInternal = decimalResult.updatedExpression;
    } else if (
      OPERATORS.includes(newInternal.slice(-1)) &&
      OPERATORS.includes(value)
    ) {
      newInternal = _handleConsecutiveOperatorInput(newInternal, value);
    } else if (
      newInternal === '0' &&
      value !== '.' &&
      !OPERATORS.includes(value) &&
      !['(', ')'].includes(value)
    ) {
      newInternal = value; // Replacing the initial '0' with a new number
    } else if (
      newInternal.endsWith(')') &&
      !OPERATORS.includes(value) &&
      value !== '.'
    ) {
      newInternal += '*' + value; // Implicit multiplication after a closing parenthesis: (2+3)5 -> (2+3)*5
    } else if (
      newInternal.endsWith('(') &&
      OPERATORS.includes(value) &&
      value !== '-'
    ) {
      // Prevent an invalid operator sequence after an opening parenthesis, e.g., (* or (/
      return {
        newInternalExpression: currentInternal,
        newDisplayValue: currentDisplay,
      };
    } else {
      newInternal += value;
    }
    newDisplay = newInternal === '' ? '0' : newInternal;
  }

  return {
    newInternalExpression: newInternal,
    newDisplayValue: newDisplay,
    newIsResultDisplayed: newIsResult,
  };
};

/**
 * Toggles the sign (positive/negative) of the current number or result in the calculator expression.
 * Note: This implementation handles common cases but may not cover all possible complex expressions.
 *
 * @param currentInternal - The current internal expression string being processed
 * @param currentDisplay - The current value shown on the calculator display
 * @param isResult - Boolean flag indicating if the current display shows a calculation result
 * @returns An ExpressionUpdate object containing the new expression state after toggling the sign
 */
export const processToggleSign = (
  currentInternal: string,
  currentDisplay: string,
  isResult: boolean
): ExpressionUpdate => {
  if (currentDisplay === 'Error' || currentDisplay === '0') {
    return {
      newInternalExpression: currentInternal,
      newDisplayValue: currentDisplay,
    };
  }

  let newInternal = currentInternal;
  let newDisplay = currentDisplay;

  if (isResult || !isNaN(parseFloat(currentInternal))) {
    const num = parseFloat(currentDisplay);
    if (!isNaN(num)) {
      newDisplay = String(num * -1);
      newInternal = newDisplay;
    }
  } else {
    // Attempt to toggle the last number segment in the expression
    const match = currentInternal.match(/([+\-*/(]|^)([\d.]+)$/);
    if (match) {
      const prefix = match[1];
      const numberStr = match[2];
      const baseExpr = currentInternal.substring(
        0,
        currentInternal.length - numberStr.length - prefix.length
      );

      if (
        prefix === '' &&
        currentInternal.startsWith('(-') &&
        currentInternal.endsWith(')')
      ) {
        newInternal = currentInternal.substring(2, currentInternal.length - 1);
      } else if (
        prefix === '(' &&
        currentInternal.endsWith(')') &&
        currentInternal.charAt(prefix.length) === '-'
      ) {
        newInternal = baseExpr + prefix + numberStr.substring(1);
      } else if (prefix !== '' && prefix.endsWith('(-')) {
        newInternal = baseExpr + prefix.slice(0, -2) + numberStr;
      } else {
        newInternal = baseExpr + prefix + `(-${numberStr})`;
      }
      newDisplay = newInternal;
    } else if (
      currentInternal.startsWith('(-') &&
      currentInternal.endsWith(')')
    ) {
      newInternal = currentInternal.substring(2, currentInternal.length - 1);
      newDisplay = newInternal;
    } else if (currentInternal.startsWith('-')) {
      newInternal = currentInternal.substring(1);
      newDisplay = newInternal;
    } else {
      newInternal = `(-${currentInternal})`;
      newDisplay = newInternal;
    }
  }
  return {
    newInternalExpression: newInternal,
    newDisplayValue: newDisplay,
    newIsResultDisplayed: false,
  };
};

export const formatDisplayValue = (
  val: number | string,
  maxLength: number
): string => {
  const sVal = String(val);
  if (sVal.length > maxLength) {
    const num = Number(val);
    if (
      !isNaN(num) &&
      isFinite(num) &&
      Math.abs(num) > 10 ** -(maxLength - 7)
    ) {
      try {
        let expStr = num.toExponential(maxLength - 7);
        if (expStr.length > maxLength) {
          expStr = num.toExponential(
            maxLength - (expStr.length - maxLength) - 7
          );
        }
        return expStr;
      } catch (e) {
        console.log(e);
        return sVal.slice(0, maxLength);
      }
    }
    return sVal.slice(0, maxLength);
  }
  return sVal;
};

/**
 * Applies percentage: evaluates current expression and divides by 100.
 *
 * @param currentInternal - The current calculator expression to evaluate
 * @param formatDispVal - Function to format the result value for display
 * @param formatExprPrev - Function to format the expression preview
 * @returns An ExpressionUpdate object containing the new expression state after applying percentage
 */
export const processApplyPercentage = (
  currentInternal: string,
  formatDispVal: (val: number | string) => string,
  formatExprPrev: (expr: string) => string
): ExpressionUpdate => {
  if (currentInternal.trim() === '') {
    return { newInternalExpression: '', newDisplayValue: '0' };
  }

  const evaluated = evaluateExpression(currentInternal);

  if (
    typeof evaluated === 'string' &&
    evaluated.toLowerCase().startsWith('error')
  ) {
    return {
      newInternalExpression: currentInternal,
      newDisplayValue: 'Error',
      error: evaluated,
      newIsResultDisplayed: false,
    };
  }

  const percentageValue = Number(evaluated) / 100;
  const resultStr = formatDispVal(percentageValue);

  return {
    newInternalExpression: resultStr,
    newDisplayValue: resultStr,
    newExpressionPreview: formatExprPrev(`(${currentInternal})%`),
    newIsResultDisplayed: true,
  };
};

export const formatExpressionPreview = (
  expr: string,
  maxLength: number
): string => {
  if (expr.length > maxLength) {
    return '...' + expr.slice(expr.length - maxLength + 3);
  }
  return expr;
};
