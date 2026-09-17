export {};
declare global {
  interface Window { liquidGlass: (el: HTMLElement, options?: Record<string, number>) => {supported: boolean; refresh: () => void; destroy: () => void}; }
}
