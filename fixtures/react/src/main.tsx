import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./app/app.tsx";
import { readQuery } from "./kit/query.ts";
import "./app/app.css";

const root = document.getElementById("root");
if (root === null) {
    throw new Error("missing #root");
}
const { pathname, search } = window.location;
const query = readQuery(search);
// a document with no `?dir=` has no `dir` (the direction provider's scenario reads none)
if (query.dir === "rtl") {
    document.documentElement.dir = "rtl";
} else {
    document.documentElement.removeAttribute("dir");
}
if (query.lang === undefined) {
    document.documentElement.removeAttribute("lang");
} else {
    document.documentElement.lang = query.lang;
}
const app = (
    <StrictMode>
        <App path={pathname} search={search} />
    </StrictMode>
);
// the server-rendered page (conformance's ssr layer) is hydrated, every other page rendered
if (root.hasAttribute("data-ssr")) {
    hydrateRoot(root, app, {
        onRecoverableError: (error) =>
            console.error("hydration: recoverable error", error),
    });
} else {
    createRoot(root).render(app);
}
