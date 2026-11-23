// Adapted from Tree (fragiola/tree, site/tests/contract.test.ts), same author and licence.
import { beforeAll, describe, expect, it } from "vitest";
import {
    CATEGORIES,
    CATEGORY_TITLES,
} from "../../examples/shared/src/meta-types.ts";
import { THEMES } from "../../examples/shared/src/themes/themes.ts";
import {
    CONTRACT_VERSION,
    frontmatter,
    LIMITS,
    type Site,
    validateSite,
} from "../contract.ts";
import { readExamplesSource, readSite } from "../sources.ts";

// The export is checked in memory against the site export contract (fragiola/www CONTRACT.md,
// v1.7) as www checks it, and against what this project decided for its own pages
// (guidelines docs/site.md, "A native-primitives library", and the landing's rules).

let site: Site;
beforeAll(async () => {
    site = await readSite();
});

/** The site with one page replaced (or added). */
const withPage = (path: string, source: string): Site => ({
    ...site,
    pages: new Map([...site.pages, [path, source]]),
});

const PAGE = (body: string) =>
    `---\ntitle: A page\ndescription: A page that exists only in this test, long enough to be a valid description.\n---\n\n${body}\n`;

describe("the site export", () => {
    it("implements contract v1.7", () => {
        expect(CONTRACT_VERSION).toBe("1.7");
    });

    it("passes its own validation", () => {
        expect(validateSite(site)).toEqual([]);
    });

    it("fails on what www rejects", () => {
        const cases: [string, RegExp][] = [
            ["See [x](/docs/nope).", /no page \/docs\/nope/],
            ["See [x](/ai/docs/mcp).", /nothing below it/],
            ["See [x](../api/dialog.mdx).", /relative link/],
            ["See [x](/examples/nope).", /no example "nope"/],
            ["# A heading", /#/],
            ['<Example id="nope" />', /is not an example/],
            ['<Hero title="x" />', /landing only/],
            ['<InstallCommand item="dialog" />', /is not in r\//],
            ["<Unknown />", /not in the v1.1 vocabulary/],
        ];
        for (const [body, problem] of cases) {
            const problems = validateSite(withPage("api/dialog", PAGE(body)));
            expect(problems.join("\n"), body).toMatch(problem);
        }
    });

    it("accepts the reserved /ai link, with an anchor", () => {
        const problems = validateSite(
            withPage(
                "api/dialog",
                PAGE(
                    "## Agents\n\nSee [the agent](/ai) and [its setup](/ai#set-it-up).",
                ),
            ),
        );
        expect(problems).toEqual([]);
    });
});

describe("project.json", () => {
    it("declares the project", () => {
        const { project } = site;
        expect(project).toMatchObject({
            contract: 1,
            slug: "primitives",
            title: "Primitives",
            frameworks: ["react", "vue", "angular"],
            defaultFramework: "react",
            repository: "https://github.com/fragiola/primitives",
        });
        const length = [...project.description].length;
        expect(length).toBeGreaterThanOrEqual(LIMITS.description.min);
        expect(length).toBeLessThanOrEqual(LIMITS.description.max);
        expect(project.keywords?.length).toBeGreaterThanOrEqual(1);
        expect(project.keywords?.length).toBeLessThanOrEqual(8);
        for (const keyword of project.keywords ?? []) {
            expect(keyword).toBe(keyword.toLowerCase());
        }
        // nothing this project does not ship
        expect(project.registry).toBeUndefined();
        expect("create" in project).toBe(false);
    });
});

describe("examples.json", () => {
    it("lists the categories of examples/shared as its levels", () => {
        expect(readExamplesSource().levels).toEqual(
            CATEGORIES.map((id) => ({ id, title: CATEGORY_TITLES[id] })),
        );
    });

    it("offers the five themes, in order, with their CSS", () => {
        expect(readExamplesSource().themes).toEqual([
            "light",
            "dark",
            "ide",
            "paper",
            "terminal",
        ]);
        expect(site.examples.themes.map((theme) => theme.name)).toEqual(
            THEMES.map((theme) => theme.name),
        );
        for (const theme of site.examples.themes) {
            expect(theme.file?.path).toBe(`_themes/${theme.name}.css`);
            expect(theme.file?.content).toContain(
                `[data-example-theme="${theme.name}"]`,
            );
        }
    });
});

describe("the landing", () => {
    const landing = () => site.pages.get("index") ?? "";
    const body = () => landing().replace(/^---[\s\S]*?\n---\n/, "");

    it("is titled after the project, in at most 60 characters", () => {
        const fields = frontmatter(landing());
        expect(fields.layout).toBe("landing");
        expect(fields.title?.startsWith("Primitives — ")).toBe(true);
        expect([...(fields.title ?? "")].length).toBeLessThanOrEqual(60);
    });

    it("has one Hero whose actions go examples, the agent (/ai), then the docs", () => {
        expect(body().match(/<Hero\b/g)).toHaveLength(1);
        const hrefs = [
            ...(/<Hero[\s\S]*?\/>/.exec(body())?.[0] ?? "").matchAll(
                /href: "([^"]+)"/g,
            ),
        ].map((match) => match[1]);
        expect(hrefs).toHaveLength(3);
        expect(hrefs[0]).toBe("/examples");
        expect(hrefs[1]).toBe("/ai");
        expect(hrefs[2]).toMatch(/^\/docs\//);
        expect(body()).toContain('{ label: "Set up your agent", href: "/ai"');
    });

    it("shows a top-level showcase example right after the Hero", () => {
        const afterHero =
            body()
                .split(/<Hero[\s\S]*?\/>/)[1]
                ?.trimStart() ?? "";
        expect(afterHero).toMatch(/^<Example\b[^>]*variant="showcase"/);
    });
});

describe("the sidebar", () => {
    it("follows the native-primitives IA (guidelines docs/site.md)", () => {
        const sections = site.config.sections.map((section) => section.label);
        expect(sections).toEqual([
            "Getting started",
            "Concepts",
            "Guides",
            "API: components",
            "API: utilities",
            "API: DOM toolkit (@fragiola/primitives)",
            "More",
        ]);
        const paths = site.config.sections.flatMap((section) =>
            section.pages.map((page) =>
                "path" in page ? page.path : page.href,
            ),
        );
        expect(paths).toEqual([
            "getting-started/introduction",
            "getting-started/installation",
            "getting-started/first-component",
            "concepts/native-primitives",
            "concepts/primitive-contract",
            "concepts/attributes",
            "concepts/tree-shaking",
            "concepts/behaviour-rule",
            "guides/forms",
            "guides/rtl",
            "guides/composition",
            "guides/detached-triggers",
            "guides/nested-overlays",
            "api/dialog",
            "api/alert-dialog",
            "api/drawer",
            "api/popover",
            "api/tooltip",
            "api/menu",
            "api/context-menu",
            "api/menubar",
            "api/navigation-menu",
            "api/tabs",
            "api/collapsible",
            "api/accordion",
            "api/field",
            "api/fieldset",
            "api/form",
            "api/label",
            "api/button",
            "api/toggle",
            "api/toggle-group",
            "api/toolbar",
            "api/checkbox",
            "api/checkbox-group",
            "api/radio-group",
            "api/radio",
            "api/switch",
            "api/slider",
            "api/number-field",
            "api/otp-field",
            "api/select",
            "api/combobox",
            "api/autocomplete",
            "api/listbox",
            "api/calendar",
            "api/range-calendar",
            "api/date-picker",
            "api/date-range-picker",
            "api/progress",
            "api/meter",
            "api/avatar",
            "api/separator",
            "api/direction",
            "api/render",
            "api/toolkit",
            "server-rendering",
            "limitations",
            "https://github.com/fragiola/primitives/issues",
        ]);
    });

    it("gives every component an API page with the decided sections", () => {
        for (const path of [
            "api/dialog",
            "api/alert-dialog",
            "api/drawer",
            "api/popover",
            "api/tooltip",
            "api/menu",
            "api/context-menu",
            "api/menubar",
            "api/navigation-menu",
            "api/tabs",
            "api/collapsible",
            "api/accordion",
            "api/field",
            "api/fieldset",
            "api/form",
            "api/toggle",
            "api/toggle-group",
            "api/toolbar",
            "api/checkbox",
            "api/checkbox-group",
            "api/slider",
            "api/number-field",
            "api/otp-field",
            "api/select",
            "api/combobox",
            "api/autocomplete",
            "api/listbox",
            "api/calendar",
            "api/range-calendar",
            "api/date-picker",
            "api/date-range-picker",
        ]) {
            const page = site.pages.get(path) ?? "";
            const headings = [...page.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
            expect(headings, path).toEqual([
                "Behaviour",
                "Anatomy",
                "Usage",
                "Props",
                "State and part attributes",
                "Keyboard",
                "Exports",
            ]);
            // every component follows an APG pattern but the Field layer and OTPField, which have
            // none (Base UI's Field, Fieldset, Form and OTP Field)
            if (
                ![
                    "api/field",
                    "api/fieldset",
                    "api/form",
                    "api/otp-field",
                ].includes(path)
            ) {
                expect(page, path).toMatch(
                    /https:\/\/www\.w3\.org\/WAI\/ARIA\/apg\/patterns\//,
                );
            }
            for (const framework of site.project.frameworks) {
                expect(page, path).toContain(`<Framework name="${framework}">`);
            }
        }
    });

    it("installs each framework's package on the installation page", () => {
        const page = site.pages.get("getting-started/installation") ?? "";
        for (const framework of site.project.frameworks) {
            expect(page).toContain(`<Framework name="${framework}">`);
            expect(page).toContain(
                `pnpm add @fragiola/primitives-${framework}`,
            );
        }
    });
});
