// Adapted from Tree (fragiola/tree, examples/shared/scripts/manifest.ts), same author and licence.
//
// A framework embed's manifest.json (site export contract v1.7, §5.3): what the site's gallery
// lists and its code panel shows. Every file is stored once under `files`; an example lists the
// paths it is made of, entry first (examples-lib.ts follows its imports, so the code panel shows
// exactly what the example is compiled from, its recipes included). A file used by more than one
// example is `shared`.

import { readFileSync } from "node:fs";
import { extname } from "node:path";
import {
    PRIMITIVES_PACKAGES,
    ROUTER_PACKAGES,
    TOOLKIT_PACKAGE,
} from "../src/framework.ts";
import { DEFAULT_HEIGHT } from "../src/meta-types.ts";
import {
    type ExamplesApp,
    fileOf,
    importsOf,
    loadExamples,
} from "./examples-lib.ts";

export interface ManifestFile {
    lang: string;
    content: string;
    shared?: true;
}

export interface ManifestExample {
    id: string;
    title: string;
    description: string;
    /** the example's category id (the contract calls a category a level) */
    level: string;
    order: number;
    features: string[];
    docs?: string;
    layout: "fill" | "flow";
    height: number;
    files: string[];
    registry: string[];
    packages: string[];
}

export interface Manifest {
    files: Record<string, ManifestFile>;
    examples: ManifestExample[];
}

/** Whether an example's files import a toolkit entry themselves (`@fragiola/primitives/time-zone`). */
function importsToolkit(app: ExamplesApp, files: readonly string[]): boolean {
    return files.some((file) =>
        importsOf(readFileSync(fileOf(app, file), "utf-8")).some((specifier) =>
            specifier.startsWith(`${TOOLKIT_PACKAGE}/`),
        ),
    );
}

/** Whether an example's files import its framework's router (a Link rendered through it). */
function importsRouter(app: ExamplesApp, files: readonly string[]): boolean {
    return files.some((file) =>
        importsOf(readFileSync(fileOf(app, file), "utf-8")).includes(
            ROUTER_PACKAGES[app.framework],
        ),
    );
}

/**
 * The manifest of one framework's app. Every example installs its framework's primitives package
 * (which brings the toolkit), the toolkit itself when it imports one of its entries (a calendar
 * system, a time zone), and its framework's router when it renders links through it; there is no
 * registry.
 */
export async function buildManifest(app: ExamplesApp): Promise<Manifest> {
    const entries = await loadExamples(app);
    const uses = new Map<string, number>();
    for (const entry of entries) {
        for (const file of entry.files) {
            uses.set(file, (uses.get(file) ?? 0) + 1);
        }
    }
    const files: Record<string, ManifestFile> = {};
    for (const [path, count] of [...uses].sort(([a], [b]) =>
        a.localeCompare(b),
    )) {
        files[path] = {
            lang: extname(path).slice(1),
            content: readFileSync(fileOf(app, path), "utf-8"),
            ...(count > 1 ? { shared: true as const } : {}),
        };
    }
    const examples = entries.map(
        ({ id, meta, files }): ManifestExample => ({
            id,
            title: meta.title,
            description: meta.description,
            level: meta.category,
            order: meta.order,
            features: meta.features,
            ...(meta.docs ? { docs: meta.docs } : {}),
            layout: meta.layout ?? "fill",
            height: meta.height ?? DEFAULT_HEIGHT[meta.category],
            files,
            registry: [],
            packages: [
                PRIMITIVES_PACKAGES[app.framework],
                ...(importsToolkit(app, files) ? [TOOLKIT_PACKAGE] : []),
                ...(importsRouter(app, files)
                    ? [ROUTER_PACKAGES[app.framework]]
                    : []),
            ],
        }),
    );
    return { files, examples };
}
