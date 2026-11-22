// Inspired by Tree (fragiola/tree, site/tests/docs-reference.test.ts), same author and licence.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import {
    COMPONENTS,
    FRAMEWORKS,
    MECHANISMS,
    UTILITIES,
} from "../../scripts/components.ts";
import { readPages } from "../contract.ts";
import { DOCS_DIR } from "../sources.ts";

// The API pages are written by hand, and checked against the packages' sources so they cannot
// drift:
//
//   - `## Exports`: each row names an entry (`@fragiola/primitives-react/dialog`) and every name it
//     exports. The row must list exactly what the entry's source exports, and every entry must have
//     its row: each component's in each framework on its page, each utility entry's
//     (`/direction`, `/render`) in each framework on its page, each toolkit mechanism on
//     api/toolkit.
//   - `## Props`: one `### <Part>` per part of the component's namespace, in order, each with a
//     table whose first column names a prop (`` `open` ``), optionally only for some frameworks
//     (`` `id` (angular) ``). Each framework's declared props of that part must be exactly the
//     documented ones: React's `<Part>Props` interface (its fields and methods, and the interfaces
//     it extends, but the contract's `PartProps`), Vue's `props` (but `as`) and `emits` (`valueChange` is
//     `onValueChange`), Angular's `input()`s and `output()`s (`openChangeDetails` is
//     `onOpenChange`; `openChange` is the two-way binding of the `open` input).

const ROOT = join(import.meta.dirname, "../..");

/** How the checker reads the sources: a planted drift replaces one file. */
interface Sources {
    read(path: string): string;
    /** every file under a directory, repo-relative */
    files(dir: string): string[];
}

const disk: Sources = {
    read: (path) => readFileSync(join(ROOT, path), "utf8"),
    files: (dir) => {
        const walk = (abs: string): string[] =>
            readdirSync(abs).flatMap((name) => {
                const path = join(abs, name);
                return statSync(path).isDirectory() ? walk(path) : [path];
            });
        return walk(join(ROOT, dir)).map((file) => relative(ROOT, file));
    },
};

const PACKAGE_DIRS: Record<string, string> = {
    "@fragiola/primitives": "packages/primitives",
    "@fragiola/primitives-react": "packages/react",
    "@fragiola/primitives-vue": "packages/vue",
    "@fragiola/primitives-angular": "packages/angular",
};

// ─── the sources ─────────────────────────────────────────────────────────────

const withoutComments = (source: string) =>
    source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/** The names a module exports (`export { a, type B as C }`, declarations); `*` when it re-exports all. */
function exportedNames(source: string): string[] {
    const text = withoutComments(source);
    const names: string[] = [];
    if (/^\s*export\s+\*/m.test(text)) names.push("*");
    for (const match of text.matchAll(/export\s+(?:type\s+)?\{([^}]*)\}/g)) {
        for (const item of (match[1] ?? "").split(",")) {
            const name = item
                .trim()
                .replace(/^type\s+/, "")
                .split(/\s+as\s+/)
                .pop();
            if (name) names.push(name.trim());
        }
    }
    for (const match of text.matchAll(
        /export\s+(?:declare\s+)?(?:async\s+)?(?:function\*?|const|let|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/g,
    )) {
        if (match[1]) names.push(match[1]);
    }
    return [...new Set(names)].sort();
}

/** The source file of an entry, from its package's `exports` (the `@fragiola/source` condition). */
function entryFile(entry: string, sources: Sources): string {
    const pkg = Object.keys(PACKAGE_DIRS)
        .sort((a, b) => b.length - a.length)
        .find((name) => entry === name || entry.startsWith(`${name}/`));
    if (!pkg) throw new Error(`${entry}: not a package of this repository`);
    const dir = PACKAGE_DIRS[pkg] ?? "";
    const manifest = JSON.parse(sources.read(`${dir}/package.json`)) as {
        exports: Record<string, Record<string, string> | string>;
    };
    const subpath = entry === pkg ? "." : `./${entry.slice(pkg.length + 1)}`;
    const target = manifest.exports[subpath];
    const source =
        typeof target === "object" ? target["@fragiola/source"] : undefined;
    if (!source) throw new Error(`${entry}: no such entry`);
    return join(dir, source);
}

