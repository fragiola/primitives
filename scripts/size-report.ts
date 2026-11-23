// Adapted from Tree (fragiola/tree, scripts/size-report.ts), same author and licence.
// The per-entry size report, `docs/size.md` (`pnpm size`, after the packages built). Every entry of
// every package (each subpath of its `exports` but `./package.json`: the toolkit's mechanisms, each
// framework package's components, its root and Angular's `/internal`) is measured as an app gets
// it: a one-line module `export * from "<entry>"`, bundled alone by rolldown (the version the
// toolkit builds with), the package's peers external, from the packages' **built** files, every
// chunk minified, then gzipped (level 9). A framework entry is measured twice: with the toolkit
// bundled (what it costs an app) and with the toolkit external (its own code).
//
// `pnpm size --check` writes nothing and fails when `docs/size.md` is not what it would write: CI
// runs it after `pnpm build`, so a change that moves a size without regenerating the report fails.
// The minified sizes must match exactly; a gzip size may move within GZIP_TOLERANCE, since Node's
// zlib is not pinned (Epic #22: Node 24 and Node 26 gzip the same bytes a few bytes apart).
// Sizes are exact byte counts, the output is sorted as the manifests list the entries: the same
// build gives the same report.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { SIZE_BUDGETS, type SizeBudget } from "./size-budgets.ts";

const root = join(import.meta.dirname, "..");

/** Where the report is written. */
export const REPORT = "docs/size.md";

/** The toolkit: bundled into a framework entry, or external to it. */
const TOOLKIT = "@fragiola/primitives";

/** The packages, in the report's order (toolkit first, then the framework packages). */
export const PACKAGE_ORDER = ["primitives", "react", "vue", "angular"];

/** `--check` (compare, write nothing) or nothing; any other argument throws. */
export function sizeOptions(args: readonly string[]): { check: boolean } {
    let check = false;
    for (const arg of args) {
        if (arg === "--check") check = true;
        else throw new Error(`unknown argument: ${arg}`);
    }
    return { check };
}

/**
 * The file an `exports` subpath points to for a bundler (`import`, else `default`), or
 * `undefined` when the subpath is not exported.
 */
export function exportTarget(
    exports: unknown,
    subpath: string,
): string | undefined {
    if (exports === null || typeof exports !== "object") return undefined;
    const entry = (exports as Record<string, unknown>)[subpath];
    if (typeof entry === "string") return entry;
    if (entry === null || typeof entry !== "object") return undefined;
    const { import: esm, default: fallback } = entry as Record<string, unknown>;
    const target = esm ?? fallback;
    return typeof target === "string" ? target : undefined;
}

/** The entry subpaths of `exports`, in its order, without `./package.json`. */
export function entrySubpaths(exports: unknown): string[] {
    if (exports === null || typeof exports !== "object") return [];
    return Object.keys(exports).filter(
        (subpath) => subpath.startsWith(".") && subpath !== "./package.json",
    );
}

/** The import specifier of a package's subpath: `@x/y` for `.`, `@x/y/dialog` for `./dialog`. */
export function specifierOf(name: string, subpath: string): string {
    return subpath === "." ? name : `${name}/${subpath.slice(2)}`;
}

/** Whether `id` is `name` or one of its subpaths (`react/jsx-runtime` is `react`'s). */
export function isPackageOrSubpath(id: string, name: string): boolean {
    return id === name || id.startsWith(`${name}/`);
}

/** One measured entry. `withoutToolkit` only for a framework package's entry. */
export interface EntrySize {
    specifier: string;
    minified: number;
    gzip: number;
    withoutToolkit?: { minified: number; gzip: number };
}

/** One package's section of the report. */
export interface PackageSizes {
    name: string;
    /** its peers, external to every measure */
    peers: readonly string[];
    entries: readonly EntrySize[];
}

