// Adapted from Tree (fragiola/tree, scripts/e2e-suites.ts, from fragiola/data-grid Epic #162), same
// author and licence. The E2E suites a change can affect: CI's `changes` job runs it and gives the
// E2E jobs its outputs. Only what is known to be safe skips a suite: the docs skip every suite, a
// framework's package (or its fixture, or its examples app) runs only that framework's suites, and
// any other path runs them all.
//
//   node scripts/e2e-suites.ts --diff <base>   the files changed between <base> and HEAD
//   node scripts/e2e-suites.ts --all           every suite (a manual run)
//   node scripts/e2e-suites.ts <file>…         the given files (to try the rules locally)
//
// It prints the selection and, in CI, writes `conformance` (a JSON array of the frameworks whose
// conformance project runs) and `examples` (a JSON array of the frameworks whose examples app
// runs) to `$GITHUB_OUTPUT`.
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");

/** The suites to run: the conformance projects and the examples apps, by framework. */
export interface E2eSuites {
    conformance: string[];
    examples: string[];
}

/** What the repository has: the frameworks with a fixture, and those with an examples app. */
export interface E2eFrameworks {
    conformance: readonly string[];
    examples: readonly string[];
}

/** What one changed path asks for: nothing, one framework's suites, or every suite. */
type Need = "none" | "all" | { framework: string };

/** The docs: no suite reads them. */
function isDocs(path: string): boolean {
    return (
        path.startsWith("site/docs/") ||
        path.endsWith(".md") ||
        path === "AGENTS.md"
    );
}

/**
 * What one changed path needs. A framework's package, fixture or examples app runs that
 * framework's conformance project and examples app. Everything else (the toolkit, the specs, the
 * conformance suite and its golden screenshots, examples/shared, the lockfile, the root configs,
 * .github, scripts, site) runs every suite.
 */
export function needOf(path: string, frameworks: E2eFrameworks): Need {
    if (isDocs(path)) {
        return "none";
    }
    const match = /^(packages|fixtures|examples)\/([^/]+)\//.exec(path);
    const framework = match?.[2];
    if (
        framework !== undefined &&
        (frameworks.conformance.includes(framework) ||
            frameworks.examples.includes(framework))
    ) {
        return { framework };
    }
    return "all";
}

/** The suites a set of changed paths runs, the frameworks in the order given. */
export function e2eSuites(
    paths: readonly string[],
    frameworks: E2eFrameworks,
): E2eSuites {
    const chosen = new Set<string>();
    for (const path of paths) {
        const need = needOf(path, frameworks);
        if (need === "all") {
            return allSuites(frameworks);
        }
        if (need !== "none") {
            chosen.add(need.framework);
        }
    }
    return {
        conformance: frameworks.conformance.filter((name) => chosen.has(name)),
        examples: frameworks.examples.filter((name) => chosen.has(name)),
    };
}

/** Every suite the repository has. */
export function allSuites(frameworks: E2eFrameworks): E2eSuites {
    return {
        conformance: [...frameworks.conformance],
        examples: [...frameworks.examples],
    };
}

function subfolders(dir: string, marker: string): string[] {
    if (!existsSync(join(root, dir))) {
        return [];
    }
    return readdirSync(join(root, dir))
        .filter((name) => existsSync(join(root, dir, name, marker)))
        .sort();
}

/**
 * The frameworks the repository tests: every `fixtures/<framework>` with a `package.json` (a
 * conformance project each, `conformance/src/implementations.ts`), and every
 * `examples/<framework>` with a `playwright.config.ts`.
 */
export function repositoryFrameworks(): E2eFrameworks {
    return {
        conformance: subfolders("fixtures", "package.json"),
        examples: subfolders("examples", "playwright.config.ts"),
    };
}

function changedPaths(base: string): string[] {
    return execFileSync("git", ["diff", "--name-only", base, "HEAD"], {
        cwd: root,
        encoding: "utf8",
    })
        .split("\n")
        .filter((path) => path !== "");
}

function main(args: readonly string[]): void {
    const frameworks = repositoryFrameworks();
    let suites: E2eSuites;
    if (args[0] === "--all") {
        suites = allSuites(frameworks);
    } else {
        const paths =
            args[0] === "--diff"
                ? changedPaths(args[1] ?? "HEAD^1")
                : [...args];
        console.log(
            `changed files (${paths.length}):\n  ${paths.join("\n  ")}`,
        );
        suites = e2eSuites(paths, frameworks);
    }
    const lines = [
        `conformance=${JSON.stringify(suites.conformance)}`,
        `examples=${JSON.stringify(suites.examples)}`,
    ];
    console.log(lines.join("\n"));
    if (process.env.GITHUB_OUTPUT) {
        appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join("\n")}\n`);
    }
}

// only when run, not when a test imports it (`import.meta.main` holds through a symlinked path)
if (import.meta.main) {
    main(process.argv.slice(2));
}
