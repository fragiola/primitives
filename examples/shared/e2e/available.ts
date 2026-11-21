// Adapted from Tree (fragiola/tree, examples/shared/e2e/available.ts), same author and licence.
//
// Which framework an e2e run tests, and which of its examples a spec may open. Free of
// Playwright, so the unit tests check it (tests/e2e-available.test.ts).
//
// One suite for every framework: each app's playwright.config.ts (`examplesE2eConfig`) sets
// `EXAMPLES_FRAMEWORK`. Every framework ships every example (the same ids, contract §5.3): a spec
// that opens an example the framework lacks fails, it is never skipped.

import { FRAMEWORKS, type Framework, isFramework } from "../src/framework.ts";

/** The framework of `EXAMPLES_FRAMEWORK`; anything else throws (a config that forgot to set it). */
export function frameworkOf(value: string | undefined): Framework {
    if (!isFramework(value)) {
        throw new Error(
            `EXAMPLES_FRAMEWORK must be one of ${FRAMEWORKS.join(", ")} (got ${JSON.stringify(value)}): run the suite through an app's playwright.config.ts`,
        );
    }
    return value;
}

/** Where the e2e server mounts a framework's embed, as `site:export --base /primitives` does. */
export function embedBase(framework: Framework): string {
    return `/primitives/embed/${framework}/`;
}

/** Why a test that needs `ids` cannot run in `framework`, or nothing when it can. */
export function missingReason(
    framework: Framework,
    available: readonly string[],
    ids: readonly string[],
): string | undefined {
    const missing = ids.filter((id) => !available.includes(id));
    return missing.length === 0
        ? undefined
        : `${framework} has no ${missing.join(", ")} example`;
}
