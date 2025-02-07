type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private readonly maxLogs: number = 1000;
  private readonly shouldConsoleLog: boolean = true;
  private readonly shouldSaveToStorage: boolean = true;

  private constructor() {
    // Load any existing logs from localStorage
    this.loadLogsFromStorage();
    
    // Clear old logs on startup
    this.clearOldLogs();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: this.formatTimestamp(),
      level,
      message,
      data,
    };
  }

  private saveToStorage(): void {
    if (this.shouldSaveToStorage) {
      try {
        localStorage.setItem('app_logs', JSON.stringify(this.logs));
      } catch (error) {
        console.error('Failed to save logs to localStorage:', error);
      }
    }
  }

  private loadLogsFromStorage(): void {
    if (this.shouldSaveToStorage) {
      try {
        const savedLogs = localStorage.getItem('app_logs');
        if (savedLogs) {
          this.logs = JSON.parse(savedLogs);
        }
      } catch (error) {
        console.error('Failed to load logs from localStorage:', error);
      }
    }
  }

  private clearOldLogs(): void {
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
      this.saveToStorage();
    }
  }

  private log(level: LogLevel, message: string, data?: any): void {
    const logEntry = this.formatLogEntry(level, message, data);
    this.logs.push(logEntry);

    if (this.shouldConsoleLog) {
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[consoleMethod](`[${logEntry.timestamp}] [${level.toUpperCase()}] ${message}`, data || '');
    }

    this.clearOldLogs();
    this.saveToStorage();
  }

  public info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  public warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  public error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  public debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, data);
    }
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
    this.saveToStorage();
  }

  public downloadLogs(): void {
    const logsJson = JSON.stringify(this.logs, null, 2);
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-logs-${this.formatTimestamp()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const logger = Logger.getInstance();
