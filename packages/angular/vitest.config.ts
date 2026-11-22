import { defaultClientConditions } from "vite";
import { defineProject } from "vitest/config";
import { withSourceCondition } from "../../scripts/source-condition.ts";

// The package's pure internals and its utility entries, from their public specifiers; the
// directives themselves are covered by the conformance suite (an entry's directive classes are
// only declared here, their decorators compiled as TypeScript's legacy ones, never instantiated).
export default defineProject({
    resolve: { conditions: withSourceCondition(defaultClientConditions) },
    oxc: { decorator: { legacy: true } },
    test: {
        name: "angular",
        environment: "jsdom",
        include: ["tests/**/*.test.ts"],
    },
});