/** The text of the balanced `{ … }` that starts at `open`. */
function braced(text: string, open: number): string {
    let depth = 0;
    for (let i = open; i < text.length; i++) {
        if (text[i] === "{") depth++;
        else if (text[i] === "}" && --depth === 0)
            return text.slice(open + 1, i);
    }
    return text.slice(open + 1);
}

/** The keys of an object literal's top level (`a: …`, `"b": …`), and its spreads (`...x`). */
function objectKeys(source: string): { keys: string[]; spreads: string[] } {
    const body = withoutComments(source);
    const keys: string[] = [];
    const spreads: string[] = [];
    let depth = 0;
    let start = 0;
    const take = (item: string) => {
        const text = item.trim();
        const spread = /^\.\.\.([\w$]+)/.exec(text);
        if (spread?.[1]) spreads.push(spread[1]);
        const key = /^(?:"([^"]+)"|'([^']+)'|([\w$]+))\s*[:(]/.exec(text);
        const name = key?.[1] ?? key?.[2] ?? key?.[3];
        if (!spread && name) keys.push(name);
    };
    for (let i = 0; i < body.length; i++) {
        const char = body[i];
        if (char === "{" || char === "(" || char === "[") depth++;
        else if (char === "}" || char === ")" || char === "]") depth--;
        else if (char === "," && depth === 0) {
            take(body.slice(start, i));
            start = i + 1;
        }
    }
    take(body.slice(start));
    return { keys, spreads };
}

const capitalize = (name: string) =>
    name.charAt(0).toUpperCase() + name.slice(1);

/**
 * A component's namespace: part → the component (or directive) that implements it. A function on
 * the namespace (`createHandle: createDialogHandle`) is no part: it is checked as an export.
 */
function namespaceOf(source: string): Map<string, string> {
    const open = source.indexOf("{", source.search(/export const \w+ = \{/));
    const body = withoutComments(braced(source, open));
    // the namespace's own entries only, not the names inside an entry's type
    // (`Trigger: DialogTrigger as <Payload>(props: AlertDialogTriggerProps<Payload>) => ReactNode`)
    const entries: string[] = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i <= body.length; i++) {
        const char = body[i];
        if (char === "{" || char === "(" || char === "[") depth++;
        else if (char === "}" || char === ")" || char === "]") depth--;
        else if (i === body.length || (char === "," && depth === 0)) {
            entries.push(body.slice(start, i));
            start = i + 1;
        }
    }
    const parts = new Map<string, string>();
    for (const entry of entries) {
        const match = /^\s*(\w+):\s*(\w+)/.exec(entry);
        if (match?.[1] && match[2] && /^[A-Z]/.test(match[2])) {
            parts.set(match[1], match[2]);
        }
    }
    return parts;
}

/** `checkbox-group` → `CheckboxGroup`. */
const pascal = (component: string) =>
    component
        .split("-")
        .map((word) => capitalize(word))
        .join("");

/**
 * A component's parts: its namespace (`parts.ts`), or, for a component that is no namespace (a
 * CheckboxGroup), the one part named after the component, implemented by itself.
 */
function partsOf(dir: string, component: string, sources: Sources) {
    const file = `${dir}/components/${component}/parts.ts`;
    if (!sources.files(`${dir}/components/${component}`).includes(file)) {
        return new Map([[pascal(component), pascal(component)]]);
    }
    return namespaceOf(sources.read(file));
}

