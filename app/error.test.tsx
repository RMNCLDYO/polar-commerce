import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as logger from '@/lib/shared/logger';
import ErrorBoundary from './error';

// Mock the logger module
vi.mock('@/lib/shared/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('ErrorBoundary', () => {
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render error boundary with generic message in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const error = new Error('Sensitive database connection error');
    render(<ErrorBoundary error={error} reset={mockReset} />);

    // Should not show the actual error message
    expect(screen.queryByText(/Sensitive database connection/i)).not.toBeInTheDocument();

    // Should show generic error message
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should render error boundary with network error message', () => {
    const error = new Error('Failed to fetch data from server');
    render(<ErrorBoundary error={error} reset={mockReset} />);

    expect(screen.getByText(/Unable to connect to our servers/)).toBeInTheDocument();
  });

  it('should render error boundary with timeout error message', () => {
    const error = new Error('Request timeout exceeded');
    render(<ErrorBoundary error={error} reset={mockReset} />);

    expect(screen.getByText(/The request took too long to complete/)).toBeInTheDocument();
  });

  it('should render error boundary with authentication error message', () => {
    const error = new Error('Unauthorized access attempt');
    render(<ErrorBoundary error={error} reset={mockReset} />);

    expect(screen.getByText(/Your session has expired/)).toBeInTheDocument();
  });

  it('should render error boundary with payment error message', () => {
    const error = new Error('Stripe payment failed');
    render(<ErrorBoundary error={error} reset={mockReset} />);

    expect(screen.getByText(/There was an issue processing your payment/)).toBeInTheDocument();
  });

  it('should show error digest in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const error = Object.assign(new Error('Test error'), {
      digest: 'test-digest-123',
    });

    render(<ErrorBoundary error={error} reset={mockReset} />);

    expect(screen.getByText(/Error ID: test-digest-123/)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should not show error digest in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const error = Object.assign(new Error('Test error'), {
      digest: 'test-digest-123',
    });

    render(<ErrorBoundary error={error} reset={mockReset} />);

    expect(screen.queryByText(/Error ID: test-digest-123/)).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should call reset function when try again button is clicked', () => {
    const error = new Error('Test error');
    render(<ErrorBoundary error={error} reset={mockReset} />);

    const tryAgainButton = screen.getByRole('button', { name: /Try again/i });
    fireEvent.click(tryAgainButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('should log error to logger with full details', () => {
    const error = Object.assign(new Error('Test error message'), {
      digest: 'error-digest',
      stack: 'Error stack trace',
    });

    render(<ErrorBoundary error={error} reset={mockReset} />);

    expect(logger.logger.error).toHaveBeenCalledWith(
      'Error boundary caught error',
      {
        error: 'Test error message',
        stack: 'Error stack trace',
        digest: 'error-digest',
      }
    );
  });

  it('should render contact support link', () => {
    const error = new Error('Test error');
    render(<ErrorBoundary error={error} reset={mockReset} />);

    const contactLink = screen.getByRole('link', { name: /contact support/i });
    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute('href', '/contact');
  });

  it('should handle errors without messages gracefully', () => {
    const error = new Error();
    render(<ErrorBoundary error={error} reset={mockReset} />);

    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
  });
});