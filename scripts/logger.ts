/**
 * Structured logging utility for seeding scripts
 * Provides consistent, colored output with proper log levels
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
} as const;

interface LoggerOptions {
  prefix?: string;
  timestamp?: boolean;
}

/**
 * Creates a structured logger instance
 */
export class Logger {
  private options: LoggerOptions;

  constructor(options: LoggerOptions = {}) {
    this.options = {
      timestamp: false,
      ...options,
    };
  }

  private getTimestamp(): string {
    if (!this.options.timestamp) return '';
    return `${colors.dim}[${new Date().toISOString()}]${colors.reset} `;
  }

  private getPrefix(): string {
    if (!this.options.prefix) return '';
    return `${this.options.prefix} `;
  }

  private format(message: string): string {
    const timestamp = this.getTimestamp();
    const prefix = this.getPrefix();
    return `${timestamp}${prefix}${message}`;
  }

  info(message: string): void {
    console.log(this.format(`${colors.cyan}ℹ ${message}${colors.reset}`));
  }

  success(message: string): void {
    console.log(this.format(`${colors.green}✓ ${message}${colors.reset}`));
  }

  warning(message: string, error?: Error | unknown): void {
    const errorMessage =
      error instanceof Error ? error.message : String(error ?? '');
    const fullMessage = errorMessage ? `${message}: ${errorMessage}` : message;
    console.warn(
      this.format(`${colors.yellow}⚠ ${fullMessage}${colors.reset}`),
    );
  }

  error(message: string, error?: Error | unknown): void {
    const errorMessage =
      error instanceof Error ? error.message : String(error ?? '');
    const fullMessage = errorMessage ? `${message}: ${errorMessage}` : message;
    console.error(this.format(`${colors.red}✗ ${fullMessage}${colors.reset}`));
  }

  debug(message: string): void {
    if (process.env.DEBUG) {
      console.debug(this.format(`${colors.dim}⊙ ${message}${colors.reset}`));
    }
  }

  section(title: string): void {
    console.log(`\n${colors.bright}${colors.magenta}${title}${colors.reset}`);
    console.log('='.repeat(70));
  }

  subsection(title: string): void {
    console.log(`\n${colors.yellow}${title}${colors.reset}`);
  }

  step(stepNumber: number, title: string): void {
    console.log(`\n${colors.yellow}${stepNumber}️⃣  ${title}${colors.reset}`);
  }

  divider(): void {
    console.log('─'.repeat(70));
  }

  separator(): void {
    console.log('='.repeat(70));
  }

  blank(): void {
    console.log();
  }

  item(key: string, value: string | number | boolean): void {
    console.log(`  ${colors.dim}${key}:${colors.reset} ${value}`);
  }

  list(items: string[]): void {
    items.forEach((item) => {
      console.log(`  • ${item}`);
    });
  }

  progress(current: number, total: number, item?: string): void {
    const percentage = Math.round((current / total) * 100);
    const itemText = item ? ` - ${item}` : '';
    console.log(
      `  ${colors.cyan}[${current}/${total}] ${percentage}%${itemText}${colors.reset}`,
    );
  }

  table(headers: string[], rows: string[][]): void {
    const columnWidths = headers.map((header, i) => {
      const cellWidths = rows.map((row) => (row[i] ?? '').length);
      return Math.max(header.length, ...cellWidths);
    });

    const formatRow = (cells: string[]) => {
      return cells
        .map((cell, i) => cell.padEnd(columnWidths[i] ?? 0))
        .join(' | ');
    };

    console.log(formatRow(headers));
    console.log(columnWidths.map((w) => '─'.repeat(w)).join('─┼─'));
    rows.forEach((row) => {
      console.log(formatRow(row));
    });
  }
}

export const createLogger = (options?: LoggerOptions): Logger =>
  new Logger(options);

export const defaultLogger = new Logger();
