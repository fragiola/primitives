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
    it("publishes nothing and triggers no www build", () => {
        expect(existsSync(join(root, ".github/workflows/release.yml"))).toBe(
            false,
        );
        expect(workflow()).not.toMatch(
            /npm publish|pnpm publish|changeset publish/,
        );
        expect(workflow()).not.toContain("repository_dispatch");
        expect(workflow()).not.toContain("WWW_DISPATCH_TOKEN");
        expect(workflow()).not.toContain("fragiola/www/dispatches");
    });
});
