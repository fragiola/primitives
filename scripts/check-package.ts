// Adapted from Tree (fragiola/tree, scripts/check-package.ts), same author and licence.
// Fails when a package cannot be published as it is. Run by `pnpm check:package`, after the
// packages built. Each package under packages/ is packed with pnpm, which applies `publishConfig`
// as the publish does (npm would not: the packages are only ever packed and published through
// pnpm), then:
//
// - its packed manifest is ESM (`"type": "module"`) with `"sideEffects": false` (AGENTS.md rule 6);
// - its packed `exports` (from `publishConfig.exports`) are the repo's `exports` without the source
//   condition: the same subpaths (every entry of the repo is published, nothing else), conditions,
//   order and targets; they use only the `types`, `import` and `default` conditions, every target
//   in `dist` and a file of the tarball. A package published from its build output
//   (`publishConfig.directory`: the Angular one, which ng-packagr builds into `dist` and
//   packages/angular/scripts/publish-manifest.ts gives its manifest) is packed from that
//   directory: its packed `exports` are the repo's relative to it (`./dist/x` is `./x`);
// - publint (strict) and attw (`esm-only` profile) pass on the tarball (attw's problems re-read
//   from its JSON report when it exits non-zero: `attwProblems`);
// - every framework package (`ADAPTERS`: each package under packages/ but the toolkit) depends on
//   the toolkit at its exact version (pnpm replaces `workspace:*` when it packs), and passes its
//   smoke test: a scratch app in an OS temp directory, outside the workspace, that installs that
//   package's tarball and the toolkit's tarball only (plus the framework and its build tools from
//   the registry, at the versions fixtures/<framework> pins), imports Dialog and Tabs from their
//   own entries, typechecks (strict, the published declarations checked too), builds, and loads
//   its dev server: the page and every module the entry pulls in. A Vite + React app on TypeScript
//   7 (`reactSmoke`); a Vite + Vue app of a single-file component checked by vue-tsc on TypeScript
//   6 (`vueSmoke`); a Vite app with @analogjs/vite-plugin-angular and a standalone component
//   checked by ngc with strict templates on TypeScript 6 (`angularSmoke`).
//
// `--tarballs <dir>` checks the tarballs found in `dir` (at any depth) instead of packing (for a
// future release workflow, which would pass what `changeset pack` wrote). A package with no
// tarball there is packed from the repo, as without the option.
import { execFileSync, spawn } from "node:child_process";
import {
    closeSync,
    mkdirSync,
    mkdtempSync,
    openSync,
    readdirSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type { FrameworkName } from "./components.ts";
import { SOURCE_CONDITION } from "./source-condition.ts";

const root = join(import.meta.dirname, "..");

/** The toolkit: `packages/primitives`, which every framework package depends on. */
export const TOOLKIT = { dir: "primitives", name: "@fragiola/primitives" };

/** The only conditions a published `exports` may use: ESM, with its types. */
const PUBLISHED_CONDITIONS = ["types", "import", "default"];

/** A published target is in `dist` (`./dist/…`). */
const inDist = (target: string) => target.startsWith("./dist/");

/**
 * What is wrong with published `exports`: a condition other than `types`, `import` and `default`
 * (the source condition, `development`, …), or a target outside `dist` (`published` says what is
 * published, for a package packed from its build output: the tarball's files).
 */
export function exportProblems(
    exports: unknown,
    path = "exports",
    published: (target: string) => boolean = inDist,
): string[] {
    if (typeof exports === "string") {
        return published(exports) || exports === "./package.json"
            ? []
            : [`${path}: "${exports}" is not in dist`];
    }
    if (exports === null || typeof exports !== "object") {
        return [`${path}: not a string or an object`];
    }
    return Object.entries(exports).flatMap(([key, value]) => [
        ...(key.startsWith(".") || PUBLISHED_CONDITIONS.includes(key)
            ? []
            : [`${path}: the "${key}" condition is published`]),
        ...exportProblems(value, `${path}["${key}"]`, published),
    ]);
}

/** Every target of `exports` (the strings at its leaves), in order. */
export function exportTargets(exports: unknown): string[] {
    if (typeof exports === "string") return [exports];
    if (exports === null || typeof exports !== "object") return [];
    return Object.values(exports).flatMap(exportTargets);
}

/** The targets of the packed `exports` that are not a file of the tarball (`./path` each). */
export function missingTargets(
    exports: unknown,
    files: ReadonlySet<string>,
): string[] {
    return [...new Set(exportTargets(exports))]
        .filter((target) => !files.has(target))
        .map((target) => `exports: "${target}" is not in the tarball`);
}

/** The subpaths of `exports` (`.`, `./dialog`, …), in order. */
export function subpathsOf(exports: unknown): string[] {
    if (exports === null || typeof exports !== "object") return [];
    return Object.keys(exports).filter((key) => key.startsWith("."));
}

/** Subpaths of the repo's `exports` the packed manifest leaves out, or adds. */
export function subpathProblems(repo: unknown, packed: unknown): string[] {
    const expected = subpathsOf(repo);
    const actual = subpathsOf(packed);
    return [
        ...expected
            .filter((subpath) => !actual.includes(subpath))
            .map(
                (subpath) => `exports: the "${subpath}" entry is not published`,
            ),
        ...actual
            .filter((subpath) => !expected.includes(subpath))
            .map(
                (subpath) =>
                    `exports: "${subpath}" is published but is not an entry of the repo`,
            ),
    ];
}

/** A packed manifest that is not ESM or not side-effect free (AGENTS.md rule 6). */
export function manifestProblems(manifest: {
    type?: unknown;
    sideEffects?: unknown;
}): string[] {
    return [
        ...(manifest.type === "module" ? [] : ['"type" is not "module"']),
        ...(manifest.sideEffects === false
            ? []
            : ['"sideEffects" is not false']),
    ];
}

/**
 * `exports` with every target relative to `directory` (`./dist/x` is `./x` for `dist`): what a
 * package packed from `directory` (`publishConfig.directory`) publishes.
 */
export function relativeTo(exports: unknown, directory: string): unknown {
    const prefix = `./${directory.replace(/^\.\/|\/$/g, "")}/`;
    if (typeof exports === "string") {
        return exports.startsWith(prefix)
            ? `./${exports.slice(prefix.length)}`
            : exports;
    }
    if (exports === null || typeof exports !== "object") return exports;
    return Object.fromEntries(
        Object.entries(exports).map(([key, value]) => [
            key,
            relativeTo(value, directory),
        ]),
    );
}

/** `exports` without the source condition, at any depth (key order kept: it is the priority). */
export function withoutSource(exports: unknown): unknown {
    if (exports === null || typeof exports !== "object") return exports;
    return Object.fromEntries(
        Object.entries(exports)
            .filter(([key]) => key !== SOURCE_CONDITION)
            .map(([key, value]) => [key, withoutSource(value)]),
    );
}

/**
 * Whether the published `exports` (`publishConfig.exports`, a hand-written copy) are the repo's
 * `exports` without the source condition: the same subpaths, conditions, order and targets.
 */
export function publishedExportsProblems(
    exports: unknown,
    published: unknown,
): string[] {
    const expected = JSON.stringify(withoutSource(exports));
    const actual = JSON.stringify(published);
    return expected === actual
        ? []
        : [`published exports ${actual} are not the exports ${expected}`];
}

/** The problems of a package's packed manifest and files, against its repo manifest. */
export function packedProblems(
    repo: { exports?: unknown; publishConfig?: { directory?: string } },
    packed: { type?: unknown; sideEffects?: unknown; exports?: unknown },
    files: ReadonlySet<string>,
): string[] {
    const directory = repo.publishConfig?.directory;
    const expected =
        directory === undefined
            ? repo.exports
            : relativeTo(repo.exports, directory);
    return [
        ...manifestProblems(packed),
        ...subpathProblems(expected, packed.exports),
        ...exportProblems(
            packed.exports,
            "exports",
            directory === undefined ? inDist : (target) => files.has(target),
        ),
        ...missingTargets(packed.exports, files),
        ...publishedExportsProblems(expected, packed.exports),
    ];
}

/** The directory of `--tarballs <dir>` (or `--tarballs=<dir>`), if given; any other argument throws. */
export function tarballsOption(args: readonly string[]): string | undefined {
    let dir: string | undefined;
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "--tarballs") {
            dir = args[++i];
            if (dir === undefined || dir.startsWith("--")) {
                throw new Error("--tarballs needs a directory");
            }
        } else if (arg?.startsWith("--tarballs=")) {
            dir = arg.slice("--tarballs=".length);
            if (dir === "") throw new Error("--tarballs needs a directory");
        } else {
            throw new Error(`unknown argument: ${arg}`);
        }
    }
    return dir;
}

