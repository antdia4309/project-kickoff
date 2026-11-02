// jest-dom adds custom matchers like toBeInTheDocument().
import "@testing-library/jest-dom";

// jsdom doesn't implement scrolling; the app scrolls to top on step change.
window.scrollTo = jest.fn();

beforeEach(() => {
  localStorage.clear();
});
