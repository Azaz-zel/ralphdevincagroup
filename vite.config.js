import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
            // Self-hosted through bunny.net so no request ever leaves for a font CDN.
            //
            // Only weights the stylesheet actually asks for are downloaded: the
            // display face is used at 300 for page titles and 400 for smaller
            // headings, with italic 300 for the one emphasised word in a title.
            // The 500 and 600 in the CSS belong to Inter Tight (buttons and
            // small headings), not to Newsreader.
            //
            // latin-ext is not optional here: the four principles print
            // "rād", and U+0101 sits outside the latin subset. Without it
            // that one letter drops to a fallback face mid-word.
            fonts: [
                // Display — page titles and section headlines.
                bunny('Newsreader', {
                    weights: [300, 400],
                    styles: ['normal', 'italic'],
                    preload: [{ weight: 300 }],
                    subsets: ['latin', 'latin-ext'],
                    fallbacks: ['Georgia', 'serif'],
                }),
                // Body — running text, navigation, buttons.
                bunny('Inter Tight', {
                    weights: [400, 500, 600],
                    subsets: ['latin', 'latin-ext'],
                    preload: [{ weight: 400 }],
                    fallbacks: ['system-ui', 'sans-serif'],
                }),
                // Utility — eyebrows, labels, metadata, and the Composition element.
                bunny('IBM Plex Mono', {
                    weights: [400],
                    subsets: ['latin', 'latin-ext'],
                    fallbacks: ['ui-monospace', 'monospace'],
                }),
            ],
        }),
        tailwindcss(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
