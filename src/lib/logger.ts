import prisma from '@/lib/prisma';

type LogLevel = 'info' | 'warn' | 'error';

export const logger = {
    async log(level: LogLevel, message: string, context?: any, error?: any) {
        try {
            // Console log for immediate feedback
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, context || '');
            if (error) console.error(error);

            // Save to DB
            await prisma.systemLog.create({
                data: {
                    level,
                    message,
                    context: context ? JSON.parse(JSON.stringify(context)) : undefined,
                    stack: error instanceof Error ? error.stack : String(error),
                },
            });
        } catch (e) {
            // Fallback if DB logging fails
            console.error('Failed to write to SystemLog:', e);
        }
    },

    info(message: string, context?: any) {
        return this.log('info', message, context);
    },

    warn(message: string, context?: any) {
        return this.log('warn', message, context);
    },

    error(message: string, error?: any, context?: any) {
        return this.log('error', message, context, error);
    },
};
