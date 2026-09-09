import '@testing-library/jest-dom/vitest';

// Recharts and dialog components measure layout that jsdom does not implement.
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

window.matchMedia =
  window.matchMedia ||
  ((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }));
