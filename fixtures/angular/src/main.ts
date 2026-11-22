import {
    bootstrapApplication,
    provideClientHydration,
} from "@angular/platform-browser";
import { App } from "./app/app.ts";
import "./app/app.css";

// zoneless (Angular 22's default): no zone.js anywhere. The server-rendered page (conformance's
// ssr layer) is hydrated, every other page rendered.
const ssr = document.getElementById("root")?.hasAttribute("data-ssr") ?? false;
bootstrapApplication(App, {
    providers: ssr ? [provideClientHydration()] : [],
})
    .then((app) => app.whenStable())
    // the page is rendered (or hydrated) and stable: conformance's ssr layer waits for it
    .then(() => document.documentElement.setAttribute("data-fixture-ready", ""))
    .catch((error: unknown) => console.error(error));
