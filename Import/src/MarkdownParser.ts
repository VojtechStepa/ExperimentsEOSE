import markdownit from 'markdown-it'

class MarkdownParser {
    private md: markdownit;

    constructor(md: markdownit) {
        this.md = md;
    }

    parse(markdown: string): string {
        return this.md.render(markdown);
    }

    /* Extends the rule for ![text](path).
     * By default, it only supports images (same as markdown-it).
     * However user via that function can add support to another media types.
     * mediaExtension is the filetype (e.g. .csv or .mp3)
     * callback is a function that will be called when parse hit the filetype.
    */
    AddMediaType(mediaExtension: string, callback: any): void {
        /* TODO */
    }
}

export default MarkdownParser;
