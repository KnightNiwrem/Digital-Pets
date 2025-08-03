/**
 * Centralized logging utility for the Digital Pets game
 * Provides consistent logging with different levels and conditional output
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LoggerConfig {
  level: LogLevel;
  enabled: boolean;
  prefix: string;
}

class GameLogger {
  private config: LoggerConfig = {
    level: process.env.NODE_ENV === "production" ? LogLevel.WARN : LogLevel.DEBUG,
    enabled: true,
    prefix: "[Digital Pets]",
  };

  /**
   * Configure logger settings
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if logging is enabled for the given level
   */
  private shouldLog(level: LogLevel): boolean {
    return this.config.enabled && level >= this.config.level;
  }

  /**
   * Format log message with timestamp and context
   */
  private formatMessage(level: string, context: string, message: string): string {
    const timestamp = new Date().toISOString().substring(11, 23); // HH:mm:ss.sss
    return `${this.config.prefix} [${timestamp}] ${level.toUpperCase()}: [${context}] ${message}`;
  }

  /**
   * Debug level logging - detailed information for debugging
   */
  debug(context: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage("debug", context, message), ...args);
    }
  }

  /**
   * Info level logging - general information about application flow
   */
  info(context: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage("info", context, message), ...args);
    }
  }

  /**
   * Warning level logging - potentially harmful situations
   */
  warn(context: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage("warn", context, message), ...args);
    }
  }

  /**
   * Error level logging - error events that might still allow application to continue
   */
  error(context: string, message: string, error?: unknown, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage("error", context, message), error, ...args);
    }
  }

  /**
   * Success logging for positive outcomes (info level)
   */
  success(context: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage("success", context, `✅ ${message}`), ...args);
    }
  }

  /**
   * Game action logging - specific to game events
   */
  gameAction(action: string, details: string, ...args: unknown[]): void {
    this.info("GameAction", `${action}: ${details}`, ...args);
  }

  /**
   * Battle logging - specific to battle events
   */
  battle(event: string, details: string, ...args: unknown[]): void {
    this.info("Battle", `${event}: ${details}`, ...args);
  }

  /**
   * Transaction logging - for shop and inventory operations
   */
  transaction(type: "buy" | "sell" | "use", item: string, details: string, ...args: unknown[]): void {
    this.info("Transaction", `${type.toUpperCase()} ${item}: ${details}`, ...args);
  }

  /**
   * System logging - for internal system operations
   */
  system(component: string, event: string, details?: string, ...args: unknown[]): void {
    const message = details ? `${event}: ${details}` : event;
    this.debug("System", `[${component}] ${message}`, ...args);
  }
}

// Export singleton instance
export const Logger = new GameLogger();

// Export convenience functions for common patterns
export const logGameAction = Logger.gameAction.bind(Logger);
export const logBattle = Logger.battle.bind(Logger);
export const logTransaction = Logger.transaction.bind(Logger);
export const logSystem = Logger.system.bind(Logger);
export const logSuccess = Logger.success.bind(Logger);
export const logError = Logger.error.bind(Logger);
export const logWarning = Logger.warn.bind(Logger);
export const logInfo = Logger.info.bind(Logger);
export const logDebug = Logger.debug.bind(Logger);
