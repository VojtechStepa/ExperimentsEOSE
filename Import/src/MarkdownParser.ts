import markdownit from 'markdown-it'

export type MediaCallback = (alt: string, src: string) => string;

class MarkdownParser {
    private md: markdownit;
    private mediaTypes = new Map<string, MediaCallback>();

    constructor(md: markdownit) {
        this.md = md;
        this.setupImageRule();
    }

    private resolveSrc(src: string): string {
        if (/^(\/|https?:\/\/|data:)/.test(src)) {
            return src;
        }
        return `/src/assets/${src}`;
    }

    private setupImageRule(): void {
        const defaultRule = this.md.renderer.rules.image;

        this.md.renderer.rules.image = (tokens, idx, options, env, self) => {
            const token = tokens[idx];
            const src = this.resolveSrc(token.attrGet('src') ?? '');
            const dotIdx = src.lastIndexOf('.');
            const ext = dotIdx !== -1 ? src.slice(dotIdx).toLowerCase() : '';

            const callback = this.mediaTypes.get(ext);
            if (callback) {
                const alt = token.children?.map(t => t.content).join('') ?? '';
                return callback(alt, src);
            }

            token.attrSet('src', src);
            return defaultRule
                ? defaultRule(tokens, idx, options, env, self)
                : self.renderToken(tokens, idx, options);
        };
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
    AddMediaType(mediaExtension: string, callback: MediaCallback): void {
        this.mediaTypes.set(mediaExtension.toLowerCase(), callback);
    }
}

export default MarkdownParser;