/** `12345` as `12,345 B`, the same on every machine (no locale). */
export function formatBytes(bytes: number): string {
    return `${String(bytes).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} B`;
}

/** The bundled gzip size of every measured entry, by specifier. */
function gzipSizes(packages: readonly PackageSizes[]): Map<string, number> {
    return new Map(
        packages.flatMap((pkg) =>
            pkg.entries.map((entry) => [entry.specifier, entry.gzip] as const),
        ),
    );
}

/**
 * What the budget guard says (Epic #88): a budgeted entry over its budget (its "min + gzip", the
 * toolkit bundled) by more than zlib's slack (`GZIP_TOLERANCE.bytes`: Node versions gzip the same
 * bytes a few bytes apart), or a budgeted entry no package exports any more. Empty: every budget
 * holds. `pnpm size` and `pnpm size --check` both fail on it.
 */
export function budgetProblems(
    packages: readonly PackageSizes[],
    budgets: Readonly<Record<string, SizeBudget>> = SIZE_BUDGETS,
): string[] {
    const sizes = gzipSizes(packages);
    const problems: string[] = [];
    for (const [specifier, { budget }] of Object.entries(budgets)) {
        const gzip = sizes.get(specifier);
        if (gzip === undefined) {
            problems.push(
                `${specifier}: has a budget (scripts/size-budgets.ts) but is not measured`,
            );
        } else if (gzip > budget + GZIP_TOLERANCE.bytes) {
            problems.push(
                `${specifier}: ${formatBytes(gzip)} min + gzip is over its budget of ${formatBytes(budget)} (scripts/size-budgets.ts)`,
            );
        }
    }
    return problems;
}

/** The report's budget section: every budgeted entry, its size before, its budget, its size now. */
function formatBudgets(
    packages: readonly PackageSizes[],
    budgets: Readonly<Record<string, SizeBudget>>,
): string[] {
    const entries = Object.entries(budgets);
    if (entries.length === 0) {
        return [];
    }
    const sizes = gzipSizes(packages);
    const lines = [
        "",
        "## Date budgets",
        "",
        'The date rows\' budgets (Epic #88, `scripts/size-budgets.ts`), in the "min + gzip" column',
        "(the toolkit bundled) of an app that passes no `calendar` and no `timeZone`: the size at",
        "8072819 (before the calendar systems and time zones) plus 100 B, or, where that cannot be",
        'met, the best measured size and its reason (`docs/decisions.md`, "Date family size").',
        `\`pnpm size\` and \`pnpm size --check\` fail when an entry is over its budget by more than ${GZIP_TOLERANCE.bytes} B`,
        "(zlib's slack between Node versions).",
        "",
        "| entry | at 8072819, min + gzip | budget, min + gzip | now, min + gzip | over the +100 B target because |",
        "| --- | ---: | ---: | ---: | --- |",
    ];
    for (const [specifier, budget] of entries) {
        const now = sizes.get(specifier);
        lines.push(
            `| \`${specifier}\` | ${formatBytes(budget.before)} | ${formatBytes(budget.budget)} | ${now === undefined ? "" : formatBytes(now)} | ${budget.reason ?? ""} |`,
        );
    }
    return lines;
}