/** The `.tgz` files under `dir`, at any depth, sorted. */
export function findTarballs(dir: string): string[] {
    return readdirSync(dir, { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith(".tgz"))
        .map((entry) => join(entry.parentPath, entry.name))
        .sort();
}

function run(command: string, args: string[], cwd: string): void {
    console.log(`check-package: ${command} ${args.join(" ")} (in ${cwd})`);
    execFileSync(command, args, { cwd, stdio: "inherit" });
}

/** `pnpm pack` of `packages/<dir>` into `packs`; returns the tarball's path. */
function pack(dir: string, packs: string): string {
    const output = execFileSync(
        "pnpm",
        ["pack", "--pack-destination", packs, "--json"],
        { cwd: join(root, "packages", dir), encoding: "utf8" },
    );
    const { filename } = JSON.parse(output) as { filename: string };
    return filename;
}

interface PackedManifest {
    name: string;
    version: string;
    type?: unknown;
    sideEffects?: unknown;
    exports?: unknown;
    dependencies?: Record<string, string>;
}

function packedManifest(tarball: string): PackedManifest {
    return JSON.parse(
        execFileSync("tar", ["-xOzf", tarball, "package/package.json"], {
            encoding: "utf8",
        }),
    );
}

interface RepoManifest {
    name: string;
    exports?: unknown;
    publishConfig?: { directory?: string };
}

/** `packages/<dir>/package.json`: its `exports` (the source condition included), what it packs. */
function repoManifest(dir: string): RepoManifest {
    return JSON.parse(
        readFileSync(join(root, "packages", dir, "package.json"), "utf8"),
    );
}

/** The files of a tarball, as `./path` relative to the package. */
function tarballFiles(tarball: string): Set<string> {
    return new Set(
        execFileSync("tar", ["-tzf", tarball], { encoding: "utf8" })
            .split("\n")
            .filter((line) => line.startsWith("package/"))
            .map((line) => `./${line.slice("package/".length)}`),
    );
}

function lint(dir: string, tarball: string): string[] {
    const manifest = packedManifest(tarball);
    const problems = packedProblems(
        repoManifest(dir),
        manifest,
        tarballFiles(tarball),
    ).map((problem) => `${manifest.name}: ${problem}`);
    run("pnpm", ["exec", "publint", tarball, "--strict"], root);
    return [
        ...problems,
        ...attw(tarball).map((problem) => `${manifest.name}: attw: ${problem}`),
    ];
}

/** The resolutions attw's `esm-only` profile ignores (node10, and `require` from node16). */
export const ESM_ONLY_IGNORED = ["node10", "node16-cjs"];

/** A problem of `attw --format json`: its kind, and where it is. */
export interface AttwProblem {
    kind: string;
    entrypoint?: string;
    resolutionKind?: string;
    resolutionOption?: string;
    moduleSpecifier?: string;
    fileName?: string;
}

/**
 * The problems of attw's JSON report that the `esm-only` profile does not ignore. attw 0.18's own
 * exit code counts an `InternalResolutionError` of an ignored resolution: that problem names its
 * resolution `resolutionOption`, not `resolutionKind`, which its exit code reads (its table shows
 * it "ignored per resolution", and exits 1 anyway). The Angular package's root declarations
 * re-export its secondary entries by name, which node10 (no `exports`) cannot resolve.
 */
export function attwProblems(
    problems: Record<string, readonly AttwProblem[]> | readonly AttwProblem[],
    ignored: readonly string[] = ESM_ONLY_IGNORED,
): string[] {
    const list = Array.isArray(problems)
        ? problems
        : Object.values(problems).flat();
    return list
        .filter((problem) => {
            const resolution =
                problem.resolutionKind ?? problem.resolutionOption;
            return resolution === undefined || !ignored.includes(resolution);
        })
        .map((problem) =>
            [
                problem.kind,
                problem.resolutionKind ?? problem.resolutionOption,
                problem.entrypoint,
                problem.moduleSpecifier,
                problem.fileName,
            ]
                .filter((part) => part !== undefined)
                .join(" "),
        );
}

/**
 * attw (`esm-only` profile) on a tarball: its table printed, then, when it exits non-zero, its
 * JSON report read again through `attwProblems`.
 */
function attw(tarball: string): string[] {
    const args = ["exec", "attw", tarball, "--profile", "esm-only"];
    try {
        run("pnpm", args, root);
        return [];
    } catch {
        // written to a file: attw exits right after writing, and a pipe would cut a long report
        const dir = mkdtempSync(join(tmpdir(), "primitives-attw-"));
        try {
            const file = join(dir, "attw.json");
            const fd = openSync(file, "w");
            try {
                execFileSync("pnpm", [...args, "--format", "json"], {
                    cwd: root,
                    stdio: ["ignore", fd, "inherit"],
                });
            } catch {
                // its exit code is what this re-reads
            } finally {
                closeSync(fd);
            }
            const report = JSON.parse(readFileSync(file, "utf8")) as {
                problems?: Record<string, AttwProblem[]> | AttwProblem[];
            };
            const problems = attwProblems(report.problems ?? []);
            if (problems.length === 0) {
                console.log(
                    "check-package: attw: every problem is of a resolution esm-only ignores",
                );
            }
            return problems;
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    }
}

/** What `check:package` checks of a framework package, besides what every package gets. */
export interface AdapterCheck {
    /** its directory, `packages/<dir>` */
    dir: string;
    /** the framework whose fixture app (`fixtures/<framework>`) pins the smoke app's versions */
    framework: FrameworkName;
    /**
     * Its smoke test, in an empty scratch directory outside the workspace: an app that installs
     * the package's tarball and the toolkit's only, typechecks, builds and loads its dev server.
     * Throws on any failure.
     */
    smoke: (
        app: string,
        tarballs: { toolkit: string; adapter: string },
    ) => Promise<void>;
}

/** The version `fixtures/<framework>` pins of `name`: the smoke app installs nothing the repo does not. */
function fixtureVersion(framework: FrameworkName, name: string): string {
    const manifest = JSON.parse(
        readFileSync(join(root, "fixtures", framework, "package.json"), "utf8"),
    ) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
    };
    const version =
        manifest.dependencies?.[name] ?? manifest.devDependencies?.[name];
    if (version === undefined || version.startsWith("workspace:")) {
        throw new Error(`fixtures/${framework} does not pin ${name}`);
    }
    return version;
}

function writeJson(file: string, value: unknown): void {
    writeFileSync(file, `${JSON.stringify(value, null, 4)}\n`);
}

/**
 * The scratch app's `pnpm-workspace.yaml`: a file of its own keeps it out of any workspace, and
 * the toolkit tarball stands in for the exact version the framework tarball pins (the registry
 * does not have it). `extra` lines are appended.
 */
function writeWorkspace(dir: string, toolkit: string, extra: string[] = []) {
    writeFileSync(
        join(dir, "pnpm-workspace.yaml"),
        [
            "overrides:",
            `  "${TOOLKIT.name}": "file:${toolkit}"`,
            ...extra,
            "",
        ].join("\n"),
    );
}

function writeIndexHtml(dir: string, body: string, entry: string): void {
    writeFileSync(
        join(dir, "index.html"),
        `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="UTF-8" />\n<title>Smoke</title>\n</head>\n<body>\n${body}\n<script type="module" src="${entry}"></script>\n</body>\n</html>\n`,
    );
}

/** Strict, with the published declarations checked too (no skipLibCheck). */
const STRICT = {
    target: "ES2022",
    lib: ["ES2022", "DOM", "DOM.Iterable"],
    module: "ESNext",
    moduleResolution: "bundler",
    strict: true,
    noUncheckedIndexedAccess: true,
    verbatimModuleSyntax: true,
    noEmit: true,
    types: [],
};

// Dialog and Tabs, each from its own entry: what the bundle guard's app renders.
const REACT_SMOKE_MAIN = `import { Dialog } from "@fragiola/primitives-react/dialog";
import { Tabs } from "@fragiola/primitives-react/tabs";
import { useState } from "react";
import { createRoot } from "react-dom/client";

function App() {
    const [tab, setTab] = useState("a");
    return (
        <>
            <Dialog.Root>
                <Dialog.Trigger>Open</Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Backdrop />
                    <Dialog.Popup className={(state) => (state.open ? "open" : "")}>
                        <Dialog.Title>Title</Dialog.Title>
                        <Dialog.Description>Description</Dialog.Description>
                        <Dialog.Close render={<button type="button" />}>Close</Dialog.Close>
                    </Dialog.Popup>
                </Dialog.Portal>
            </Dialog.Root>
            <Tabs.Root value={tab} onValueChange={(value) => setTab(value)}>
                <Tabs.List aria-label="Tabs">
                    <Tabs.Tab value="a">A</Tabs.Tab>
                    <Tabs.Tab value="b">B</Tabs.Tab>
                    <Tabs.Indicator />
                </Tabs.List>
                <Tabs.Panel value="a">A</Tabs.Panel>
                <Tabs.Panel value="b">B</Tabs.Panel>
            </Tabs.Root>
        </>
    );
}

const container = document.getElementById("root");
if (container !== null) {
    createRoot(container).render(<App />);
}
`;

/** A scratch Vite + React app in `dir`, at fixtures/react's versions (TypeScript 7). */
function writeReactSmokeApp(
    dir: string,
    tarballs: { toolkit: string; adapter: string },
): void {
    const version = (name: string) => fixtureVersion("react", name);
    writeJson(join(dir, "package.json"), {
        name: "primitives-smoke-react",
        private: true,
        type: "module",
        dependencies: {
            "@fragiola/primitives-react": `file:${tarballs.adapter}`,
            react: version("react"),
            "react-dom": version("react-dom"),
        },
        devDependencies: {
            "@types/react": version("@types/react"),
            "@types/react-dom": version("@types/react-dom"),
            "@vitejs/plugin-react": version("@vitejs/plugin-react"),
            typescript: version("typescript"),
            vite: version("vite"),
        },
    });
    writeWorkspace(dir, tarballs.toolkit);
    writeFileSync(
        join(dir, "vite.config.js"),
        `import react from "@vitejs/plugin-react";\nimport { defineConfig } from "vite";\n\nexport default defineConfig({ plugins: [react()] });\n`,
    );
    writeIndexHtml(dir, '<div id="root"></div>', "/src/main.tsx");
    writeJson(join(dir, "tsconfig.json"), {
        compilerOptions: { ...STRICT, jsx: "react-jsx" },
        include: ["src"],
    });
    mkdirSync(join(dir, "src"));
    writeFileSync(join(dir, "src/main.tsx"), REACT_SMOKE_MAIN);
}

/** The React smoke test: installs, typechecks (tsc), builds and loads the dev server. */
async function reactSmoke(
    app: string,
    tarballs: { toolkit: string; adapter: string },
): Promise<void> {
    writeReactSmokeApp(app, tarballs);
    run("pnpm", ["install", "--no-frozen-lockfile"], app);
    run("pnpm", ["exec", "tsc", "--noEmit"], app);
    run("pnpm", ["exec", "vite", "build"], app);
    await loadThroughDevServer(app, "/src/main.tsx");
}

const VUE_SMOKE_MAIN = `import { createApp } from "vue";
import App from "./app.vue";

createApp(App).mount("#root");
`;

// A single-file component, so that vue-tsc checks the templates against the published types.
const VUE_SMOKE_APP = `<script setup lang="ts">
import { Dialog } from "@fragiola/primitives-vue/dialog";
import { Tabs } from "@fragiola/primitives-vue/tabs";
import { ref } from "vue";

const open = ref(false);
const tab = ref("a");
</script>

<template>
    <Dialog.Root v-model:open="open">
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Popup>
                <Dialog.Title>Title</Dialog.Title>
                <Dialog.Description>Description</Dialog.Description>
                <Dialog.Close>Close</Dialog.Close>
            </Dialog.Popup>
        </Dialog.Portal>
    </Dialog.Root>
    <Tabs.Root v-model:value="tab">
        <Tabs.List aria-label="Tabs">
            <Tabs.Tab value="a">A</Tabs.Tab>
            <Tabs.Tab value="b">B</Tabs.Tab>
            <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Panel value="a">A</Tabs.Panel>
        <Tabs.Panel value="b">B</Tabs.Panel>
    </Tabs.Root>
</template>
`;

const VUE_SMOKE_SHIM = `declare module "*.vue" {
    import type { DefineComponent } from "vue";
    const component: DefineComponent;
    export default component;
}
`;

/**
 * A scratch Vite + Vue app in `dir`, at fixtures/vue's versions: vue-tsc on TypeScript 6 (vue-tsc
 * does not run on TypeScript 7 yet).
 */
function writeVueSmokeApp(
    dir: string,
    tarballs: { toolkit: string; adapter: string },
): void {
    const version = (name: string) => fixtureVersion("vue", name);
    writeJson(join(dir, "package.json"), {
        name: "primitives-smoke-vue",
        private: true,
        type: "module",
        dependencies: {
            "@fragiola/primitives-vue": `file:${tarballs.adapter}`,
            vue: version("vue"),
        },
        devDependencies: {
            "@vitejs/plugin-vue": version("@vitejs/plugin-vue"),
            typescript: version("typescript"),
            vite: version("vite"),
            "vue-tsc": version("vue-tsc"),
        },
    });
    writeWorkspace(dir, tarballs.toolkit);
    writeFileSync(
        join(dir, "vite.config.js"),
        `import vue from "@vitejs/plugin-vue";\nimport { defineConfig } from "vite";\n\nexport default defineConfig({ plugins: [vue()] });\n`,
    );
    writeIndexHtml(dir, '<div id="root"></div>', "/src/main.ts");
    writeJson(join(dir, "tsconfig.json"), {
        compilerOptions: { ...STRICT, jsx: "preserve" },
        include: ["src/**/*.ts", "src/**/*.vue"],
    });
    mkdirSync(join(dir, "src"));
    writeFileSync(join(dir, "src/main.ts"), VUE_SMOKE_MAIN);
    writeFileSync(join(dir, "src/app.vue"), VUE_SMOKE_APP);
    writeFileSync(join(dir, "src/shims.d.ts"), VUE_SMOKE_SHIM);
}

/** The Vue smoke test: installs, typechecks (vue-tsc), builds and loads the dev server. */
async function vueSmoke(
    app: string,
    tarballs: { toolkit: string; adapter: string },
): Promise<void> {
    writeVueSmokeApp(app, tarballs);
    run("pnpm", ["install", "--no-frozen-lockfile"], app);
    run("pnpm", ["exec", "vue-tsc", "--noEmit"], app);
    run("pnpm", ["exec", "vite", "build"], app);
    await loadThroughDevServer(app, "/src/main.ts");
}

// A standalone component with Dialog's and Tabs' directives, each from its own secondary entry.
const ANGULAR_SMOKE_MAIN = `import { Component } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import {
    DialogBackdrop,
    DialogClose,
    DialogDescription,
    DialogPopup,
    DialogPortal,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
} from "@fragiola/primitives-angular/dialog";
import {
    TabsIndicator,
    TabsList,
    TabsPanel,
    TabsRoot,
    TabsTab,
} from "@fragiola/primitives-angular/tabs";

@Component({
    selector: "app-root",
    imports: [
        DialogRoot,
        DialogTrigger,
        DialogPortal,
        DialogBackdrop,
        DialogPopup,
        DialogTitle,
        DialogDescription,
        DialogClose,
        TabsRoot,
        TabsList,
        TabsTab,
        TabsIndicator,
        TabsPanel,
    ],
    template: \`
        <ng-container dialogRoot>
            <button dialogTrigger>Open</button>
            <ng-container *dialogPortal>
                <div dialogBackdrop></div>
                <div dialogPopup>
                    <h2 dialogTitle>Title</h2>
                    <p dialogDescription>Description</p>
                    <button dialogClose>Close</button>
                </div>
            </ng-container>
        </ng-container>
        <div tabsRoot defaultValue="a">
            <div tabsList aria-label="Tabs">
                <button tabsTab value="a">A</button>
                <button tabsTab value="b">B</button>
                <span *tabsIndicator></span>
            </div>
            <div *tabsPanel="'a'">A</div>
            <div *tabsPanel="'b'">B</div>
        </div>
    \`,
})
class App {}

bootstrapApplication(App).catch((error: unknown) => console.error(error));
`;

/**
 * A scratch Vite + Angular app in `dir` (@analogjs/vite-plugin-angular), at fixtures/angular's
 * versions (the Angular compiler's TypeScript 6).
 */
function writeAngularSmokeApp(
    dir: string,
    tarballs: { toolkit: string; adapter: string },
): void {
    const version = (name: string) => fixtureVersion("angular", name);
    writeJson(join(dir, "package.json"), {
        name: "primitives-smoke-angular",
        private: true,
        type: "module",
        dependencies: {
            "@angular/common": version("@angular/common"),
            "@angular/compiler": version("@angular/compiler"),
            "@angular/core": version("@angular/core"),
            "@angular/platform-browser": version("@angular/platform-browser"),
            "@fragiola/primitives-angular": `file:${tarballs.adapter}`,
            rxjs: version("rxjs"),
        },
        devDependencies: {
            "@analogjs/vite-plugin-angular": version(
                "@analogjs/vite-plugin-angular",
            ),
            "@angular/build": version("@angular/build"),
            "@angular/compiler-cli": version("@angular/compiler-cli"),
            typescript: version("typescript"),
            vite: version("vite"),
        },
    });
    // the Analog plugin's TypeScript is the app's (6.0); @angular/build's native helpers keep
    // their prebuilt binaries
    writeWorkspace(dir, tarballs.toolkit, [
        "packageExtensions:",
        '  "@analogjs/vite-plugin-angular":',
        "    peerDependencies:",
        '      typescript: "*"',
        "allowBuilds:",
        "  esbuild: true",
        '  "@parcel/watcher": false',
        "  lmdb: false",
        "  msgpackr-extract: false",
    ]);
    writeFileSync(
        join(dir, "vite.config.js"),
        `import angular from "@analogjs/vite-plugin-angular";\nimport { defineConfig } from "vite";\n\nexport default defineConfig({ plugins: [angular({ tsconfig: "tsconfig.json" })] });\n`,
    );
    writeIndexHtml(dir, "<app-root></app-root>", "/src/main.ts");
    const { noEmit: _noEmit, ...compilerOptions } = STRICT;
    writeJson(join(dir, "tsconfig.json"), {
        compilerOptions: { ...compilerOptions, useDefineForClassFields: false },
        angularCompilerOptions: {
            strictTemplates: true,
            strictInjectionParameters: true,
            strictInputAccessModifiers: true,
        },
        include: ["src"],
    });
    mkdirSync(join(dir, "src"));
    writeFileSync(join(dir, "src/main.ts"), ANGULAR_SMOKE_MAIN);
}

/** The Angular smoke test: installs, typechecks (ngc, strict templates), builds and loads the dev server. */
async function angularSmoke(
    app: string,
    tarballs: { toolkit: string; adapter: string },
): Promise<void> {
    writeAngularSmokeApp(app, tarballs);
    run("pnpm", ["install", "--no-frozen-lockfile"], app);
    run("pnpm", ["exec", "ngc", "-p", "tsconfig.json", "--noEmit"], app);
    run("pnpm", ["exec", "vite", "build"], app);
    await loadThroughDevServer(app, "/src/main.ts");
}

function freePort(): Promise<number> {
    return new Promise((resolve, reject) => {
        const server = createServer();
        server.once("error", reject);
        server.listen(0, "127.0.0.1", () => {
            const address = server.address();
            const port =
                typeof address === "object" && address ? address.port : 0;
            server.close(() => resolve(port));
        });
    });
}

async function fetchOk(url: string): Promise<string> {
    const response = await fetch(url);
    const body = await response.text();
    if (!response.ok) {
        throw new Error(`${url}: ${response.status}\n${body.slice(0, 2000)}`);
    }
    return body;
}

/**
 * The imports of a module served by Vite that the dev server serves too: absolute
 * (`/node_modules/.vite/deps/…`, `/src/app.vue`, `/@id/…`) or a relative `.js` file (`./chunk-….js`,
 * a prebundled dependency's chunk; a relative path with no extension is a dependency's own text,
 * such as a warning's example, not one of its imports).
 */
export function servedImports(code: string): string[] {
    return [
        ...code.matchAll(
            /(?:\bfrom|\bimport)\s*\(?\s*["'](\/[^"']+|\.{1,2}\/[^"'?]+\.m?js(?:\?[^"']*)?)["']/g,
        ),
    ].flatMap(([, path]) => (path === undefined ? [] : [path]));
}

/**
 * Starts the app's dev server, loads the page, its entry and every module the entry pulls in
 * (each served import, at any depth), then stops it. Fails when a module does not load or when
 * nothing loaded comes from a `@fragiola` package.
 */
async function loadThroughDevServer(
    dir: string,
    entryPath: string,
): Promise<void> {
    const port = await freePort();
    const base = `http://127.0.0.1:${port}`;
    const server = spawn(
        process.execPath,
        [
            join(dir, "node_modules/vite/bin/vite.js"),
            "--host",
            "127.0.0.1",
            "--port",
            String(port),
            "--strictPort",
        ],
        { cwd: dir, stdio: "inherit" },
    );
    const exited = new Promise<void>((resolve) => {
        server.once("exit", () => resolve());
    });
    try {
        const deadline = Date.now() + 60_000;
        let page: string;
        for (;;) {
            try {
                page = await fetchOk(`${base}/`);
                break;
            } catch (error) {
                if (Date.now() > deadline) throw error;
                await new Promise((resolve) => setTimeout(resolve, 250));
            }
        }
        if (!page.includes(entryPath)) {
            throw new Error(
                `the dev server's page has no ${entryPath}:\n${page}`,
            );
        }
        const loaded = new Set<string>();
        const queue = [new URL(entryPath, base).href];
        while (queue.length > 0) {
            const url = queue.shift() as string;
            if (loaded.has(url)) continue;
            loaded.add(url);
            const code = await fetchOk(url);
            for (const path of servedImports(code)) {
                const next = new URL(path, url);
                if (next.origin === base) queue.push(next.href);
            }
        }
        if (![...loaded].some((url) => url.includes("@fragiola"))) {
            throw new Error(
                `the dev server loaded no @fragiola module:\n${[...loaded].join("\n")}`,
            );
        }
        console.log(
            `check-package: the dev server loads the page and ${loaded.size} modules`,
        );
    } finally {
        // the app's directory is removed next: the server must be gone first
        server.kill();
        await exited;
    }
}

/** Every framework package, one per package under packages/ but the toolkit (`unlistedPackages`). */
export const ADAPTERS: readonly AdapterCheck[] = [
    { dir: "react", framework: "react", smoke: reactSmoke },
    { dir: "vue", framework: "vue", smoke: vueSmoke },
    { dir: "angular", framework: "angular", smoke: angularSmoke },
];

/** The packages/ directories that are neither the toolkit nor a framework package of `adapters`. */
export function unlistedPackages(
    dirs: readonly string[],
    adapters: readonly Pick<AdapterCheck, "dir">[] = ADAPTERS,
): string[] {
    return dirs.filter(
        (dir) =>
            dir !== TOOLKIT.dir &&
            !adapters.some((adapter) => adapter.dir === dir),
    );
}

/**
 * Why a framework package's packed manifest does not pin the toolkit at its exact version, or
 * nothing: one toolkit per page (the layer stack, the scroll lock and the inert state are
 * page-wide), whatever the framework packages a page loads.
 */
export function toolkitPinProblem(
    adapter: { name: string; dependencies?: Record<string, string> },
    toolkitVersion: string,
): string | undefined {
    const pinned = adapter.dependencies?.[TOOLKIT.name];
    if (pinned === toolkitVersion) return undefined;
    return pinned === undefined
        ? `${adapter.name} does not depend on ${TOOLKIT.name}`
        : `${adapter.name} depends on ${TOOLKIT.name} at "${pinned}", not at its exact version ${toolkitVersion}`;
}

/**
 * A tarball for each of `packages/*`, by directory name: the one in `given` (`--tarballs`) when
 * there is one, else `pnpm pack` into `packs`. A given tarball of no package of the repo throws.
 */
function tarballsFor(
    dirs: readonly string[],
    packs: string,
    given: string | undefined,
): Map<string, string> {
    const byPackage = new Map<string, string>();
    if (given !== undefined) {
        const found = findTarballs(resolve(given));
        if (found.length === 0) {
            throw new Error(`--tarballs: no .tgz file under ${given}`);
        }
        for (const tarball of found) {
            byPackage.set(packedManifest(tarball).name, tarball);
        }
    }
    const tarballs = new Map<string, string>();
    for (const dir of dirs) {
        const { name } = repoManifest(dir);
        const tarball = byPackage.get(name);
        byPackage.delete(name);
        console.log(`check-package: ${name} from ${tarball ?? "pnpm pack"}`);
        tarballs.set(dir, tarball ?? pack(dir, packs));
    }
    if (byPackage.size > 0) {
        throw new Error(
            `--tarballs: no package of the repo is ${[...byPackage.keys()].join(", ")}`,
        );
    }
    return tarballs;
}

async function main() {
    const given = tarballsOption(process.argv.slice(2));
    const packs = mkdtempSync(join(tmpdir(), "primitives-pack-"));
    const apps: string[] = [];
    try {
        const dirs = readdirSync(join(root, "packages")).sort();
        const unlisted = unlistedPackages(dirs);
        if (unlisted.length > 0) {
            throw new Error(
                `packages/${unlisted.join(", packages/")}: not the toolkit and not in ADAPTERS (scripts/check-package.ts)`,
            );
        }
        const tarballs = tarballsFor(dirs, packs, given);
        const problems = [...tarballs].flatMap(([dir, tarball]) =>
            lint(dir, tarball),
        );
        if (problems.length > 0) {
            throw new Error(
                `The packed packages are wrong:\n${problems.join("\n")}`,
            );
        }
        const toolkit = tarballs.get(TOOLKIT.dir);
        if (toolkit === undefined) {
            throw new Error(`packages/${TOOLKIT.dir} is expected`);
        }
        const toolkitVersion = packedManifest(toolkit).version;
        const pins = ADAPTERS.flatMap((adapter) => {
            const tarball = tarballs.get(adapter.dir);
            if (tarball === undefined) {
                return [`packages/${adapter.dir} is expected`];
            }
            const problem = toolkitPinProblem(
                packedManifest(tarball),
                toolkitVersion,
            );
            return problem === undefined ? [] : [problem];
        });
        if (pins.length > 0) {
            throw new Error(pins.join("\n"));
        }
        for (const adapter of ADAPTERS) {
            const tarball = tarballs.get(adapter.dir) as string;
            const app = mkdtempSync(
                join(tmpdir(), `primitives-smoke-${adapter.dir}-`),
            );
            apps.push(app);
            await adapter.smoke(app, { toolkit, adapter: tarball });
            console.log(`check-package: ${adapter.dir}: the smoke app passes`);
        }
        console.log("check-package: every package can be published");
    } finally {
        for (const dir of [packs, ...apps]) {
            rmSync(dir, { recursive: true, force: true, maxRetries: 5 });
        }
    }
}

// only when run, not when a test imports it (`import.meta.main` holds through a symlinked path)
if (import.meta.main) {
    try {
        await main();
    } catch (error) {
        console.error(
            `check-package: ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exitCode = 1;
    }
}
