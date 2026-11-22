/** The scenario's query parameters (spec/README.md, "Scenarios and fixtures"). */
export interface ScenarioQuery {
    /** The `locale` the scenario passes; `?locale=none` passes none (and leaves no `lang`). */
    locale: string | undefined;
    /** The document's `lang`: the locale, none with `?locale=none`. */
    lang: string | undefined;
    dir: "ltr" | "rtl";
}

export function readQuery(search: string): ScenarioQuery {
    const params = new URLSearchParams(search);
    const locale = params.get("locale") ?? "en-US";
    return {
        locale: locale === "none" ? undefined : locale,
        lang: locale === "none" ? undefined : locale,
        dir: params.get("dir") === "rtl" ? "rtl" : "ltr",
    };
}
