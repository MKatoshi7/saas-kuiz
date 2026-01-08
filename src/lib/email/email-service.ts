
export interface EmailProvider {
    sendEmail(to: string, subject: string, html: string): Promise<void>;
}

class ConsoleEmailProvider implements EmailProvider {
    async sendEmail(to: string, subject: string, html: string): Promise<void> {
        console.log('---------------------------------------------------');
        console.log(`[EmailService] Sending email to: ${to}`);
        console.log(`[EmailService] Subject: ${subject}`);
        console.log(`[EmailService] Content Preview: ${html.substring(0, 100)}...`);
        console.log('---------------------------------------------------');
    }
}

export const emailService = new ConsoleEmailProvider();
