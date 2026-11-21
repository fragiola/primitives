import { defineProject } from "vitest/config";

export default defineProject({
    test: {
        name: "primitives",
        environment: "jsdom",
        include: ["tests/**/*.test.ts"],
    },
});
