import { createApp, createSSRApp } from "vue";
import App from "./app/app.vue";
import { readQuery } from "./kit/query.ts";
import "./app/app.css";

const root = document.getElementById("root");
if (root === null) {
    throw new Error("missing #root");
}
const { pathname, search } = window.location;
const query = readQuery(search);
document.documentElement.dir = query.dir;
if (query.lang === undefined) {
    document.documentElement.removeAttribute("lang");
} else {
    document.documentElement.lang = query.lang;
}
const props = { path: pathname, search };
// the server-rendered page (conformance's ssr layer) is hydrated, every other page rendered
if (root.hasAttribute("data-ssr")) {
    createSSRApp(App, props).mount(root);
} else {
    createApp(App, props).mount(root);
}
// the page is rendered (or hydrated): conformance's ssr layer waits for it
document.documentElement.setAttribute("data-fixture-ready", "");
