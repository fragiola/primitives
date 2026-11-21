import { defineConfig } from "tsdown";
import { COMPONENTS } from "../../scripts/components.ts";

export default defineConfig({
    // the root entry (it only re-exports) and one entry per component
    // (`@fragiola/primitives-vue/<component>`, scripts/components.ts)
    entry: {
        index: "src/index.ts",
        ...Object.fromEntries(
            COMPONENTS.map((name) => [name, `src/components/${name}/index.ts`]),
        ),
    },
    format: "esm",
    platform: "browser",
    dts: true,
    sourcemap: true,
    clean: true,
    // the toolkit (a dependency) and Vue (a peer) stay imports, tree-shaken by the app
    tsconfig: "tsconfig.build.json",
});
