# Neumorphic Calculator

A modern neumorphic calculator built with Preact, TypeScript, and Vite. This project demonstrates best practices in front-end development, including clean architecture principles, SOLID design, and comprehensive testing.

## ✨ Features
*   **Basic Arithmetic Operations:** Addition, subtraction, multiplication, division.
*   **Expression Grouping:** Support for parentheses `()` to control order of operations.
*   **Percentage Calculation:** `%` operator.
*   **Sign Toggling:** `+/-` operator to change the sign of the current number or result.
*   **Neumorphic Design:** A visually appealing interface with soft UI elements.
*   **Light & Dark Theme:** Switchable themes for user preference, with settings saved to `localStorage`.
*   **Error Handling:** Displays user-friendly messages for invalid operations or syntax errors.

## 🚀 Live Demo
https://neumorphic-calculator-psi.vercel.app

## 🛠️ Tech Stack
*   **Framework:** [Preact](https://preactjs.com/) (Fast 3kB alternative to React with the same modern API)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Styling:** CSS Modules + Global CSS Variables (for theming and neumorphism)
*   **Testing:** [Vitest](https://vitest.dev/) + [Preact Testing Library](https://testing-library.com/docs/preact-testing-library/intro/)
*   **Linting & Formatting:** ESLint + Prettier

## 🏛️ Architecture & Design Principles
This project strives to adhere to modern software design principles to ensure a high-quality, maintainable, and scalable codebase:
*   **Clean Architecture (Simplified):**
    *   **UI (Components):** Preact components responsible for rendering and user interaction.
    *   **Hooks (Application/UI Logic):** Custom Preact hooks (`useCalculatorState`, `useTheme`) manage state and orchestrate actions.
    *   **Logic (Domain/Utility):** Pure functions in `calculatorProcessor.ts` and `expressionEvaluator.ts` handle core calculation logic and input processing, decoupled from the UI.
*   **SOLID Principles:** Applied throughout the component and logic design.
    *   **S**ingle Responsibility Principle: Each module, component, and function aims to have one primary responsibility.
    *   **O**pen/Closed Principle: Theming system allows adding new themes without modifying existing logic.
    *   **D**ependency Inversion Principle: Hooks abstract complex logic, and components depend on these abstractions.
*   **Testability:** Code is structured for easy unit and integration testing. Dependencies are generally injectable or easily mockable.
*   **Modularity:** Code is organized into logical directories for components (atoms, organisms), hooks, and business logic.

## 📂 Project Structure
```
/public/                  
/src/
├── assets/               
├── components/           # Preact components (further organized by atomic design if complex)
│   ├── atoms/            # Basic UI elements (Button, Display, etc.)
│   └── organisms/        # Complex components composed of atoms/molecules (Calculator)
├── hooks/                # Custom Preact hooks (useCalculatorState, useTheme)
├── logic/                # Core business logic, pure functions (calculatorProcessor, expressionEvaluator)
├── styles/               # Global styles and theme definitions
├── index.tsx             # Main application entry point
└── setupTests.ts         # Vitest setup file
vite.config.ts            
tsconfig.json             
.eslintrc.cjs             
.prettierrc.json          
```

## 🏁 Getting Started
### Prerequisites

*   [Node.js](https://nodejs.org/) (v18.x or later recommended)
*   [npm](https://www.npmjs.com/) (or [yarn](https://yarnpkg.com/)/[pnpm](https://pnpm.io/))

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/Alcapone-Fx/neumorphic-calculator.git
    cd neumorphic-calculator
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    # yarn install
    # or
    # pnpm install
    ```

### Running the Development Server

To start the development server with hot reloading:

```bash
npm run dev
```
The application will be available at `http://localhost:5173` (or the port Vite chooses).

### Building for Production

To create an optimized production build:

```bash
npm run build
```
The output files will be in the `dist/` directory.

### Previewing the Production Build

To serve the production build locally for testing:

```bash
npm run preview
```

## 🧪 Running Tests

This project uses [Vitest](https://vitest.dev/) for unit and integration testing.

To run all tests:

```bash
npm run test
```

Test files are located alongside the code they test (e.g., `*.test.ts` or `*.test.tsx`). Coverage includes:
*   Logic functions (`calculatorProcessor.ts`, `expressionEvaluator.ts`)
*   Custom hooks (`useCalculatorState.ts`, `useTheme.ts`)
*   UI Components (`Button.tsx`, `Display.tsx`, `Calculator.tsx`)

## 🎨 Styling & Theming
*   **Neumorphism:** Achieved using CSS `box-shadow` properties with light and dark shadow colors.
*   **CSS Modules:** Used for component-scoped styles to prevent naming collisions.
*   **CSS Custom Properties (Variables):** Extensively used for theming (light/dark modes) and consistent styling. Theme variables are defined in `src/styles/themes.css` and applied globally in `src/styles/global.css`.
*   **Theme Switching:** The `useTheme` hook manages theme state, applies the `data-theme` attribute to the `<html>` element, and persists the user's preference in `localStorage`.

## 💡 Potential Future Enhancements
*   [ ] Keyboard support for input
*   [ ] Calculation history
*   [ ] More sophisticated error handling and display
*   [ ] Advanced mathematical functions (sin, cos, tan, log, etc.)
*   [ ] Unit conversion capabilities
*   [ ] Further accessibility improvements (e.g., ARIA roles for complex interactions)

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