/** The React props of each part (interfaces, the contract's `PartProps` left out). */
function reactProps(component: string, sources: Sources) {
    const interfaces = new Map<
        string,
        { fields: string[]; bases: string[]; omitted?: string[] }
    >();
    for (const file of sources.files("packages/react/src")) {
        if (!/\.tsx?$/.test(file)) continue;
        const text = sources.read(file);
        // a union of props (`type ComboboxRootProps<Item> = …SingleProps<Item> | …MultipleProps<Item>`)
        // has the props of each member
        for (const match of text.matchAll(
            /export type (\w+Props)\b(?:<[^=]*>)?\s*=\s*([^;]+);/g,
        )) {
            const bases = [...(match[2] ?? "").matchAll(/\b(\w+Props)\b/g)]
                .map((base) => base[1] ?? "")
                .filter((base) => base !== "PartProps");
            interfaces.set(match[1] ?? "", { fields: [], bases });
        }
        // an unexported interface can be a base of an exported one
        for (const match of text.matchAll(/(?:export )?interface (\w+)/g)) {
            // the heritage clause runs to the first `{` outside a type argument
            let depth = 0;
            let open = (match.index ?? 0) + match[0].length;
            for (; open < text.length; open++) {
                const char = text[open];
                if (char === "<") depth++;
                else if (char === ">") depth--;
                else if (char === "{" && depth === 0) break;
            }
            const heritage = text.slice(
                (match.index ?? 0) + match[0].length,
                open,
            );
            const body = braced(text, open);
            // a field (`open?: boolean`) or a method (`onClearErrors?(errors): void`)
            const fields = [...body.matchAll(/^ {4}(\w+)\??[:(<]/gm)].map(
                (field) => field[1] ?? "",
            );
            // a base may be an `Omit<Base, "a" | "b">`: Base's props but those keys
            const omitted: string[] = [];
            const bases = (/extends\s+([\s\S]*)$/.exec(heritage)?.[1] ?? "")
                .split(/,(?![^<]*>)/)
                .map((base) => {
                    const omit = /^Omit<\s*(\w+)[^,]*,([^>]*)>/.exec(
                        base.trim(),
                    );
                    if (!omit) return base.trim().replace(/<[\s\S]*$/, "");
                    for (const key of (omit[2] ?? "").matchAll(/"(\w+)"/g))
                        omitted.push(key[1] ?? "");
                    return omit[1] ?? "";
                })
                .filter((base) => base && base !== "PartProps");
            interfaces.set(match[1] ?? "", { fields, bases, omitted });
        }
    }
    const propsOf = (name: string): string[] => {
        const found = interfaces.get(name);
        if (!found) return [];
        const omitted = found.omitted ?? [];
        return [
            ...found.fields,
            ...found.bases
                .flatMap(propsOf)
                .filter((prop) => !omitted.includes(prop)),
        ];
    };
    const parts = partsOf("packages/react/src", component, sources);
    return new Map(
        [...parts].map(([part, implementation]) => [
            part,
            propsOf(`${implementation}Props`).filter((p) => p !== "children"),
        ]),
    );
}

/** The Vue props and events of each part (`as` left out; `fooChange` is `onFooChange`). */
function vueProps(component: string, sources: Sources) {
    const dir = `packages/vue/src`;
    const constants = new Map<string, string>();
    for (const file of sources.files(dir)) {
        if (!file.endsWith(".ts")) continue;
        const text = sources.read(file);
        for (const match of text.matchAll(/export const (\w+) = \{/g)) {
            constants.set(
                match[1] ?? "",
                braced(text, (match.index ?? 0) + match[0].length - 1),
            );
        }
    }
    const keysOf = (body: string): string[] => {
        const { keys, spreads } = objectKeys(body);
        return [
            ...keys,
            ...spreads.flatMap((name) => keysOf(constants.get(name) ?? "")),
        ];
    };
    const option = (text: string, name: string): string[] => {
        const match = new RegExp(String.raw`\n\s+${name}:\s*(\{|[\w$]+)`).exec(
            text,
        );
        if (!match) return [];
        if (match[1] === "{")
            return keysOf(braced(text, match.index + match[0].length - 1));
        return keysOf(constants.get(match[1] ?? "") ?? "");
    };
    const parts = partsOf(dir, component, sources);
    const kebab = (name: string) =>
        name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    return new Map(
        [...parts].map(([part, implementation]) => {
            // the part's own file, else the component file that declares it (Menu's
            // `MenuSubmenuRoot`, beside `MenuRoot`), else the component it shares its parts with
            // (RangeCalendar's are the Calendar's); read from its declaration on
            const base = SHARED_PARTS[component];
            const folders = [component, ...(base ? [base] : [])].map(
                (name) => `${dir}/components/${name}`,
            );
            const folder = folders[0] ?? "";
            const declaration = `export const ${implementation}:`;
            const file =
                folders
                    .flatMap((each) => [
                        `${each}/${kebab(implementation)}.ts`,
                        ...sources.files(each),
                    ])
                    .find(
                        (path) =>
                            folders.some((each) =>
                                sources.files(each).includes(path),
                            ) && sources.read(path).includes(declaration),
                    ) ??
                // else the part's own file, in the first folder that has it (an AlertDialog's
                // Title is Dialog's `dialog-title.ts`)
                folders
                    .map((each) => `${each}/${kebab(implementation)}.ts`)
                    .find((path) =>
                        folders.some((each) =>
                            sources.files(each).includes(path),
                        ),
                    ) ??
                `${folder}/${kebab(implementation)}.ts`;
            const whole = sources.read(file);
            let text = whole.slice(Math.max(0, whole.indexOf(declaration)));
            // a part made by a factory its roots share (`defineCalendarRoot(...)`): the factory's
            // options are its own
            const factory =
                /=\s*publicComponent[^(]*\(\s*(define\w+)\(|=\s*(define\w+)\(/.exec(
                    text,
                );
            const factoryName = factory?.[1] ?? factory?.[2];
            if (factoryName && !/\n\s+props:/.test(text)) {
                const source = folders
                    .flatMap((each) => sources.files(each))
                    .find((path) =>
                        sources
                            .read(path)
                            .includes(`export function ${factoryName}(`),
                    );
                if (source) {
                    const body = sources.read(source);
                    text = body.slice(
                        body.indexOf(`export function ${factoryName}(`),
                    );
                }
            }
            const props = option(text, "props").filter((p) => p !== "as");
            const events = option(text, "emits")
                .filter((event) => !event.startsWith("update:"))
                .map((event) => `on${capitalize(event)}`);
            return [part, [...props, ...events]];
        }),
    );
}

/**
 * The components whose parts, but their Root, are another component's (spec/calendar.md): their
 * namespace lists that component's parts, each framework implements them once, in its folder.
 */
const SHARED_PARTS: Record<string, string> = {
    "range-calendar": "calendar",
    "date-range-picker": "date-picker",
    // spec/alert-dialog.md, spec/context-menu.md: built on Dialog's and Menu's parts (Angular
    // gives them their own selectors, as subclasses of Dialog's and Menu's directives)
    "alert-dialog": "dialog",
    "context-menu": "menu",
};

/** The parts Angular has no directive for: their API is another part's (`component.Part`). */
const NO_ANGULAR_DIRECTIVE = new Set(["combobox.Value"]);

/** The Angular inputs and outputs of each part's directive. */
function angularProps(
    component: string,
    parts: readonly string[],
    sources: Sources,
) {
    const kebab = (name: string) =>
        name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    return new Map(
        parts.map((part) => {
            // a component that is no namespace is its one part (CheckboxGroup); a shared part is
            // its own directive when its entry has one (`[alertDialogPopup]`, a subclass of
            // `DialogPopup`), else its base component's (RangeCalendar's Cell is `[calendarCell]`)
            const shared = SHARED_PARTS[component];
            const ownFile = `packages/angular/${component}/directives/${kebab(`${pascal(component)}${part}`)}.directive.ts`;
            const owner =
                part !== "Root" &&
                shared &&
                !sources
                    .files(`packages/angular/${component}/directives`)
                    .includes(ownFile)
                    ? shared
                    : component;
            const directive =
                part === pascal(component) ? part : `${pascal(owner)}${part}`;
            const dir = `packages/angular/${owner}/directives`;
            const own = `${dir}/${kebab(directive)}.directive.ts`;
            // a part may share another part's directive, which lists its selector too (Menu's
            // `[menuRoot], [menuSubmenuRoot]`)
            const selector = `[${directive.charAt(0).toLowerCase()}${directive.slice(1)}]`;
            const file =
                sources.files(dir).find((path) => path === own) ??
                sources
                    .files(dir)
                    .find(
                        (path) =>
                            path.endsWith(".directive.ts") &&
                            new RegExp(
                                String.raw`selector:\s*"[^"]*${selector.replace(/[[\]]/g, "\\$&")}`,
                            ).test(sources.read(path)),
                    ) ??
                own;
            // a part Angular has no directive for (Combobox's Value: the root's `value()` signal)
            // declares nothing; any other missing directive file is drift and throws below
            if (
                NO_ANGULAR_DIRECTIVE.has(`${component}.${part}`) &&
                !sources.files(dir).includes(file)
            )
                return [part, []];
            // a directive's inputs and outputs, and those of the classes it extends
            // (`CalendarRoot extends CalendarRootBase`), found in its entry or its base's
            const dirs = [
                ...new Set(
                    [component, owner, SHARED_PARTS[component]]
                        .filter((name) => name !== undefined)
                        .map((name) => `packages/angular/${name}/directives`),
                ),
            ];
            let text = sources.read(file);
            for (
                let base = /class \w+ extends (\w+)/.exec(text)?.[1], depth = 0;
                base !== undefined && depth < 3;
                depth++
            ) {
                const name: string = base;
                const source = dirs
                    .flatMap((each) => sources.files(each))
                    .find((path) =>
                        new RegExp(String.raw`class ${name}\b`).test(
                            sources.read(path),
                        ),
                    );
                if (!source) break;
                const added = sources.read(source);
                text += `\n${added}`;
                base = /class \w+ extends (\w+)/.exec(added)?.[1];
            }
            // an input bound under an alias (`boundValue = input(…, { alias: "value" })`) is its
            // alias, but a structural directive's microsyntax inputs (`alias: "dialogPortal"`,
            // `"tabsPanelKeepMounted"`) keep their property's name, also when the input is its
            // base directive's (`ContextMenuCheckboxItemIndicator extends MenuCheckboxItemIndicator`,
            // `alias: "menuCheckboxItemIndicator"`)
            const prefixes = [
                selector.slice(1, -1),
                ...[...text.matchAll(/selector:\s*"([^"]*)"/g)].flatMap(
                    (match) =>
                        [...(match[1] ?? "").matchAll(/\[(\w+)\]/g)].map(
                            (each) => each[1] ?? "",
                        ),
                ),
            ];
            const inputs = [
                ...text.matchAll(
                    /readonly (\w+) =\s*input(?:\.required)?[<(]([^;]*);/g,
                ),
            ].map((match) => {
                const alias = /alias:\s*"(\w+)"/.exec(match[2] ?? "")?.[1];
                return alias !== undefined &&
                    !prefixes.some((prefix) => alias.startsWith(prefix))
                    ? alias
                    : (match[1] ?? "");
            });
            const outputs = [
                ...text.matchAll(/readonly (\w+) =\s*output[<(]/g),
            ].flatMap((match) => {
                const name = match[1] ?? "";
                if (name.endsWith("ChangeDetails"))
                    return [
                        `on${capitalize(name.slice(0, -"Details".length))}`,
                    ];
                if (
                    name.endsWith("Change") &&
                    inputs.includes(name.slice(0, -"Change".length))
                )
                    return [];
                return [`on${capitalize(name)}`];
            });
            return [part, [...inputs, ...outputs]];
        }),
    );
}

// ─── the pages ───────────────────────────────────────────────────────────────

/** The `## <title>` section of a page, up to the next `## `. */
function section(page: string, title: string): string | undefined {
    const start = page.search(new RegExp(`^## ${title}$`, "m"));
    if (start < 0) return undefined;
    const rest = page.slice(start).split("\n").slice(1).join("\n");
    const end = rest.search(/^## /m);
    return end < 0 ? rest : rest.slice(0, end);
}

/** The first cell of every body row of the Markdown tables of a text. */
function rows(text: string): string[][] {
    return text
        .split("\n")
        .filter((line) => line.startsWith("|") && !/^\|\s*-/.test(line))
        .slice(0)
        .map((line) =>
            line
                .slice(1, -1)
                .split(/(?<!\\)\|/)
                .map((cell) => cell.trim()),
        );
}

const ticked = (cell: string) =>
    [...cell.matchAll(/`([^`]+)`/g)].map((match) => match[1] ?? "");

interface DocumentedProp {
    name: string;
    /** the frameworks that declare it, when not all of them */
    frameworks?: string[];
}

/** `### <Part>` → its documented props, in page order. */
function documentedProps(page: string): Map<string, DocumentedProp[]> {
    const props = new Map<string, DocumentedProp[]>();
    const text = section(page, "Props") ?? "";
    for (const block of text.split(/^### /m).slice(1)) {
        const [heading = "", ...lines] = block.split("\n");
        const list: DocumentedProp[] = [];
        for (const [first = "", ...rest] of rows(lines.join("\n"))) {
            if (first === "prop" && rest[0] === "type") continue;
            const name = ticked(first)[0];
            if (!name) continue;
            const only = /\(([a-z, ]+)\)\s*$/.exec(first)?.[1];
            list.push({
                name,
                ...(only
                    ? { frameworks: only.split(",").map((f) => f.trim()) }
                    : {}),
            });
        }
        props.set(heading.trim(), list);
    }
    return props;
}

/** The `## Exports` table: entry → the names it documents. */
function documentedExports(page: string): Map<string, string[]> {
    const exports = new Map<string, string[]>();
    for (const [entry = "", names = ""] of rows(
        section(page, "Exports") ?? "",
    )) {
        const [name] = ticked(entry);
        if (name) exports.set(name, ticked(names).sort());
    }
    return exports;
}

// ─── the checker ─────────────────────────────────────────────────────────────

const sameSet = (a: readonly string[], b: readonly string[]) =>
    a.length === b.length &&
    [...a].sort().every((x, i) => x === [...b].sort()[i]);

/** Every way the API pages differ from the packages' sources. */
function docsReferenceProblems(
    pages: Map<string, string>,
    sources: Sources = disk,
): string[] {
    const problems: string[] = [];

    // exports
    const expected = new Map<string, string>([
        ...COMPONENTS.flatMap((component) =>
            FRAMEWORKS.map(
                (framework) =>
                    [
                        `@fragiola/primitives-${framework}/${component}`,
                        `api/${component}`,
                    ] as const,
            ),
        ),
        ...UTILITIES.flatMap((utility) =>
            FRAMEWORKS.map(
                (framework) =>
                    [
                        `@fragiola/primitives-${framework}/${utility}`,
                        `api/${utility}`,
                    ] as const,
            ),
        ),
        ...MECHANISMS.map(
            (mechanism) =>
                [`@fragiola/primitives/${mechanism}`, "api/toolkit"] as const,
        ),
    ]);
    const documented = new Map<string, { page: string; names: string[] }>();
    for (const [path, page] of pages) {
        for (const [entry, names] of documentedExports(page)) {
            documented.set(entry, { page: path, names });
        }
    }
    for (const [entry, page] of expected) {
        const doc = documented.get(entry);
        if (!doc || doc.page !== page) {
            problems.push(`${page}: no "## Exports" row for ${entry}`);
        }
    }
    for (const [entry, doc] of documented) {
        let actual: string[];
        try {
            actual = exportedNames(sources.read(entryFile(entry, sources)));
        } catch (error) {
            problems.push(`${doc.page}: ${(error as Error).message}`);
            continue;
        }
        const missing = actual.filter((name) => !doc.names.includes(name));
        const extra = doc.names.filter((name) => !actual.includes(name));
        if (missing.length > 0)
            problems.push(
                `${doc.page}: ${entry} also exports ${missing.join(", ")}`,
            );
        if (extra.length > 0)
            problems.push(
                `${doc.page}: ${entry} does not export ${extra.join(", ")}`,
            );
    }

    // props
    for (const component of COMPONENTS) {
        const path = `api/${component}`;
        const page = pages.get(path);
        if (page === undefined) {
            problems.push(`${path}.mdx is missing`);
            continue;
        }
        const props = documentedProps(page);
        const react = reactProps(component, sources);
        const parts = [...react.keys()];
        const vue = vueProps(component, sources);
        if (!sameSet([...vue.keys()], parts))
            problems.push(
                `${component}: Vue's parts (${[...vue.keys()].join(", ")}) are not React's (${parts.join(", ")})`,
            );
        const angular = angularProps(component, parts, sources);
        if ([...props.keys()].join(",") !== parts.join(",")) {
            problems.push(
                `${path}: "## Props" has ${[...props.keys()].join(", ")}, the namespace ${parts.join(", ")}`,
            );
        }
        for (const part of parts) {
            const docs = props.get(part) ?? [];
            for (const [framework, declared] of [
                ["react", react.get(part) ?? []],
                ["vue", vue.get(part) ?? []],
                ["angular", angular.get(part) ?? []],
            ] as const) {
                const wanted = docs
                    .filter(
                        (d) =>
                            !d.frameworks || d.frameworks.includes(framework),
                    )
                    .map((d) => d.name);
                const undocumented = declared.filter(
                    (p) => !wanted.includes(p),
                );
                const gone = wanted.filter((p) => !declared.includes(p));
                if (undocumented.length > 0)
                    problems.push(
                        `${path}: ${part}: ${framework} declares ${undocumented.join(", ")}, not documented`,
                    );
                if (gone.length > 0)
                    problems.push(
                        `${path}: ${part}: ${framework} has no ${gone.join(", ")}`,
                    );
            }
        }
    }
    return problems;
}

// ─── the tests ───────────────────────────────────────────────────────────────

const PAGES = readPages(DOCS_DIR);

/** The sources with one file's text changed. */
function planted(path: string, change: (text: string) => string): Sources {
    return {
        files: disk.files,
        read: (file) =>
            file === path ? change(disk.read(file)) : disk.read(file),
    };
}

describe("the API pages", () => {
    it("document every entry's exports and every part's props, as the sources declare them", () => {
        expect(docsReferenceProblems(PAGES)).toEqual([]);
    });

    it("read the sources they check", () => {
        expect(
            documentedProps(PAGES.get("api/dialog") ?? "").get("Root"),
        ).toEqual([
            { name: "open" },
            { name: "defaultOpen" },
            { name: "onOpenChange" },
            { name: "onOpenChangeComplete" },
            { name: "actionsRef", frameworks: ["react"] },
            { name: "handle" },
            { name: "triggerId" },
            { name: "defaultTriggerId" },
        ]);
        expect(
            documentedProps(PAGES.get("api/dialog") ?? "").get("Title"),
        ).toEqual([{ name: "id", frameworks: ["angular"] }]);
        expect(reactProps("tabs", disk).get("Root")).toEqual([
            "value",
            "defaultValue",
            "onValueChange",
            "orientation",
            "activation",
            "loopFocus",
        ]);
        expect(vueProps("dialog", disk).get("Root")).toEqual([
            "handle",
            "open",
            "defaultOpen",
            "triggerId",
            "defaultTriggerId",
            "onOpenChange",
            "onOpenChangeComplete",
        ]);
        expect(angularProps("dialog", ["Root"], disk).get("Root")).toEqual([
            "open",
            "defaultOpen",
            "handle",
            "triggerId",
            "defaultTriggerId",
            "onOpenChange",
            "onOpenChangeComplete",
        ]);
        expect(
            exportedNames(
                'export { a, type B as C } from "./x";\nexport * from "./y";',
            ),
        ).toEqual(["*", "C", "a"]);
    });
});

describe("the docs reference check", () => {
    it("reads a component that is no namespace as its one part", () => {
        expect([...reactProps("checkbox-group", disk).keys()]).toEqual([
            "CheckboxGroup",
        ]);
        const sources = planted(
            "packages/angular/checkbox-group/directives/checkbox-group.directive.ts",
            (text) =>
                text.replace(
                    "readonly allValues = input",
                    "readonly everyValue = input",
                ),
        );
        expect(docsReferenceProblems(PAGES, sources)).toContain(
            "api/checkbox-group: CheckboxGroup: angular declares everyValue, not documented",
        );
    });

    it("reads a shared part in the component it shares it with, and a root's base", () => {
        expect(reactProps("range-calendar", disk).get("Cell")).toEqual([
            "date",
        ]);
        expect(vueProps("range-calendar", disk).get("Root")).toContain(
            "visibleMonths",
        );
        expect(
            angularProps("date-range-picker", ["Root", "Positioner"], disk),
        ).toEqual(
            new Map([
                [
                    "Root",
                    expect.arrayContaining(["value", "open", "onOpenChange"]),
                ],
                ["Positioner", expect.arrayContaining(["side", "anchor"])],
            ]),
        );
        const sources = planted(
            "packages/angular/calendar/directives/calendar-cell.directive.ts",
            (text) =>
                text.replace("readonly date = input", "readonly day = input"),
        );
        const problems = docsReferenceProblems(PAGES, sources);
        expect(problems).toContain(
            "api/calendar: Cell: angular declares day, not documented",
        );
        expect(problems).toContain(
            "api/range-calendar: Cell: angular declares day, not documented",
        );
    });

    it("fails when an entry exports a name its page does not list", () => {
        const sources = planted(
            "packages/react/src/components/tabs/index.ts",
            (text) => `${text}export { useTabs } from "./use-tabs.ts";\n`,
        );
        expect(docsReferenceProblems(PAGES, sources)).toContain(
            "api/tabs: @fragiola/primitives-react/tabs also exports useTabs",
        );
    });

    it("fails when a utility entry exports a name its page does not list", () => {
        const sources = planted(
            "packages/vue/src/direction/index.ts",
            (text) =>
                `${text}export { useProvidedDirection } from "./use-direction.ts";\n`,
        );
        expect(docsReferenceProblems(PAGES, sources)).toContain(
            "api/direction: @fragiola/primitives-vue/direction also exports useProvidedDirection",
        );
    });

    it("fails when a utility entry has no row on its page", () => {
        const pages = new Map(PAGES);
        pages.set(
            "api/render",
            (PAGES.get("api/render") ?? "").replace(
                /^\| `@fragiola\/primitives-angular\/render` .*$/m,
                "",
            ),
        );
        expect(docsReferenceProblems(pages)).toContain(
            'api/render: no "## Exports" row for @fragiola/primitives-angular/render',
        );
    });

    it("reads the props of an Omit<…> base, and a namespace's entries only", () => {
        // `MenuRootProps extends Omit<MenuSubmenuRootProps, "children">, …`
        expect(reactProps("menu", disk).get("Root")).toEqual(
            expect.arrayContaining(["open", "loopFocus", "modal", "handle"]),
        );
        // `Trigger: DialogTrigger as <Payload>(props: AlertDialogTriggerProps<Payload>) => …`
        expect([...reactProps("alert-dialog", disk).keys()]).toEqual([
            "Root",
            "Trigger",
            "Portal",
            "Backdrop",
            "Viewport",
            "Popup",
            "Title",
            "Description",
            "Close",
        ]);
    });

    it("reads a part built on another component's: its own subclass, or the base's file", () => {
        // `AlertDialogBackdrop extends DialogBackdrop`, in the dialog entry
        expect(
            angularProps("alert-dialog", ["Backdrop"], disk).get("Backdrop"),
        ).toEqual(["forceRender"]);
        // the base's structural input keeps its name (`alias: "menuCheckboxItemIndicator"`)
        expect(
            angularProps("context-menu", ["CheckboxItemIndicator"], disk).get(
                "CheckboxItemIndicator",
            ),
        ).toContain("options");
        // Vue's AlertDialog.Title is Dialog's `dialog-title.ts`
        expect(vueProps("alert-dialog", disk).has("Title")).toBe(true);
    });

    it("reads a method of a props interface as a prop", () => {
        expect(reactProps("form", disk).get("Form")).toContain("onClearErrors");
    });

    it("fails when a documented export is gone", () => {
        const sources = planted(
            "packages/primitives/src/focus/index.ts",
            (text) => text.replace(/\bgetTabbables,?/, ""),
        );
        expect(docsReferenceProblems(PAGES, sources)).toContain(
            "api/toolkit: @fragiola/primitives/focus does not export getTabbables",
        );
    });

    it("fails when a part gains a prop its page does not document", () => {
        const sources = planted(
            "packages/react/src/components/dialog/dialog-trigger.tsx",
            (text) =>
                text.replace(
                    "disabled?: boolean;",
                    "disabled?: boolean;\n    nativeButton?: boolean;",
                ),
        );
        expect(docsReferenceProblems(PAGES, sources)).toContain(
            "api/dialog: Trigger: react declares nativeButton, not documented",
        );
    });

    it("fails when a documented prop is renamed in one framework", () => {
        const sources = planted(
            "packages/angular/tabs/directives/tabs-root.directive.ts",
            (text) =>
                text.replace(
                    "readonly loopFocus = input(",
                    "readonly loop = input(",
                ),
        );
        const problems = docsReferenceProblems(PAGES, sources);
        expect(problems).toContain("api/tabs: Root: angular has no loopFocus");
        expect(problems).toContain(
            "api/tabs: Root: angular declares loop, not documented",
        );
    });

    it("fails when a Vue event drifts", () => {
        const sources = planted(
            "packages/vue/src/components/tabs/tabs-root.ts",
            (text) => text.replaceAll("valueChange: (", "change: ("),
        );
        const problems = docsReferenceProblems(PAGES, sources);
        expect(problems).toContain("api/tabs: Root: vue has no onValueChange");
        expect(problems).toContain(
            "api/tabs: Root: vue declares onChange, not documented",
        );
    });

    it("fails when a page documents a prop no framework has", () => {
        const pages = new Map(PAGES);
        pages.set(
            "api/tabs",
            (PAGES.get("api/tabs") ?? "").replace(
                "| `disabled` | `boolean` | `false` | focusable, never selected |",
                "| `disabled` | `boolean` | `false` | focusable, never selected |\n| `closable` | `boolean` | `false` | planted |",
            ),
        );
        expect(docsReferenceProblems(pages)).toContain(
            "api/tabs: Tab: react has no closable",
        );
    });
});
