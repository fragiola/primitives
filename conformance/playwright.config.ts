// Adapted from the POC (conformance/playwright.config.ts).
import { join } from "node:path";
import { defineConfig, devices } from "@playwright/test";
import { IMPLEMENTATIONS, selectedProjects } from "./src/implementations.ts";

const root = join(import.meta.dirname, "..");
const selected = selectedProjects(process.argv);
// only the fixtures of the selected projects are built and served
const served = IMPLEMENTATIONS.filter(
    (implementation) =>
        selected.length === 0 || selected.includes(implementation.name),
);

export default defineConfig({
    testDir: "tests",
    testMatch: "**/*.test.ts",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [["list"], ["github"]] : "list",
    // One golden set for every framework: the path leaves out the project name, so Vue and
    // Angular compare against the screenshots React made (AGENTS.md rule 5).
    snapshotPathTemplate: "{testDir}/../snapshots/{testFileDir}/{arg}{ext}",
    expect: {
        toHaveScreenshot: { animations: "disabled", caret: "hide" },
    },
    use: {
        trace: "retain-on-failure",
    },
    projects: IMPLEMENTATIONS.map((implementation) => ({
        name: implementation.name,
        testMatch: implementation.layers.map((layer) => `**/${layer}.test.ts`),
        use: {
            ...devices["Desktop Chrome"],
            baseURL: `http://localhost:${implementation.port}`,
        },
    })),
    webServer: served.flatMap((implementation) => [
        {
            command: `pnpm --filter ${implementation.fixture} build && pnpm --filter ${implementation.fixture} preview --port ${implementation.port} --strictPort`,
            cwd: root,
            url: `http://localhost:${implementation.port}`,
            reuseExistingServer: !process.env.CI,
            timeout: 180_000,
        },
        // the ssr layer's server-rendered pages (src/ssr-server.ts). Its locale is German, so a
        // page whose locale falls back to the server's own would not match the browser's
        {
            command: `pnpm --filter ${implementation.fixture} build:ssr && node conformance/src/ssr-server.ts fixtures/${implementation.name} ${implementation.ssrPort}`,
            cwd: root,
            env: {
                LANG: "de_DE.UTF-8",
                LC_ALL: "de_DE.UTF-8",
                NODE_ENV: "production",
            },
            url: `http://localhost:${implementation.ssrPort}`,
            reuseExistingServer: !process.env.CI,
            timeout: 180_000,
        },
    ]),
});
