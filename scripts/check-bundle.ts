// The bundle guard (AGENTS.md rule 6, D8): an app that imports two components bundles only those
// two and the toolkit mechanisms they use. For each framework, it builds the guard app
// (`fixtures/<framework>/guard/`: Dialog and Tabs from the package's **built** entries, minified,
// with a source map chained to the packages' sources by scripts/bundle-guard-vite.ts), then fails
// when the bundle holds:
//   - another component's code: a source under `packages/<framework>/src/components/<name>/`
//     (Angular: `packages/angular/<name>/`) for a component the app does not import, or its part
//     attribute marker (`"<name>-…"`, every element's `data-primitives-part` value);
//   - an unused toolkit mechanism: a source under `packages/primitives/src/<mechanism>/` outside
//     the mechanisms Dialog and Tabs use;
//   - another framework's package.
// It then reads every component entry of the built packages on its own (Epic #22): an entry's
// file, the chunks it imports and the other entries it imports (`@fragiola/primitives-<framework>/
// <name>`), through their source maps. An entry holding another component's code fails, unless
// that component is one it is built on (ENTRY_DEPENDENCIES): Dialog's code inside Tabs, invisible
// to the two-component app, fails here. The utility entries (the direction provider, the render
// utilities: UTILITIES) are read alone the same way and may hold no component's code at all (D8:
// a global provider references no component).
// Source maps against folders, never names (a shared helper named like a component is not a leak):
// the approach of Tree's guard (fragiola/tree, scripts/check-features.ts), same author and
// licence. Run by `pnpm build`, after the packages built; site/tests/check-bundle.test.ts plants
// leaks and sees them fail.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import {
    COMPONENTS,
    type ComponentName,
    FRAMEWORKS,
    type FrameworkName,
    MECHANISMS,
    UTILITIES,
} from "./components.ts";

const root = join(import.meta.dirname, "..");

/** What the guard app imports, and the toolkit mechanisms those components may bring. */
export const GUARD = {
    components: ["dialog", "tabs"],
    // Dialog: the overlay session (and the layers it pushes), focus, inert, scroll lock, presence;
    // Tabs: the collection key maps, the direction; Angular's ids come from the toolkit
    mechanisms: [
        "collection",
        "direction",
        "focus",
        "id",
        "inert",
        "layers",
        "overlay",
        "presence",
        "scroll-lock",
    ],
} as const;

/**
 * The components an entry is built on, in every framework: the form controls on Field (and
 * Fieldset and Form, whose contexts Field reads, Epic #26), a Checkbox on its group's context, the
 * pickers on the calendars. Any other component's code in an entry is a leak; a utility entry
 * (UTILITIES) has none.
 */
export const ENTRY_DEPENDENCIES: Readonly<
    Partial<Record<ComponentName, readonly ComponentName[]>>
> = {
    checkbox: ["checkbox-group", "field"],
    "checkbox-group": ["field"],
    combobox: ["field"],
    "date-picker": ["calendar", "field"],
    "date-range-picker": ["calendar", "date-picker", "field"],
    fieldset: ["field"],
    form: ["field"],
    "range-calendar": ["calendar"],
    select: ["field"],
    slider: ["field"],
};

/**
 * The leaks of one component entry read alone: `sources` are the sources of its file and of
 * everything it imports (relative to the repository), `imports` the other entries of its package
 * it imports (`dialog`, `internal`).
 */
export function entryLeaks(
    framework: FrameworkName,
    component: string,
    sources: readonly string[],
    imports: readonly string[],
    dependencies: Readonly<
        Partial<Record<string, readonly string[]>>
    > = ENTRY_DEPENDENCIES,
): string[] {
    const allowed = new Set([component, ...(dependencies[component] ?? [])]);
    const leaks = new Set<string>();
    for (const source of sources) {
        const owner = ownerOf(source);
        if (owner?.kind !== "component") {
            continue;
        }
        if (owner.framework !== framework) {
            leaks.add(`/${component}: another framework's package: ${source}`);
        } else if (!allowed.has(owner.name)) {
            leaks.add(
                `/${component}: the component "${owner.name}": ${source}`,
            );
        }
    }
    for (const name of imports) {
        if (name !== "internal" && !allowed.has(name)) {
            leaks.add(`/${component}: imports the component entry "/${name}"`);
        }
    }
    return [...leaks].sort();
}

/** A component entry's built file in a framework package's `dist`. */
function entryFile(framework: FrameworkName, name: string): string {
    return framework === "angular"
        ? join(
              root,
              "packages/angular/dist/fesm2022",
              `fragiola-primitives-angular-${name}.mjs`,
          )
        : join(root, "packages", framework, "dist", `${name}.js`);
}