/** The report, `docs/size.md`: a header saying how it is made, one table per package, the budgets. */
export function formatReport(
    packages: readonly PackageSizes[],
    bundler: string,
    budgets: Readonly<Record<string, SizeBudget>> = {},
): string {
    const lines = [
        "<!-- Generated by `pnpm size` (scripts/size-report.ts): do not edit it by hand. -->",
        "",
        "# Bundle size",
        "",
        "The size of every entry of every package, as an app gets it. Each entry is a one-line",
        'module, `export * from "<entry>"` (everything the entry exports), bundled alone by',
        `${bundler} from the packages' built files (\`pnpm build\`), with the package's peers`,
        "external, minified, then gzipped (level 9). A framework entry is measured twice: with the",
        "toolkit (`@fragiola/primitives`) bundled, what it costs an app that has nothing else, and",
        "with the toolkit external, its own code. An app that imports fewer names gets less (every",
        "package is ESM with `sideEffects: false`). The Angular entries are measured as published",
        "(ng-packagr's partial compilation, before an app's Angular linker).",
        "",
        "Regenerate it with `pnpm build && pnpm size`; CI runs `pnpm size --check`, which fails when",
        "this file is not what `pnpm size` writes. The minified sizes must match exactly; the gzip",
        `sizes may differ by ${GZIP_TOLERANCE.bytes} B or ${GZIP_TOLERANCE.ratio * 100}%, whichever is larger, since they`,
        "come from Node's own zlib, which differs between Node versions (a change of code always",
        "moves a minified size).",
    ];
    for (const pkg of packages) {
        const framework = pkg.entries.some(
            (entry) => entry.withoutToolkit !== undefined,
        );
        lines.push(
            "",
            `## ${pkg.name}`,
            "",
            pkg.peers.length === 0
                ? "No peers: everything is bundled."
                : `External: ${pkg.peers.map((peer) => `\`${peer}\``).join(", ")}.`,
            "",
        );
        if (framework) {
            lines.push(
                "| entry | min | min + gzip | min, toolkit external | min + gzip, toolkit external |",
                "| --- | ---: | ---: | ---: | ---: |",
            );
        } else {
            lines.push("| entry | min | min + gzip |", "| --- | ---: | ---: |");
        }
        for (const entry of pkg.entries) {
            const cells = [
                `\`${entry.specifier}\``,
                formatBytes(entry.minified),
                formatBytes(entry.gzip),
            ];
            if (framework) {
                cells.push(
                    entry.withoutToolkit
                        ? formatBytes(entry.withoutToolkit.minified)
                        : "",
                    entry.withoutToolkit
                        ? formatBytes(entry.withoutToolkit.gzip)
                        : "",
                );
            }
            lines.push(`| ${cells.join(" | ")} |`);
        }
    }
    lines.push(...formatBudgets(packages, budgets));
    return `${lines.join("\n")}\n`;
}

/**
 * How far a gzip size may move with no change of code: Node's zlib is not pinned (Node 24's and
 * 26's give a few bytes apart for the same input), while the minified sizes, rolldown's, are
 * exact. A change of code moves a minified size, so `--check` still catches it.
 */
export const GZIP_TOLERANCE = { bytes: 16, ratio: 0.02 } as const;

/** `12,345 B` as a number, or `undefined`. */
function parseBytes(cell: string): number | undefined {
    const match = /^([\d,]+) B$/.exec(cell.trim());
    return match?.[1] === undefined
        ? undefined
        : Number(match[1].replaceAll(",", ""));
}

/**
 * Whether two reports say the same: the same lines, except gzip cells (the columns whose header
 * names gzip) that may differ within {@link GZIP_TOLERANCE}.
 */
export function sameReport(current: string, expected: string): boolean {
    if (current === expected) return true;
    const left = current.split("\n");
    const right = expected.split("\n");
    if (left.length !== right.length) return false;
    let gzipColumns: number[] = [];
    for (let index = 0; index < right.length; index += 1) {
        const a = left[index] as string;
        const b = right[index] as string;
        if (b.startsWith("| entry |")) {
            gzipColumns = b
                .split("|")
                .map((cell, column) => (cell.includes("gzip") ? column : -1))
                .filter((column) => column >= 0);
        }
        if (a === b) continue;
        if (!b.startsWith("| ") || gzipColumns.length === 0) return false;
        const cellsA = a.split("|");
        const cellsB = b.split("|");
        if (cellsA.length !== cellsB.length) return false;
        for (let column = 0; column < cellsB.length; column += 1) {
            const cellA = cellsA[column] as string;
            const cellB = cellsB[column] as string;
            if (cellA === cellB) continue;
            const sizeA = parseBytes(cellA);
            const sizeB = parseBytes(cellB);
            if (
                !gzipColumns.includes(column) ||
                sizeA === undefined ||
                sizeB === undefined ||
                Math.abs(sizeA - sizeB) >
                    Math.max(GZIP_TOLERANCE.bytes, sizeB * GZIP_TOLERANCE.ratio)
            ) {
                return false;
            }
        }
    }
    return true;
}

