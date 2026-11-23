import { Directive } from "@angular/core";

/** One step of the trail (spec/breadcrumbs.md): `<li breadcrumbsItem>`. */
@Directive({
    selector: "li[breadcrumbsItem]",
    exportAs: "breadcrumbsItem",
    host: {
        "data-primitives-part": "breadcrumbs-item",
    },
})
export class BreadcrumbsItem {}
