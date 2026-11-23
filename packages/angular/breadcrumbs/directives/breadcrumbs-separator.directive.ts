import { Directive } from "@angular/core";

/** Between two Items: a list item hidden from assistive technology, its children the app's (spec/breadcrumbs.md): `<li breadcrumbsSeparator>/</li>`. */
@Directive({
    selector: "li[breadcrumbsSeparator]",
    exportAs: "breadcrumbsSeparator",
    host: {
        "aria-hidden": "true",
        "data-primitives-part": "breadcrumbs-separator",
    },
})
export class BreadcrumbsSeparator {}
