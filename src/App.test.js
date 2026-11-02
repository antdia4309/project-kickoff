import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

test("renders the first step", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: "Project Kickoff" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "What are we building?" })).toBeInTheDocument();
});

test("loads the example and shows a readiness score on review", () => {
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "Load example" }));
  fireEvent.click(screen.getByRole("button", { name: /Review & export/ }));
  expect(screen.getByRole("heading", { name: "Review and export" })).toBeInTheDocument();
  expect(screen.getByRole("img", { name: /Readiness score \d+ out of 100/ })).toBeInTheDocument();
});

test("switches export format to CLAUDE.md", () => {
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "Load example" }));
  fireEvent.click(screen.getByRole("button", { name: /Review & export/ }));
  fireEvent.click(screen.getByRole("tab", { name: "CLAUDE.md" }));
  expect(screen.getByLabelText("CLAUDE.md preview")).toHaveTextContent("# Neighborhood Park Finder");
});

test("remembers answers after a reload", () => {
  const { unmount } = render(<App />);
  fireEvent.change(screen.getByLabelText(/Project name/), { target: { value: "Saved project" } });
  unmount();
  render(<App />);
  expect(screen.getByLabelText(/Project name/)).toHaveValue("Saved project");
});