import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import {
    builtSourceMaps,
    guardBuild,
} from "../../../scripts/bundle-guard-vite.ts";

// The bundle guard's app (scripts/check-bundle.ts): the packages from their built entries.
export default defineConfig({
    ...guardBuild(import.meta.dirname),
    plugins: [builtSourceMaps(), vue()],
});
