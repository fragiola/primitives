import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import {
    defaultClientConditions,
    defaultServerConditions,
    defineConfig,
} from "vite";
import { withSourceCondition } from "../../scripts/source-condition.ts";

// The packages from their sources (the source export condition): the conformance suite tests the
// code as it is, with no package build first.
export default defineConfig({
    plugins: [vue(), tailwindcss()],
    resolve: { conditions: withSourceCondition(defaultClientConditions) },
    // conformance's ssr layer (`build:ssr`): the server entry bundles the workspace packages, from
    // their sources too; the framework stays external, as Node loads it
    ssr: {
        resolve: { conditions: withSourceCondition(defaultServerConditions) },
        noExternal: [/^@fragiola\//, "examples-shared"],
    },
    // the hydration mismatch details in a production build too (conformance's ssr layer)
    define: { __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "true" },
});
