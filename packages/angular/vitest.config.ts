import { defaultClientConditions } from "vite";
import { defineProject } from "vitest/config";
import { withSourceCondition } from "../../scripts/source-condition.ts";

// The package's pure internals and its utility entries, from their public specifiers; the
// directives themselves are covered by the conformance suite (an entry's directive classes are
// declared here, their decorators compiled as TypeScript's legacy ones). A test that renders them
// compiles them at run time (JIT, `tests/field-form.test.ts`) and declares the signal inputs it
// binds.
export default defineProject({
    resolve: { conditions: withSourceCondition(defaultClientConditions) },
    oxc: { decorator: { legacy: true } },
    test: {
        name: "angular",
        environment: "jsdom",
        include: ["tests/**/*.test.ts"],
    },
});
