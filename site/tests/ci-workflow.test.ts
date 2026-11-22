import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(import.meta.dirname, "../..");
const read = (path: string) => readFileSync(join(root, path), "utf8");
const workflow = () => read(".github/workflows/ci.yml");

/** Every workspace manifest: the root, the conformance suite, the site, every package and app. */
function manifests(): string[] {
    const dirs = [".", "conformance", "site"];
    for (const group of ["packages", "fixtures", "examples"]) {
        if (existsSync(join(root, group))) {
            for (const name of readdirSync(join(root, group))) {
                dirs.push(`${group}/${name}`);
            }
        }
    }
    return dirs
        .filter((dir) => existsSync(join(root, dir, "package.json")))
        .map((dir) => read(`${dir}/package.json`));
}

/** The `@playwright/test` versions the workspaces pin. */
function pinnedPlaywright(): Set<string> {
    const versions = new Set<string>();
    for (const manifest of manifests()) {
        const json = JSON.parse(manifest) as {
            dependencies?: Record<string, string>;
            devDependencies?: Record<string, string>;
        };
        const version =
            json.devDependencies?.["@playwright/test"] ??
            json.dependencies?.["@playwright/test"];
        if (version !== undefined) {
            versions.add(version);
        }
    }
    return versions;
}

// The Playwright jobs run in Playwright's image instead of installing the browsers (Fragiola
// guidelines, repository.md#ci): its browsers are the ones of its version, so the tag follows
// @playwright/test everywhere.
describe("the CI workflow", () => {
    it("runs the Playwright jobs in the image of the Playwright the workspaces pin", () => {
        const versions = pinnedPlaywright();
        expect(versions.size).toBeLessThanOrEqual(1);
        const images = [
            ...workflow().matchAll(
                /mcr\.microsoft\.com\/playwright:v([^\s"']+)-noble/g,
            ),
        ].map((match) => match[1]);
        expect(images.length).toBeGreaterThan(0);
        if (versions.size === 1) {
            expect(new Set(images)).toEqual(versions);
        }
    });

    it("pins @playwright/test to an exact version", () => {
        for (const version of pinnedPlaywright()) {
            expect(version).toMatch(/^\d+\.\d+\.\d+$/);
        }
    });

    it("installs no browser", () => {
        expect(workflow()).not.toContain("playwright install");
    });

    // Releasing waits for the maintainer to validate the library (AGENTS.md, "CI").
    it("publishes nothing", () => {
        expect(existsSync(join(root, ".github/workflows/release.yml"))).toBe(
            false,
        );
        expect(workflow()).not.toMatch(
            /npm publish|pnpm publish|changeset publish/,
        );
    });
});

/** The workflow's jobs, by id: the text of each job's block under `jobs:`. */
function jobs(): Map<string, string> {
    const body = workflow().split(/^jobs:\n/m)[1] ?? "";
    const blocks = new Map<string, string>();
    for (const block of body.split(/^(?= {2}[\w-]+:\s*$)/m)) {
        const id = /^ {2}([\w-]+):/.exec(block)?.[1];
        if (id !== undefined) {
            blocks.set(id, block);
        }
    }
    return blocks;
}

// A push to main asks fragiola/www to rebuild fragiola.com (guidelines, repository.md#ci and
// docs/site.md "sync"), and runs nothing else: main is what its pull request tested.
describe("the www trigger", () => {
    const pushToMain =
        "if: github.event_name == 'push' && github.ref == 'refs/heads/main'";

    it("runs the workflow on a push to main", () => {
        expect(workflow()).toMatch(
            /^on:\n(?: {2}.*\n)*? {2}push:\n {4}branches: \[main\]\n/m,
        );
    });

    it("has a Trigger www build job that runs only on a push to main", () => {
        const job = jobs().get("trigger-www-build");
        expect(job).toBeDefined();
        expect(job).toContain("name: Trigger www build");
        expect(job).toContain(pushToMain);
    });

    it("dispatches project-updated to fragiola/www, skipped without the secret", () => {
        const job = jobs().get("trigger-www-build") ?? "";
        expect(job).toContain("repos/fragiola/www/dispatches");
        expect(job).toContain("event_type=project-updated");
        expect(job).toContain("client_payload[slug]=primitives");
        expect(job).toContain("if: env.WWW_DISPATCH_TOKEN != ''");
    });

    it("reads only the WWW_DISPATCH_TOKEN secret, and only in the trigger", () => {
        const secrets = [...workflow().matchAll(/secrets\.(\w+)/g)].map(
            (match) => match[1],
        );
        expect(new Set(secrets)).toEqual(new Set(["WWW_DISPATCH_TOKEN"]));
        for (const [id, job] of jobs()) {
            if (id !== "trigger-www-build") {
                expect(job, id).not.toContain("WWW_DISPATCH_TOKEN");
                expect(job, id).not.toContain("fragiola/www/dispatches");
            }
        }
    });

    it("runs no other job on a push", () => {
        for (const [id, job] of jobs()) {
            if (id === "trigger-www-build") {
                continue;
            }
            // a job either skips push itself, runs only on pull requests, or needs one that does
            const guarded =
                job.includes("if: github.event_name != 'push'") ||
                job.includes("if: github.event_name == 'pull_request'") ||
                /needs: changes\n/.test(job);
            expect(guarded, id).toBe(true);
        }
        expect(jobs().get("changes")).toContain(
            "if: github.event_name != 'push'",
        );
    });
});
