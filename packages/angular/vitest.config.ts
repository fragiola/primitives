import { defaultClientConditions } from "vite";
import { defineProject } from "vitest/config";
import { withSourceCondition } from "../../scripts/source-condition.ts";

// The package's pure internals; the directives themselves are covered by the conformance suite.
export default defineProject({
    resolve: { conditions: withSourceCondition(defaultClientConditions) },
    test: {
        name: "angular",
        environment: "jsdom",
        include: ["tests/**/*.test.ts"],
    },
});
