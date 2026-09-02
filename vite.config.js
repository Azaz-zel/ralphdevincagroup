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
            // display face is used at 400 everywhere, and the 500 and 600 in the
            // CSS belong to Inter Tight (buttons and small headings), not to
            // Newsreader. Preloading is limited to the three faces needed for
            // the first paint, so the rest do not compete with it.
            fonts: [
                // Display — page titles and section headlines.
                bunny('Newsreader', {
                    weights: [400],
                    fallbacks: ['Georgia', 'serif'],
                }),
                // Body — running text, navigation, buttons.
                bunny('Inter Tight', {
                    weights: [400, 500, 600],
                    preload: [{ weight: 400 }],
                    fallbacks: ['system-ui', 'sans-serif'],
                }),
                // Utility — eyebrows, labels, metadata, and the Composition element.
                bunny('IBM Plex Mono', {
                    weights: [400],
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
