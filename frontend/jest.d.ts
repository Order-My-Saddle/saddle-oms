import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveClass(className: string): R;
    }
  }
}

export {};
