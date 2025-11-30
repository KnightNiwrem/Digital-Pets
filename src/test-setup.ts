import { Window } from "happy-dom";

// Setup DOM environment for React hooks
if (typeof window === "undefined") {
  const happyWindow = new Window();
  // biome-ignore lint/suspicious/noExplicitAny: Mocking global window
  global.window = happyWindow as any;
  // biome-ignore lint/suspicious/noExplicitAny: Mocking global document
  global.document = happyWindow.document as any;
  // biome-ignore lint/suspicious/noExplicitAny: Mocking global navigator
  global.navigator = happyWindow.navigator as any;
}
