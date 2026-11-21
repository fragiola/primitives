// Adapted from Tree (fragiola/tree, examples/shared/scripts/examples-lib.ts), same author and
// licence.
//
// Shared by scripts/generate.ts, scripts/manifest.ts, the tests and the e2e helpers: finds a
// framework app's examples, reads their metadata (src/meta/<id>.ts, one file per example, shared
// by every framework), and computes the files each one is made of by following its relative
// imports and its recipes (`examples-shared/recipes/<component>`, shown as `_recipes/<file>`).
// What the code panel shows is exactly this list.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { ENTRY_FILES, FRAMEWORKS, type Framework } from "../src/framework.ts";
import { CATEGORIES, type ExampleMeta, LAYOUTS } from "../src/meta-types.ts";

/** examples/shared */
export const SHARED_ROOT = resolve(import.meta.dirname, "..");
/** examples/: one app per framework, and this package */
export const EXAMPLES_ROOT = resolve(SHARED_ROOT, "..");
/** Every example's metadata, `<id>.ts`, whatever the framework. */
export const META_DIR = join(SHARED_ROOT, "src", "meta");
/** The styling layer's recipes, one file per component. */
export const RECIPES_DIR = join(SHARED_ROOT, "src", "recipes");
/** Where the recipes appear among an example's files (the `_` marks shared, non-example code). */
export const RECIPES_PATH = "_recipes";

/** A framework's examples app, `examples/<framework>`, and where its examples live. */
export interface ExamplesApp {
    framework: Framework;
    /** the app's directory */
    root: string;
    src: string;
    /** `src/examples`: one folder per example */
    examplesDir: string;
    /** the file an example's folder is found by (`index.tsx`, `index.vue`, `index.ts`) */
    entry: string;
}

export function examplesApp(
    framework: Framework,
    root: string = join(EXAMPLES_ROOT, framework),
): ExamplesApp {
    const src = join(root, "src");
    return {
        framework,
        root,
        src,
        examplesDir: join(src, "examples"),
        entry: ENTRY_FILES[framework],
    };
}

/** The framework apps this repository has (`examples/<framework>/package.json`). */
export function existingApps(): ExamplesApp[] {
    return FRAMEWORKS.filter((framework) =>
        existsSync(join(EXAMPLES_ROOT, framework, "package.json")),
    ).map((framework) => examplesApp(framework));
}

export interface ExampleEntry {
    id: string;
    meta: ExampleMeta;
    /** the example's source files, entry first: relative to src/examples, recipes as `_recipes/` */
    files: string[];
}

/** Every folder of the app's examples with its entry file, except the `_` ones. */
export function listExampleIds(app: ExamplesApp): string[] {
    if (!existsSync(app.examplesDir)) return [];
    return readdirSync(app.examplesDir)
        .filter((name) => !name.startsWith("_"))
        .filter((name) => statSync(join(app.examplesDir, name)).isDirectory())
        .filter((name) => existsSync(join(app.examplesDir, name, app.entry)))
        .sort();
}

/** Every example that has metadata (src/meta/<id>.ts), in any framework. */
export function listMetaIds(): string[] {
    return readdirSync(META_DIR)
        .filter((name) => name.endsWith(".ts"))
        .map((name) => name.slice(0, -".ts".length))
        .sort();
}

/** Throws with a readable message when a meta file is not an ExampleMeta. */
export function validateMeta(id: string, value: unknown): ExampleMeta {
    const fail = (why: string): never => {
        throw new Error(`examples/shared/src/meta/${id}.ts: ${why}`);
    };
    if (!value || typeof value !== "object") fail("no default export object");
    const meta = value as Record<string, unknown>;
    if (typeof meta.title !== "string" || !meta.title)
        fail("title is required");
    if (typeof meta.description !== "string" || !meta.description) {
        fail("description is required");
    }
    if (!CATEGORIES.includes(meta.category as never)) {
        fail(`category must be one of ${CATEGORIES.join(", ")}`);
    }
    if (typeof meta.order !== "number") fail("order must be a number");
    if (
        !Array.isArray(meta.features) ||
        !meta.features.every((f) => typeof f === "string")
    ) {
        fail("features must be a string array");
    }
    if (meta.docs !== undefined && typeof meta.docs !== "string") {
        fail("docs must be a string");
    }
    if (meta.layout !== undefined && !LAYOUTS.includes(meta.layout as never)) {
        fail(`layout must be one of ${LAYOUTS.join(", ")}`);
    }
    if (
        meta.height !== undefined &&
        (typeof meta.height !== "number" || meta.height <= 0)
    ) {
        fail("height must be a positive number");
    }
    return meta as unknown as ExampleMeta;
}

