import { defineConfig } from "tsdown";
import { ENTRIES, entrySource } from "../../scripts/components.ts";

export default defineConfig({
    // the root entry (it only re-exports), one entry per component
    // (`@fragiola/primitives-react/<component>`) and one per utility (`/direction`, `/render`,
    // scripts/components.ts)
    entry: {
        index: "src/index.ts",
        ...Object.fromEntries(
            ENTRIES.map((name) => [name, entrySource(name)]),
        ),
    },
    format: "esm",
    platform: "browser",
    dts: true,
    sourcemap: true,
    clean: true,
    // the toolkit (a dependency) and React (a peer) stay imports, tree-shaken by the app
    tsconfig: "tsconfig.build.json",
});
