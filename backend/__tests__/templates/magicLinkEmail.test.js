/**
 * Magic Link Email Template Tests
 */

const { magicLinkEmailTemplate } = require('../../src/templates/magicLinkEmail');

describe('Magic Link Email Template', () => {
    describe('magicLinkEmailTemplate', () => {
        it('should generate HTML email template', () => {
            const magicLink = 'https://example.com/auth/magic?token=abc123';
            const email = 'test@example.com';

            const result = magicLinkEmailTemplate(magicLink, email);

            expect(typeof result).toBe('string');
            expect(result).toContain('<!DOCTYPE html>');
            expect(result).toContain(magicLink);
            expect(result).toContain(email);
        });

        it('should include proper HTML structure', () => {
            const magicLink = 'https://example.com/auth/magic?token=xyz789';
            const email = 'user@test.com';

            const result = magicLinkEmailTemplate(magicLink, email);

            expect(result).toContain('<html lang="en">');
            expect(result).toContain('<head>');
            expect(result).toContain('<body>');
            expect(result).toContain('</html>');
        });

        it('should handle special characters in email', () => {
            const magicLink = 'https://example.com/auth/magic?token=test123';
            const email = 'user+test@example.com';

            const result = magicLinkEmailTemplate(magicLink, email);

            expect(result).toContain(email);
            expect(typeof result).toBe('string');
        });

        it('should include title and styling', () => {
            const magicLink = 'https://example.com/auth/magic?token=test';
            const email = 'test@example.com';

            const result = magicLinkEmailTemplate(magicLink, email);

            expect(result).toContain('<title>');
            expect(result).toContain('<style>');
            expect(result).toContain('BruhMCP');
        });
    });
});