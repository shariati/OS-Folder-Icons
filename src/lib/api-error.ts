import { NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';

const logger = createLogger('api-error');

/**
 * Error handling utilities for API routes
 * Provides generic error messages in production while logging detailed errors
 */

interface ApiErrorOptions {
    status?: number;
    logContext?: Record<string, unknown>;
}

/**
 * Handle an API error - logs detailed info but returns generic message in production
 */
export function handleApiError(
    error: unknown,
    publicMessage: string = 'An error occurred',
    options: ApiErrorOptions = {}
): NextResponse {
    const { status = 500, logContext = {} } = options;
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Always log the full error server-side
    logger.error({ err: error, ...logContext }, publicMessage);

    // In development, return detailed error info
    // In production, return only public message
    const responseBody = isDevelopment && error instanceof Error
        ? { error: publicMessage, details: error.message, stack: error.stack }
        : { error: publicMessage };

    return NextResponse.json(responseBody, { status });
}

/**
 * Create a standardized error response
 */
export function errorResponse(message: string, status: number = 500): NextResponse {
    return NextResponse.json({ error: message }, { status });
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
    return NextResponse.json(data, { status });
}

/**
 * Wrap an async handler with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<NextResponse>>(
    handler: T,
    publicMessage: string = 'Request failed'
): T {
    return (async (...args: Parameters<T>): Promise<NextResponse> => {
        try {
            return await handler(...args);
        } catch (error) {
            return handleApiError(error, publicMessage);
        }
    }) as T;
}
