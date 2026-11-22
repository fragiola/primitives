import { readQuery } from "./query.ts";

/**
 * A server-rendered page: the client's `index.html` with `root` (the rendered `#root`) in place of
 * its empty one, and the `lang` and `dir` the client sets (`?locale=`, `?dir=rtl`; no `dir` without it).
 */
export function pageHtml(
    template: string,
    search: string,
    root: string,
): string {
    const query = readQuery(search);
    const lang = query.lang === undefined ? "" : ` lang="${query.lang}"`;
    const dir = query.dir === "rtl" ? ' dir="rtl"' : "";
    return template
        .replace(/<html[^>]*>/, `<html${lang}${dir}>`)
        .replace(/<div id="root"><\/div>/, root);
}
