import { defineProject } from "vitest/config";

export default defineProject({
    test: {
        name: "examples-react",
        environment: "node",
        include: ["tests/**/*.test.ts"],
    },
});
