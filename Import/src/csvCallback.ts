import type { MediaCallback } from './MarkdownParser'

function parseCSV(content: string): string[][] {
    return content.trim().split('\n').map(line => line.split(','));
}

function renderTable(rows: string[][]): string {
    if (rows.length === 0) return '<table></table>';

    const [header, ...body] = rows;
    const cellStyle = 'style="border: 1px solid black; padding: 4px"';
    const ths = header.map(cell => `<th ${cellStyle}>${cell.trim()}</th>`).join('');
    const trs = body.map(row =>
        `<tr>${row.map(cell => `<td ${cellStyle}>${cell.trim()}</td>`).join('')}</tr>`
    ).join('');

    return `<table style="border-collapse: collapse"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
}

export const csvCallback: MediaCallback = (_alt, src) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', src, false); // synchronous — fine for local dev
    xhr.send();

    if (xhr.status !== 200) {
        return `<p>Failed to load CSV: ${src}</p>`;
    }

    return renderTable(parseCSV(xhr.responseText));
};
