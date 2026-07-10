declare module 'react' {
  export function useMemo<T>(factory: () => T, deps: unknown[]): T;
  export function useState<T>(initial: T): [T, (value: T | ((current: T) => T)) => void];
  export const StrictMode: (props: { children?: unknown }) => unknown;
}

declare module 'react-dom/client' {
  export default { createRoot(container: Element): { render(children: unknown): void } };
}

declare namespace JSX {
  interface IntrinsicElements { [elemName: string]: any }
}

declare module 'react/jsx-runtime' { export const jsx: any; export const jsxs: any; export const Fragment: any; }
declare module '*.css';
