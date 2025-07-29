// Export all game types for easy importing

// Pet system
export * from "./Pet";

// Item system
export * from "./Item";

// World system
export * from "./World";

// Battle system
export * from "./Battle";

// Quest system
export * from "./Quest";

// Game state
export * from "./GameState";

// Common utility types
export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

// Generic result type for operations that can fail
export interface Result<T, E = string> {
  success: boolean;
  data?: T;
  error?: E;
  message?: string;
}

// Async operation state
export interface AsyncState<T> {
  loading: boolean;
  data?: T;
  error?: string;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

// Event handler types
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

// Utility types for state management
export type StateUpdater<T> = (current: T) => T;
export type StateSetter<T> = (newState: T | StateUpdater<T>) => void;
