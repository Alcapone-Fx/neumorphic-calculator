import { useState, useCallback } from 'preact/hooks';

import { evaluateExpression } from '../logic/expressionEvaluator';
import {
  processInput,
  processToggleSign,
  processApplyPercentage,
  formatDisplayValue as formatDisplay,
  formatExpressionPreview as formatPreview,
  ExpressionUpdate,
} from '../logic/calculatorProcessor';

const MAX_DISPLAY_LENGTH = 16;
const MAX_EXPRESSION_PREVIEW_LENGTH = 24;

export function useCalculatorState() {
  const [internalExpression, setInternalExpression] = useState('');
  const [displayValue, setDisplayValue] = useState('0');
  const [expressionPreview, setExpressionPreview] = useState('');
  const [isResultDisplayed, setIsResultDisplayed] = useState(false);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const _formatDisplayValue = useCallback((val: number | string) => {
    return formatDisplay(val, MAX_DISPLAY_LENGTH);
  }, []);

  const _formatExpressionPreview = useCallback((expr: string) => {
    return formatPreview(expr, MAX_EXPRESSION_PREVIEW_LENGTH);
  }, []);

  const clearError = useCallback(() => {
    if (error) setError(null);
  }, [error]);

  const applyUpdate = useCallback(
    (update: ExpressionUpdate) => {
      setInternalExpression(update.newInternalExpression);
      setDisplayValue(update.newDisplayValue);

      if (update.newExpressionPreview !== undefined) {
        setExpressionPreview(update.newExpressionPreview);
      }
      if (update.newIsResultDisplayed !== undefined) {
        setIsResultDisplayed(update.newIsResultDisplayed);
      }
      if (update.error !== undefined) {
        setError(update.error);
      } else if (error) {
        clearError();
      }
    },
    [error, clearError]
  );

  const handleInput = useCallback(
    (value: string) => {
      clearError();
      setJustEvaluated(false);

      const update = processInput(
        internalExpression,
        displayValue,
        isResultDisplayed,
        value
      );

      if (update.newIsResultDisplayed === false) {
        setExpressionPreview('');
      }
      applyUpdate(update);
    },
    [
      internalExpression,
      displayValue,
      isResultDisplayed,
      applyUpdate,
      clearError,
    ]
  );

  const calculate = useCallback(() => {
    clearError();
    if (
      !internalExpression.trim() ||
      (justEvaluated && internalExpression === displayValue)
    ) {
      return;
    }

    setExpressionPreview(_formatExpressionPreview(internalExpression + '='));
    const result = evaluateExpression(internalExpression);

    if (
      typeof result === 'string' &&
      result.toLowerCase().startsWith('error')
    ) {
      setError(result);
      setDisplayValue('Error');
      setIsResultDisplayed(false);
    } else {
      const finalResultStr = _formatDisplayValue(Number(result));
      setDisplayValue(finalResultStr);
      setInternalExpression(finalResultStr);
      setIsResultDisplayed(true);
      setJustEvaluated(true);
    }
  }, [
    internalExpression,
    displayValue,
    justEvaluated,
    clearError,
    _formatDisplayValue,
    _formatExpressionPreview,
  ]);

  const clearAll = useCallback(() => {
    clearError();
    setInternalExpression('');
    setDisplayValue('0');
    setExpressionPreview('');
    setIsResultDisplayed(false);
    setJustEvaluated(false);
  }, [clearError]);

  const deleteLast = useCallback(() => {
    clearError();
    setJustEvaluated(false);

    if (isResultDisplayed) {
      clearAll();
      return;
    }

    const newExpr = internalExpression.slice(0, -1);
    setInternalExpression(newExpr);
    setDisplayValue(newExpr || '0');
    setExpressionPreview('');
    setIsResultDisplayed(false);
  }, [isResultDisplayed, internalExpression, clearError, clearAll]);

  const toggleSign = useCallback(() => {
    clearError();
    setJustEvaluated(false);

    const update = processToggleSign(
      internalExpression,
      displayValue,
      isResultDisplayed
    );
    applyUpdate(update);

    if (update.newIsResultDisplayed === false) {
      setExpressionPreview('');
    }
  }, [
    internalExpression,
    displayValue,
    isResultDisplayed,
    applyUpdate,
    clearError,
  ]);

  const applyPercentage = useCallback(() => {
    clearError();
    setJustEvaluated(false);
    if (displayValue === 'Error' || internalExpression.trim() === '') {
      return;
    }

    const update = processApplyPercentage(
      internalExpression,
      _formatDisplayValue,
      _formatExpressionPreview
    );
    applyUpdate(update);

    if (update.newIsResultDisplayed) {
      setJustEvaluated(true);
    }
  }, [
    internalExpression,
    displayValue,
    applyUpdate,
    clearError,
    _formatDisplayValue,
    _formatExpressionPreview,
  ]);

  return {
    displayValue,
    expression: expressionPreview,
    error,
    handleInput,
    calculate,
    clearAll,
    deleteLast,
    toggleSign,
    applyPercentage,
  };
}
