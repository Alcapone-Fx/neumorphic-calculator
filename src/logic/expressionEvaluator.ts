const ALLOWED_CHARS_REGEX = /^[0-9+\-*/().\s]+$/;

/**
 * Evaluates a mathematical expression string.
 * Uses `new Function()` for evaluation, which is generally safer than `eval()`
 * as it executes in its own scope, but still requires careful input validation.
 *
 * @param expression The mathematical expression to evaluate.
 * @returns The result of the evaluation as a number, or an error message string.
 */
export function evaluateExpression(expression: string): number | string {
  const trimmedExpression = expression.trim();
  if (!trimmedExpression) {
    return 0;
  }

  // 1. Validate allowed characters.
  if (!ALLOWED_CHARS_REGEX.test(trimmedExpression)) {
    console.error('Invalid characters in expression:', trimmedExpression);
    return 'Error: Invalid Chars';
  }

  // 2. Sanity checks for common malformed patterns.
  // These checks aim to catch syntax errors before new Function() does.
  const cleanedForSanityCheck = trimmedExpression.replace(/\s/g, '');

  // Looks for repeated operators/dots, and operators at invalid positions relative to parentheses.
  // It allows '*-' and '/-' by temporarily replacing them.
  let tempCheckExpr = cleanedForSanityCheck;
  // Placeholder for valid "times negative"
  tempCheckExpr = tempCheckExpr.replace(/\*-(?=\d|\()/g, '*#NEG#');
  // Placeholder for valid "divide by negative"
  tempCheckExpr = tempCheckExpr.replace(/\/- (?=\d|\()/g, '/#NEG#');

  // Check for:
  // 1. Two or more operators/dots (e.g., ++, .., */.) after #NEG# replacement.
  // 2. An operator directly followed by a closing parenthesis (e.g., 5+) ).
  // 3. An opening parenthesis directly followed by a non-unary operator (e.g., (*3) ).
  // 4. Empty parentheses `()`.
  const sanityIssuesRegex = /(?:[+*/.]|[#NEG#]){2,}|[+\-*/]\)| \([+*/]|\(\)/;
  if (sanityIssuesRegex.test(tempCheckExpr)) {
    // Check if the issue was due to our #NEG# placeholder if it wasn't fully replaced by an operator
    if (
      !tempCheckExpr.includes('#NEG##NEG#') &&
      !tempCheckExpr.match(/[+*/.][#NEG#]/) &&
      !tempCheckExpr.match(/[#NEG#][+*/.]/)
    ) {
      console.error(
        'Malformed expression (sanity check failed):',
        trimmedExpression
      );
      return 'Error: Malformed';
    }
  }
  // Check for an operator at the very end of the expression (unless it's a closing parenthesis)
  if (
    /[+\-*/.]$/.test(cleanedForSanityCheck) &&
    !cleanedForSanityCheck.endsWith(')')
  ) {
    console.error('Expression ends with an operator:', trimmedExpression);
    return 'Error: Operator End';
  }

  // 3. Balance parentheses check.
  // Ensures that all opening parentheses are properly closed.
  let balance = 0;
  for (const char of trimmedExpression) {
    if (char === '(') {
      balance++;
    } else if (char === ')') {
      balance--;
    }
    // If balance drops below zero, it means a ')' appeared without a matching '('.
    if (balance < 0) {
      console.error('Unbalanced parentheses (early close):', trimmedExpression);
      return 'Error: Parentheses';
    }
  }
  // If the balance is not zero at the end, there are unclosed '('.
  if (balance !== 0) {
    console.error('Unbalanced parentheses (not closed):', trimmedExpression);
    return 'Error: Parentheses';
  }

  // 4. Evaluate the expression.
  try {
    const result = new Function('return ' + trimmedExpression)();

    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
      if (String(result).toLowerCase().includes('error')) {
        return String(result);
      }
      console.warn(
        'Calculation resulted in NaN or Infinity:',
        trimmedExpression,
        '->',
        result
      );
      return 'Error: Calculation';
    }
    return result;
  } catch (error) {
    console.error(
      'Evaluation error by new Function():',
      error,
      'Expression:',
      trimmedExpression
    );
    if (error instanceof SyntaxError) {
      return 'Error: Syntax';
    }
    return 'Error: Invalid';
  }
}
