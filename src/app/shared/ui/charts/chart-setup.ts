/**
 * Polyfills required by ApexCharts in jsdom test environment.
 * Import this at the top of chart spec files.
 */

// ResizeObserver polyfill for ApexCharts
if (typeof (globalThis as any).ResizeObserver === 'undefined') {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as any).ResizeObserver = ResizeObserverMock;
}

// Mock getBoundingClientRect for chart elements
const origGetBoundingClientRect = Element.prototype.getBoundingClientRect;
if (!origGetBoundingClientRect || (() => {
  try { const r = document.createElement('div').getBoundingClientRect(); return !!r; } catch { return false; }
})()) {
  Element.prototype.getBoundingClientRect = function () {
    return {
      x: 0, y: 0,
      width: 600, height: 400,
      top: 0, right: 600, bottom: 400, left: 0,
      toJSON() { return this; },
    };
  };
}

// Suppress ApexCharts animation errors in jsdom by mocking SVG element methods
const svgProto = (document.createElementNS('http://www.w3.org/2000/svg', 'svg') as any)
  .__proto__.__proto__;
if (svgProto) {
  if (!svgProto.getScreenCTM) {
    svgProto.getScreenCTM = () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
  }
  if (!svgProto.createSVGMatrix) {
    svgProto.createSVGMatrix = () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
  }
  if (!svgProto.createSVGPoint) {
    svgProto.createSVGPoint = () => ({ x: 0, y: 0, matrixTransform: () => ({ x: 0, y: 0 }) });
  }
}