/**
 * One entry of a built framework package, read alone: the sources of its file and of the files it
 * imports (relative chunks, and the package's other entries, followed), and the other entries it
 * imports.
 */
function readEntry(
    framework: FrameworkName,
    component: string,
): { sources: string[]; imports: string[] } {
    const sources = new Set<string>();
    const imports = new Set<string>();
    const seen = new Set<string>();
    const pending = [entryFile(framework, component)];
    const self = new RegExp(`^@fragiola/primitives-${framework}/(.+)$`);
    while (pending.length > 0) {
        const file = pending.pop() as string;
        if (seen.has(file)) {
            continue;
        }
        seen.add(file);
        const code = readFileSync(file, "utf8");
        for (const match of code.matchAll(
            /(?:from|import)\s*["']([^"']+)["']/g,
        )) {
            const specifier = match[1] as string;
            if (specifier.startsWith(".")) {
                pending.push(resolve(dirname(file), specifier));
                continue;
            }
            const entry = self.exec(specifier)?.[1];
            if (entry !== undefined) {
                imports.add(entry);
                if (entry !== "internal") {
                    pending.push(entryFile(framework, entry));
                }
            }
        }
        // an entry that only re-exports a chunk has no map of its own: the chunk's says it all
        // (an entry whose maps name no component source fails in main)
        const map = `${file}.map`;
        if (!existsSync(map)) {
            continue;
        }
        const parsed = JSON.parse(readFileSync(map, "utf8")) as {
            sources: string[];
            sourceRoot?: string;
        };
        for (const source of parsed.sources) {
            sources.add(
                relative(
                    root,
                    resolve(dirname(map), parsed.sourceRoot ?? "", source),
                ),
            );
        }
    }
    return { sources: [...sources], imports: [...imports] };
}

export interface GuardRules {
    framework: FrameworkName;
    /** Every component the packages ship (scripts/components.ts). */
    components: readonly string[];
    /** The components the app imports. */
    imported: readonly string[];
    /** Every toolkit mechanism. */
    mechanisms: readonly string[];
    /** The mechanisms the imported components may bring. */
    allowed: readonly string[];
}

/**
 * What a workspace source belongs to, from its path relative to the repository: a framework
 * package's component, a toolkit mechanism, another package's code, or nothing the guard checks.
 */
export function ownerOf(
    path: string,
):
    | { kind: "component"; framework: string; name: string }
    | { kind: "utility"; framework: string; name: string }
    | { kind: "mechanism"; name: string }
    | { kind: "package"; name: string }
    | null {
    const normalized = path.replaceAll("\\", "/");
    const mechanism = /^packages\/primitives\/src\/([^/]+)\//.exec(normalized);
    if (mechanism?.[1] !== undefined) {
        return { kind: "mechanism", name: mechanism[1] };
    }
    const utility =
        /^packages\/(react|vue)\/src\/([^/]+)\//.exec(normalized) ??
        /^packages\/(angular)\/([^/]+)\//.exec(normalized);
    if (
        utility?.[1] !== undefined &&
        utility[2] !== undefined &&
        (UTILITIES as readonly string[]).includes(utility[2])
    ) {
        return { kind: "utility", framework: utility[1], name: utility[2] };
    }
    const component =
        /^packages\/(react|vue)\/src\/components\/([^/]+)\//.exec(normalized) ??
        /^packages\/(angular)\/(?!src\/|internal\/)([^/]+)\//.exec(normalized);
    if (component?.[1] !== undefined && component[2] !== undefined) {
        return {
            kind: "component",
            framework: component[1],
            name: component[2],
        };
    }
    const pkg = /^packages\/([^/]+)\//.exec(normalized);
    if (pkg?.[1] !== undefined) {
        return { kind: "package", name: pkg[1] };
    }
    return null;
}

/**
 * Every leak of a guard bundle: `sources` are its source map's sources relative to the
 * repository, `code` its minified code.
 */
export function bundleLeaks(
    sources: readonly string[],
    code: string,
    rules: GuardRules,
): string[] {
    const leaks = new Set<string>();
    for (const source of sources) {
        const owner = ownerOf(source);
        if (owner === null) {
            continue;
        }
        if (owner.kind === "mechanism" && !rules.allowed.includes(owner.name)) {
            leaks.add(
                `the unused toolkit mechanism "${owner.name}": ${source}`,
            );
        }
        if (owner.kind === "utility" && owner.framework !== rules.framework) {
            leaks.add(`another framework's package: ${source}`);
        }
        if (owner.kind === "component") {
            if (owner.framework !== rules.framework) {
                leaks.add(`another framework's package: ${source}`);
            } else if (!rules.imported.includes(owner.name)) {
                leaks.add(`the component "${owner.name}": ${source}`);
            }
        }
        if (
            owner.kind === "package" &&
            owner.name !== "primitives" &&
            owner.name !== rules.framework
        ) {
            leaks.add(`another framework's package: ${source}`);
        }
    }
    for (const name of rules.components) {
        if (rules.imported.includes(name)) {
            continue;
        }
        // a component's code always names its parts (`data-primitives-part="menu-item"`)
        if (new RegExp(`["'\`]${name}-[a-z-]+["'\`]`).test(code)) {
            leaks.add(`the component "${name}": its part attribute values`);
        }
    }
    return [...leaks].sort();
}

