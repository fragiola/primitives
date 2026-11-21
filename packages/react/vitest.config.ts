import { defaultClientConditions } from "vite";
import { defineProject } from "vitest/config";
import { withSourceCondition } from "../../scripts/source-condition.ts";

export default defineProject({
    // the toolkit from its sources (the source export condition), not its dist
    resolve: { conditions: withSourceCondition(defaultClientConditions) },
    test: {
        name: "react",
        environment: "jsdom",
        include: ["tests/**/*.test.{ts,tsx}"],
    },
});
