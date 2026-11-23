import { Directive } from "@angular/core";

/** The `nav` landmark of the trail; the app names it (spec/breadcrumbs.md): `<nav breadcrumbsRoot aria-label="Breadcrumb">`. */
@Directive({
    selector: "nav[breadcrumbsRoot]",
    exportAs: "breadcrumbsRoot",
    host: {
        "data-primitives-part": "breadcrumbs-root",
    },
})
export class BreadcrumbsRoot {}
