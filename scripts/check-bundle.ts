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
// Source maps against folders, never names (a shared helper named like a component is not a leak):
// the approach of Tree's guard (fragiola/tree, scripts/check-features.ts), same author and
// licence. Run by `pnpm build`, after the packages built; site/tests/check-bundle.test.ts plants
// leaks and sees them fail.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import {
    COMPONENTS,
    FRAMEWORKS,
    type FrameworkName,
    MECHANISMS,
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
    | { kind: "mechanism"; name: string }
    | { kind: "package"; name: string }
    | null {
    const normalized = path.replaceAll("\\", "/");
    const mechanism = /^packages\/primitives\/src\/([^/]+)\//.exec(normalized);
    if (mechanism?.[1] !== undefined) {
        return { kind: "mechanism", name: mechanism[1] };
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
    }
    if (problems.length > 0) {
        console.error(
            `The bundle guard failed: an app importing ${GUARD.components.join(" and ")} bundles more (AGENTS.md rule 6):\n${problems.join("\n")}`,
        );
        process.exit(1);
    }
    console.log(
        `check-bundle: an app importing ${GUARD.components.join(" and ")} bundles only them and ${GUARD.mechanisms.join(", ")}, in ${FRAMEWORKS.join(", ")}`,
    );
}

// only when run, not when a test imports it (`import.meta.main` holds through a symlinked path)
if (import.meta.main) {
    main();
}
