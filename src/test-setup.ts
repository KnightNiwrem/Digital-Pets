import { Window } from "happy-dom";

// Setup DOM environment for React hooks
if (typeof window === "undefined") {
  const window = new Window();
  // biome-ignore lint/suspicious/noExplicitAny: Mocking global window
  global.window = window as any;
  // biome-ignore lint/suspicious/noExplicitAny: Mocking global document
  global.document = window.document as any;
  // biome-ignore lint/suspicious/noExplicitAny: Mocking global navigator
  global.navigator = window.navigator as any;
}
