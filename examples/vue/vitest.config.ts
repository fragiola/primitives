import { defineProject } from "vitest/config";

export default defineProject({
    test: {
        name: "examples-vue",
        environment: "node",
        include: ["tests/**/*.test.ts"],
    },
});
