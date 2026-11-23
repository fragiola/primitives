import { Directive } from "@angular/core";

/** The current page when it is no link, with `aria-current="page"` (spec/breadcrumbs.md): `<span breadcrumbsCurrent>`. */
@Directive({
    selector: "[breadcrumbsCurrent]",
    exportAs: "breadcrumbsCurrent",
    host: {
        "aria-current": "page",
        "data-primitives-part": "breadcrumbs-current",
    },
})
export class BreadcrumbsCurrent {}
