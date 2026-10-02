const escapeHtml = (value) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const inline = (value) =>
    value
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');

/**
 * Render the small subset of Markdown the assistant uses (bold, italics,
 * lists, paragraphs) to HTML. Input is escaped first, so it is safe to
 * pass to dangerouslySetInnerHTML.
 */
export function formatMessage(text = '') {
    const lines = escapeHtml(text.trim()).split('\n');
    const html = [];
    let list = null;
    let paragraph = [];

    const flushParagraph = () => {
        if (paragraph.length) {
            html.push(`<p>${paragraph.map(inline).join('<br/>')}</p>`);
            paragraph = [];
        }
    };

    const flushList = () => {
        if (list) {
            // Keep the original numbering when a numbered list is interrupted by paragraphs.
            const start = list.type === 'ol' && list.start > 1 ? ` start="${list.start}"` : '';
            html.push(`<${list.type}${start}>${list.items.map((item) => `<li>${inline(item)}</li>`).join('')}</${list.type}>`);
            list = null;
        }
    };

    for (const line of lines) {
        const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
        const numbered = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
        const type = bullet ? 'ul' : numbered ? 'ol' : null;

        if (type) {
            flushParagraph();
            if (list?.type !== type) {
                flushList();
                list = { type, items: [], start: numbered ? Number(numbered[1]) : 1 };
            }
            list.items.push(bullet ? bullet[1] : numbered[2]);
        } else if (line.trim() === '') {
            flushParagraph();
            flushList();
        } else {
            flushList();
            paragraph.push(line);
        }
    }

    flushParagraph();
    flushList();

    return html.join('');
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const formatPrice = (value) => currency.format(Number(value));

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function timeAgo(date) {
    if (!date) return '';

    const seconds = Math.round((new Date(date).getTime() - Date.now()) / 1000);
    const units = [
        ['year', 31536000],
        ['month', 2592000],
        ['week', 604800],
        ['day', 86400],
        ['hour', 3600],
        ['minute', 60],
    ];

    for (const [unit, size] of units) {
        if (Math.abs(seconds) >= size) {
            return relative.format(Math.round(seconds / size), unit);
        }
    }

    return 'just now';
}
