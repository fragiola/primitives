import {
    type BootstrapContext,
    bootstrapApplication,
    provideClientHydration,
} from "@angular/platform-browser";
import {
    provideServerRendering,
    renderApplication,
} from "@angular/platform-server";
import { App } from "../app/app.ts";

/**
 * The server render of a fixture page (conformance's ssr layer, `conformance/src/ssr-server.ts`):
 * the client's `index.html` with the page rendered in `#root`, marked for hydration
 * (`@angular/platform-server`, with the hydration annotations of `provideClientHydration`).
 */
export function render(url: string, template: string): Promise<string> {
    return renderApplication(
        (context: BootstrapContext) =>
            bootstrapApplication(
                App,
                {
                    providers: [
                        provideServerRendering(),
                        provideClientHydration(),
                    ],
                },
                context,
            ),
        {
            document: template.replace(
                '<div id="root" fixture-app>',
                '<div id="root" data-ssr fixture-app>',
            ),
            url: new URL(url, "http://localhost").href,
            allowedHosts: ["localhost"],
        },
    );
}