/** What `--check` says of the report on disk: nothing when it is up to date. */
export function staleProblem(
    current: string | undefined,
    expected: string,
): string | undefined {
    if (current !== undefined && sameReport(current, expected))
        return undefined;
    return current === undefined
        ? `${REPORT} does not exist: run \`pnpm build && pnpm size\` and commit it`
        : `${REPORT} is stale: run \`pnpm build && pnpm size\` and commit it`;
}

interface Manifest {
    name: string;
    exports?: unknown;
    peerDependencies?: Record<string, string>;
}

interface Package {
    dir: string;
    manifest: Manifest;
}

/** `packages/<dir>`, in the report's order; a package the order does not list throws. */
function readPackages(): Package[] {
    const dirs = readdirSync(join(root, "packages"));
    const unlisted = dirs.filter((dir) => !PACKAGE_ORDER.includes(dir));
    if (unlisted.length > 0) {
        throw new Error(
            `packages/${unlisted.join(", packages/")}: not in PACKAGE_ORDER (scripts/size-report.ts)`,
        );
    }
    return PACKAGE_ORDER.filter((dir) => dirs.includes(dir)).map((dir) => ({
        dir,
        manifest: JSON.parse(
            readFileSync(join(root, "packages", dir, "package.json"), "utf8"),
        ) as Manifest,
    }));
}

// The few rolldown types the report uses (rolldown is the toolkit's dev dependency, not the site's).
interface RolldownChunk {
    type: "chunk" | "asset";
    code?: string;
}
interface RolldownLog {
    code?: string;
    message: string;
}
interface Rolldown {
    rolldown(options: {
        input: string;
        cwd: string;
        logLevel: "warn";
        external: (id: string) => boolean;
        onLog: (level: string, log: RolldownLog) => void;
        plugins: {
            name: string;
            resolveId: (id: string) => string | null;
            load: (id: string) => string | null;
        }[];
    }): Promise<{
        generate(options: {
            format: "esm";
            minify: boolean;
        }): Promise<{ output: RolldownChunk[] }>;
        close(): Promise<void>;
    }>;
}

/** rolldown, as the toolkit's build has it, and its version. */
async function loadRolldown(): Promise<{ rolldown: Rolldown; label: string }> {
    const require = createRequire(
        join(root, "packages", "primitives", "package.json"),
    );
    const manifest = require("rolldown/package.json") as { version: string };
    const rolldown = (await import(require.resolve("rolldown"))) as Rolldown;
    return { rolldown, label: `rolldown ${manifest.version}` };
}

const ENTRY = "\0size-entry";

/** The minified and gzipped size of `export * from "<specifier>"`, bundled alone. */
async function measure(
    { rolldown }: { rolldown: Rolldown },
    specifier: string,
    resolveWorkspace: (id: string) => string | undefined,
    external: readonly string[],
): Promise<{ minified: number; gzip: number }> {
    const bundle = await rolldown.rolldown({
        input: ENTRY,
        cwd: root,
        logLevel: "warn",
        external: (id) => external.some((name) => isPackageOrSubpath(id, name)),
        onLog: (level, log) => {
            // an import nothing resolves would be left out of the size silently
            if (level === "warn" || log.code === "UNRESOLVED_IMPORT") {
                throw new Error(`${specifier}: ${log.message}`);
            }
        },
        plugins: [
            {
                name: "size-entry",
                resolveId: (id) =>
                    id === ENTRY
                        ? ENTRY
                        : external.some((name) => isPackageOrSubpath(id, name))
                          ? null
                          : (resolveWorkspace(id) ?? null),
                load: (id) =>
                    id === ENTRY
                        ? `export * from ${JSON.stringify(specifier)};\n`
                        : null,
            },
        ],
    });
    try {
        const { output } = await bundle.generate({
            format: "esm",
            minify: true,
        });
        const code = output
            .filter((file) => file.type === "chunk")
            .map((file) => file.code ?? "")
            .join("");
        const bytes = Buffer.from(code);
        return {
            minified: bytes.byteLength,
            gzip: gzipSync(bytes, { level: 9 }).byteLength,
        };
    } finally {
        await bundle.close();
    }
}

