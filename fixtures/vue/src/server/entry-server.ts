import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import App from "../app/app.vue";
import { pageHtml } from "../kit/page-html.ts";

/**
 * The server render of a fixture page (conformance's ssr layer, `conformance/src/ssr-server.ts`):
 * the client's `index.html` with the page rendered in `#root`, marked for hydration.
 */
export async function render(url: string, template: string): Promise<string> {
    const { pathname, search } = new URL(url, "http://localhost");
    const markup = await renderToString(
        createSSRApp(App, { path: pathname, search }),
    );
    return pageHtml(
        template,
        search,
        `<div id="root" data-ssr>${markup}</div>`,
    );
}
