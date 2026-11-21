import { defineConfig } from "tsdown";
import { MECHANISMS } from "../../scripts/components.ts";

export default defineConfig({
    // the root entry (it only re-exports) and one entry per mechanism
    // (`@fragiola/primitives/<mechanism>`): a component imports only the mechanisms it uses
    entry: {
        index: "src/index.ts",
        ...Object.fromEntries(
            MECHANISMS.map((name) => [name, `src/${name}/index.ts`]),
        ),
    },
    format: "esm",
    platform: "browser",
    dts: true,
    sourcemap: true,
    clean: true,
    // the declarations are built from src only (tsconfig.json also takes in the tests)
    tsconfig: "tsconfig.build.json",
});
