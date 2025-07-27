// Client-side logging utility that forwards logs to server console
class ServerLogger {
  constructor() {
    this.isEnabled = typeof window !== 'undefined' && process.env.NODE_ENV === 'development';
    this.originalConsole = {};
    
    if (this.isEnabled) {
      this.setupConsoleInterception();
    }
  }
  
  setupConsoleInterception() {
    // Store original console methods
    this.originalConsole.log = console.log;
    this.originalConsole.error = console.error;
    this.originalConsole.warn = console.warn;
    this.originalConsole.info = console.info;
    
    // Override console methods to also send to server
    console.log = (...args) => {
      this.originalConsole.log(...args);
      this.sendToServer('log', this.formatMessage(args));
    };
    
    console.error = (...args) => {
      this.originalConsole.error(...args);
      this.sendToServer('error', this.formatMessage(args));
    };
    
    console.warn = (...args) => {
      this.originalConsole.warn(...args);
      this.sendToServer('warn', this.formatMessage(args));
    };
    
    console.info = (...args) => {
      this.originalConsole.info(...args);
      this.sendToServer('info', this.formatMessage(args));
    };
  }
  
  formatMessage(args) {
    return args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
  }
  
  async sendToServer(level, message) {
    if (!this.isEnabled) return;
    
    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level,
          message,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });
    } catch (error) {
      // Don't log this error to avoid infinite loops
      this.originalConsole.error('Failed to send log to server:', error);
    }
  }
  
  // Manual logging method for specific Safari mobile debugging
  safariLog(message, data = null) {
    const logMessage = `[SAFARI-DEBUG] ${message}`;
    this.originalConsole.log(logMessage, data);
    this.sendToServer('info', `${logMessage} ${data ? JSON.stringify(data) : ''}`);
  }
}

// Initialize the logger
const serverLogger = new ServerLogger();

// Export for manual use
export { serverLogger };
