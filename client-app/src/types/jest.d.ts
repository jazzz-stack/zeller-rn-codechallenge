// Jest global types for TypeScript
declare global {
  var __DEV__: boolean;
  
  namespace jest {
    interface Matchers<R> {
      toBeOnTheScreen(): R;
      toHaveProp(prop: string, value?: any): R;
    }
  }
}

export {};