export async function readMeta(id: string): Promise<ExampleMeta> {
    const file = join(META_DIR, `${id}.ts`);
    if (!existsSync(file)) {
        throw new Error(`${id}: examples/shared/src/meta/${id}.ts is missing`);
    }
    const module = (await import(pathToFileURL(file).href)) as {
        default?: unknown;
    };
    return validateMeta(id, module.default);
}

// Statements start a line (so an import written inside a string is not taken for one); dynamic
// imports can appear anywhere.
const SPECIFIER =
    /^\s*(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/gm;

/** The module specifiers a source file imports (static, re-exports and dynamic). */
export function importsOf(source: string): string[] {
    const specifiers: string[] = [];
    for (const match of source.matchAll(SPECIFIER)) {
        const specifier = match[1] ?? match[2];
        if (specifier) specifiers.push(specifier);
    }
    return specifiers;
}

/** A recipe import (`examples-shared/recipes/dialog`), and its component's name. */
export const RECIPE_SPECIFIER = /^examples-shared\/recipes\/([a-z-]+)$/;

function resolveRelative(from: string, specifier: string): string | undefined {
    const base = resolve(dirname(from), specifier);
    const candidates = [
        base,
        `${base}.tsx`,
        `${base}.ts`,
        `${base}.vue`,
        join(base, "index.tsx"),
        join(base, "index.ts"),
    ];
    return candidates.find(
        (candidate) => existsSync(candidate) && statSync(candidate).isFile(),
    );
}

const inside = (dir: string, file: string) =>
    !relative(dir, file).startsWith("..");

/** Where a file appears in the code panel. */
function shownPath(app: ExamplesApp, file: string): string {
    return inside(RECIPES_DIR, file)
        ? `${RECIPES_PATH}/${relative(RECIPES_DIR, file)}`
        : relative(app.examplesDir, file);
}

/** Where a shown path (`dialog/index.tsx`, `_recipes/dialog.ts`) is on disk. */
export function fileOf(app: ExamplesApp, path: string): string {
    return path.startsWith(`${RECIPES_PATH}/`)
        ? join(RECIPES_DIR, path.slice(RECIPES_PATH.length + 1))
        : join(app.examplesDir, path);
}

/**
 * The example's files: its entry file, everything reachable through relative imports inside the
 * app's src/examples, and the recipes it imports with theirs. The entry first, then its own files,
 * then the recipes, each group sorted.
 */
export function collectFiles(app: ExamplesApp, id: string): string[] {
    const entry = join(app.examplesDir, id, app.entry);
    const seen = new Set<string>();
    const queue = [entry];
    while (queue.length > 0) {
        const file = queue.shift();
        if (file === undefined || seen.has(file)) continue;
        seen.add(file);
        for (const specifier of importsOf(readFileSync(file, "utf-8"))) {
            const recipe = RECIPE_SPECIFIER.exec(specifier)?.[1];
            if (recipe !== undefined) {
                const target = join(RECIPES_DIR, `${recipe}.ts`);
                if (!existsSync(target)) {
                    throw new Error(
                        `${relative(app.root, file)}: no recipe "${specifier}"`,
                    );
                }
                queue.push(target);
                continue;
            }
            if (!specifier.startsWith(".")) continue;
            const target = resolveRelative(file, specifier);
            if (!target) {
                throw new Error(
                    `${relative(app.root, file)}: cannot resolve "${specifier}"`,
                );
            }
            if (
                !inside(app.examplesDir, target) &&
                !inside(RECIPES_DIR, target)
            ) {
                throw new Error(
                    `${relative(app.root, file)}: "${specifier}" leaves src/examples`,
                );
            }
            queue.push(target);
        }
    }
    const [first, ...rest] = [...seen].map((file) => shownPath(app, file));
    const recipe = (path: string) => path.startsWith(`${RECIPES_PATH}/`);
    const sorted = [
        ...rest.filter((path) => !recipe(path)).sort(),
        ...rest.filter(recipe).sort(),
    ];
    return first === undefined ? [] : [first, ...sorted];
}

/** The app's examples with their metadata, in gallery order (category, order, id). */
export async function loadExamples(app: ExamplesApp): Promise<ExampleEntry[]> {
    const entries: ExampleEntry[] = [];
    for (const id of listExampleIds(app)) {
        entries.push({
            id,
            meta: await readMeta(id),
            files: collectFiles(app, id),
        });
    }
    return entries.sort(
        (a, b) =>
            CATEGORIES.indexOf(a.meta.category) -
                CATEGORIES.indexOf(b.meta.category) ||
            a.meta.order - b.meta.order ||
            a.id.localeCompare(b.id),
    );
}
