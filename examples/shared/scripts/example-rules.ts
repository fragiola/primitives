// Adapted from Tree (fragiola/tree, examples/react/tests/examples.test.ts), same author and
// licence: the rules every framework's `tests/examples.test.ts` checks its examples against.
//
// An example is code a reader copies (the code panel shows it verbatim, contract §6), so it
// imports only what a consumer has: its framework, the component's entry of its framework's
// primitives package, its own relative files, and the styling through the recipes
// (`examples-shared/recipes/<component>`, the decided styling layer). No `@/` or `#/` aliases, no
// root entry. And it holds no class string in its markup: every class comes from its `styles.ts`.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Framework } from "../src/framework.ts";
import {
    collectFiles,
    type ExamplesApp,
    fileOf,
    importsOf,
    listExampleIds,
    RECIPE_SPECIFIER,
} from "./examples-lib.ts";

/** What an example file may import, besides its relative files and the recipes. */
export const ALLOWED_IMPORTS: Record<Framework, readonly RegExp[]> = {
    react: [/^react$/, /^@fragiola\/primitives-react\/[a-z-]+$/],
    vue: [/^vue$/, /^@fragiola\/primitives-vue\/[a-z-]+$/],
    angular: [
        /^@angular\/(core|common)$/,
        /^@fragiola\/primitives-angular\/[a-z-]+$/,
    ],
};

/** The class strings a source writes in its markup instead of reading `styles.ts`. */
export function inlineClasses(source: string, framework: Framework): string[] {
    const found: string[] = [];
    if (framework === "react") {
        for (const match of source.matchAll(/\bclassName=/g)) {
            const start = match.index + match[0].length;
            const open = source[start];
            if (open === '"' || open === "'") {
                found.push(source.slice(match.index, match.index + 60));
                continue;
            }
            if (open !== "{") continue;
            let depth = 0;
            let end = start;
            for (; end < source.length; end++) {
                if (source[end] === "{") depth++;
                else if (source[end] === "}" && --depth === 0) break;
            }
            const expression = source.slice(start + 1, end);
            if (/["'`]/.test(expression)) {
                found.push(`className={${expression.slice(0, 60)}}`);
            }
        }
        return found;
    }
    // Vue templates and Angular inline templates: a static `class="…"`, or a bound class
    // (`:class`, `[class]`, `[ngClass]`) whose expression holds a string
    for (const match of source.matchAll(/(?<![:\w[-])class="[^"]*"/g)) {
        found.push(match[0]);
    }
    for (const match of source.matchAll(
        /(?::class|\[class\]|\[ngClass\])="([^"]*)"/g,
    )) {
        if (/['`]/.test(match[1] ?? "")) found.push(match[0]);
    }
    return found;
}

/** Every way the app's examples break the rules. */
export function exampleProblems(app: ExamplesApp): string[] {
    const problems: string[] = [];
    const allowed = ALLOWED_IMPORTS[app.framework];
    const ids = listExampleIds(app);
    if (ids.length === 0) problems.push(`${app.framework}: no example`);
    for (const id of ids) {
        if (!existsSync(join(app.examplesDir, id, "styles.ts"))) {
            problems.push(`${id}: no styles.ts`);
        }
        for (const path of collectFiles(app, id)) {
            if (path.startsWith("_recipes/")) continue;
            const source = readFileSync(fileOf(app, path), "utf-8");
            for (const specifier of importsOf(source)) {
                if (specifier.startsWith(".")) continue;
                if (RECIPE_SPECIFIER.test(specifier)) continue;
                if (!allowed.some((pattern) => pattern.test(specifier))) {
                    problems.push(`${path}: imports "${specifier}"`);
                }
            }
            if (path.endsWith("/styles.ts")) continue;
            for (const snippet of inlineClasses(source, app.framework)) {
                problems.push(`${path}: a class string in markup: ${snippet}`);
            }
        }
        const entry = readFileSync(
            join(app.examplesDir, id, app.entry),
            "utf-8",
        );
        if (!importsOf(entry).includes("./styles.ts")) {
            problems.push(`${id}/${app.entry}: does not read ./styles.ts`);
        }
    }
    return problems;
}