/** Every package's entry sizes, from `packages/*\/dist`. */
async function measureAll(): Promise<{
    packages: PackageSizes[];
    bundler: string;
}> {
    const loaded = await loadRolldown();
    const packages = readPackages();
    // a workspace package's specifier (`@fragiola/primitives-react/dialog`) to its built file
    const resolveWorkspace = (id: string): string | undefined => {
        for (const { dir, manifest } of packages) {
            if (!isPackageOrSubpath(id, manifest.name)) continue;
            const subpath =
                id === manifest.name
                    ? "."
                    : `./${id.slice(manifest.name.length + 1)}`;
            const target = exportTarget(manifest.exports, subpath);
            if (target === undefined) {
                throw new Error(
                    `${manifest.name} does not export "${subpath}"`,
                );
            }
            const file = join(root, "packages", dir, target);
            if (!existsSync(file)) {
                throw new Error(
                    `${id}: packages/${dir}/${target} is missing: run \`pnpm build\` first`,
                );
            }
            return file;
        }
        return undefined;
    };
    const result: PackageSizes[] = [];
    for (const { manifest } of packages) {
        const peers = Object.keys(manifest.peerDependencies ?? {}).sort();
        const framework = manifest.name !== TOOLKIT;
        const entries: EntrySize[] = [];
        for (const subpath of entrySubpaths(manifest.exports)) {
            const specifier = specifierOf(manifest.name, subpath);
            const bundled = await measure(
                loaded,
                specifier,
                resolveWorkspace,
                peers,
            );
            entries.push(
                framework
                    ? {
                          specifier,
                          ...bundled,
                          withoutToolkit: await measure(
                              loaded,
                              specifier,
                              resolveWorkspace,
                              [...peers, TOOLKIT],
                          ),
                      }
                    : { specifier, ...bundled },
            );
        }
        result.push({ name: manifest.name, peers, entries });
    }
    return { packages: result, bundler: loaded.label };
}

async function main() {
    const { check } = sizeOptions(process.argv.slice(2));
    const { packages, bundler } = await measureAll();
    const report = formatReport(packages, bundler, SIZE_BUDGETS);
    const file = join(root, REPORT);
    // the budget guard (Epic #88): an entry over its budget fails, whether the report is written
    // or checked
    const problems = budgetProblems(packages);
    for (const problem of problems) {
        console.error(`size-report: ${problem}`);
    }
    if (problems.length > 0) {
        process.exitCode = 1;
    }
    if (check) {
        const current = existsSync(file)
            ? readFileSync(file, "utf8")
            : undefined;
        const problem = staleProblem(current, report);
        if (problem !== undefined) {
            console.error(`size-report: ${problem}`);
            process.exitCode = 1;
            return;
        }
        console.log(`size-report: ${REPORT} is up to date`);
        return;
    }
    writeFileSync(file, report);
    console.log(`size-report: ${REPORT} written`);
}

// only when run, not when a test imports it (`import.meta.main` holds through a symlinked path)
if (import.meta.main) {
    try {
        await main();
    } catch (error) {
        console.error(
            `size-report: ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exitCode = 1;
    }
}
