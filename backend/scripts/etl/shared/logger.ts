/**
 * Logger structuré pour les ETL scripts
 * Format JSON pour faciliter le parsing (ex: par Loki, CloudWatch Logs)
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: any;
}

class ETLLogger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };

    if (this.isDevelopment) {
      // Format lisible en dev
      const emoji = this.getEmoji(level);
      console.log(`${emoji} [${timestamp}] ${level.toUpperCase()}: ${message}`);
      if (context) {
        console.log('  Context:', context);
      }
    } else {
      // JSON structuré en prod
      console.log(JSON.stringify(logEntry));
    }
  }

  private getEmoji(level: LogLevel): string {
    switch (level) {
      case 'info':
        return 'ℹ️';
      case 'warn':
        return '⚠️';
      case 'error':
        return '❌';
      case 'debug':
        return '🔍';
      default:
        return '';
    }
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment || process.env.LOG_LEVEL === 'debug') {
      this.log('debug', message, context);
    }
  }
}

export const logger = new ETLLogger();

