/**
 * Every framework the suite runs against: one Playwright project each (`pnpm conformance
 * --project <name>`). A framework registers here: its fixture package, a free port, and the layers
 * it must pass. CI runs one job per fixture (`scripts/e2e-suites.ts` lists `fixtures/*`;
 * site/tests/conformance.test.ts keeps both lists the same).
 */
export type Layer = "behaviour" | "contract" | "visual";

export interface Implementation {
    /** The Playwright project name, also the fixture's folder (`fixtures/<name>`). */
    name: string;
    /** The fixture's package name (`fixtures/<name>/package.json`). */
    fixture: string;
    port: number;
    layers: readonly Layer[];
}

export const IMPLEMENTATIONS: readonly Implementation[] = [
    // @fragiola/primitives-react: its screenshots are the golden set (made in CI only)
    {
        name: "react",
        fixture: "fixture-react",
        port: 5320,
        layers: ["behaviour", "contract", "visual"],
    },
    // @fragiola/primitives-vue: compares against React's golden screenshots
    {
        name: "vue",
        fixture: "fixture-vue",
        port: 5330,
        layers: ["behaviour", "contract", "visual"],
    },
    // @fragiola/primitives-angular: directives on the consumer's own elements
    {
        name: "angular",
        fixture: "fixture-angular",
        port: 5340,
        layers: ["behaviour", "contract", "visual"],
    },
];

/** The project names given with `--project` on the command line, if any. */
export function selectedProjects(argv: readonly string[]): string[] {
    const names: string[] = [];
    argv.forEach((arg, index) => {
        if (arg === "--project") {
            const next = argv[index + 1];
            if (next !== undefined) {
                names.push(next);
            }
        } else if (arg.startsWith("--project=")) {
            names.push(arg.slice("--project=".length));
        }
    });
    return names;
}
