import { Directive } from "@angular/core";

/** The trail, an ordered list (spec/breadcrumbs.md): `<ol breadcrumbsList>`. */
@Directive({
    selector: "ol[breadcrumbsList]",
    exportAs: "breadcrumbsList",
    host: {
        "data-primitives-part": "breadcrumbs-list",
    },
})
export class BreadcrumbsList {}
