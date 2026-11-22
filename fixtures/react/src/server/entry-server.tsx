import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { App } from "../app/app.tsx";
import { pageHtml } from "../kit/page-html.ts";

/**
 * The server render of a fixture page (conformance's ssr layer, `conformance/src/ssr-server.ts`):
 * the client's `index.html` with the page rendered in `#root`, marked for hydration.
 */
export function render(url: string, template: string): string {
    const { pathname, search } = new URL(url, "http://localhost");
    const markup = renderToString(
        <StrictMode>
            <App path={pathname} search={search} />
        </StrictMode>,
    );
    return pageHtml(
        template,
        search,
        `<div id="root" data-ssr>${markup}</div>`,
    );
}
