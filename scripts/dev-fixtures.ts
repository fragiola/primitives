// `pnpm dev`: every fixture's dev server on its conformance port (conformance/src/implementations.ts),
// the packages from their sources with hot reload. `--framework vue,angular` starts a subset.
// Ctrl+C stops them all. (The POC's playground is not ported: docs/decisions.md.)
import { spawn } from "node:child_process";
import { join } from "node:path";
import { IMPLEMENTATIONS } from "../conformance/src/implementations.ts";

const root = join(import.meta.dirname, "..");

/** The frameworks `--framework a,b` names, or every one. */
export function selectedFrameworks(
    argv: readonly string[],
    all: readonly string[],
): string[] {
    const index = argv.indexOf("--framework");
    const value =
        index === -1
            ? argv.find((arg) => arg.startsWith("--framework="))?.split("=")[1]
            : argv[index + 1];
    if (value === undefined) {
        return [...all];
    }
    const names = value.split(",").map((name) => name.trim());
    const unknown = names.filter((name) => !all.includes(name));
    if (unknown.length > 0) {
        throw new Error(
            `unknown framework: ${unknown.join(", ")} (one of ${all.join(", ")})`,
        );
    }
    return names;
}

function main(): void {
    const names = selectedFrameworks(
        process.argv.slice(2),
        IMPLEMENTATIONS.map((implementation) => implementation.name),
    );
    const children = IMPLEMENTATIONS.filter((implementation) =>
        names.includes(implementation.name),
    ).map((implementation) => {
        console.log(
            `${implementation.name}: http://localhost:${implementation.port}`,
        );
        return spawn("pnpm", ["--filter", implementation.fixture, "dev"], {
            cwd: root,
            stdio: "inherit",
        });
    });
    const stop = () => {
        for (const child of children) child.kill("SIGTERM");
        process.exit(0);
    };
    process.on("SIGINT", stop);
    process.on("SIGTERM", stop);
}

if (import.meta.main) {
    main();
}
