import { defineConfig } from "vitest/config";

// Every workspace with tests brings its own Vitest config, picked up by the globs: the packages,
// the fixtures, the examples apps (and what they share) and the site (the repository's own tests:
// scripts, CI guards, the site export).
export default defineConfig({
    test: {
        projects: ["packages/*", "fixtures/*", "examples/*", "site"],
    },
});