/**
 * Whether the guard can read a bundle at all: its source map must reach the packages' sources
 * (a component's and a mechanism's), never stop at a package's built file. Without the chain,
 * every leak would go unseen and the guard would pass.
 */
export function chainProblems(sources: readonly string[]): string[] {
    const problems: string[] = [];
    const built = sources.filter((source) =>
        /^packages\/[^/]+\/dist\//.test(source.replaceAll("\\", "/")),
    );
    if (built.length > 0) {
        problems.push(
            `the source map stops at built files (${built.join(", ")}): their source maps are not chained`,
        );
    }
    const kinds = new Set(sources.map((source) => ownerOf(source)?.kind));
    if (!kinds.has("component")) {
        problems.push("the source map names no component source");
    }
    if (!kinds.has("mechanism")) {
        problems.push("the source map names no toolkit mechanism source");
    }
    return problems;
}

/** The guard app's built bundle: its code and its sources, relative to the repository. */
function readBundle(framework: FrameworkName): {
    sources: string[];
    code: string;
} {
    const assets = join(root, "fixtures", framework, "guard/dist/assets");
    const files = readdirSync(assets).filter((name) => name.endsWith(".js"));
    const sources: string[] = [];
    let code = "";
    for (const file of files) {
        code += readFileSync(join(assets, file), "utf8");
        const map = join(assets, `${file}.map`);
        if (!existsSync(map)) {
            throw new Error(`${map}: no source map, the guard cannot read it`);
        }
        const parsed = JSON.parse(readFileSync(map, "utf8")) as {
            sources: string[];
            sourceRoot?: string;
        };
        for (const source of parsed.sources) {
            const absolute = resolve(
                dirname(map),
                parsed.sourceRoot ?? "",
                source,
            );
            sources.push(relative(root, absolute));
        }
    }
    return { sources, code };
}

function main(): void {
    const problems: string[] = [];
    for (const framework of FRAMEWORKS) {
        execFileSync(
            "pnpm",
            [
                "--filter",
                `fixture-${framework}`,
                "exec",
                "vite",
                "build",
                "--config",
                "guard/vite.config.ts",
            ],
            { cwd: root, stdio: ["ignore", "ignore", "inherit"] },
        );
        const { sources, code } = readBundle(framework);
        for (const problem of chainProblems(sources)) {
            problems.push(`${framework}: ${problem}`);
        }
        for (const leak of bundleLeaks(sources, code, {
            framework,
            components: COMPONENTS,
            imported: GUARD.components,
            mechanisms: MECHANISMS,
            allowed: GUARD.mechanisms,
        })) {
            problems.push(`${framework}: ${leak}`);
        }
        for (const component of COMPONENTS) {
            const { sources, imports } = readEntry(framework, component);
            if (
                !sources.some((source) => ownerOf(source)?.kind === "component")
            ) {
                problems.push(
                    `${framework}: /${component}: its source maps name no component source`,
                );
            }
            for (const leak of entryLeaks(
                framework,
                component,
                sources,
                imports,
            )) {
                problems.push(`${framework}: ${leak}`);
            }
        }
        for (const utility of UTILITIES) {
            const { sources, imports } = readEntry(framework, utility);
            for (const leak of entryLeaks(
                framework,
                utility,
                sources,
                imports,
                {},
            )) {
                problems.push(`${framework}: ${leak}`);
            }
        }
    }
    if (problems.length > 0) {
        console.error(
            `The bundle guard failed: an app importing ${GUARD.components.join(" and ")} bundles more (AGENTS.md rule 6):\n${problems.join("\n")}`,
        );
        process.exit(1);
    }
    console.log(
        `check-bundle: an app importing ${GUARD.components.join(" and ")} bundles only them and ${GUARD.mechanisms.join(", ")}, in ${FRAMEWORKS.join(", ")}; each of the ${COMPONENTS.length} component entries holds only its own code and the components it is built on, and the ${UTILITIES.length} utility entries no component's code`,
    );
}

// only when run, not when a test imports it (`import.meta.main` holds through a symlinked path)
if (import.meta.main) {
    main();
}
