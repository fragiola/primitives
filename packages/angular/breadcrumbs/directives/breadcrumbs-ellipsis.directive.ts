import { Directive } from "@angular/core";

/** The collapsed middle of the trail: a native button the app names and composes with a Menu's trigger on the same element (spec/breadcrumbs.md): `<button menuTrigger breadcrumbsEllipsis>`. */
@Directive({
    selector: "button[breadcrumbsEllipsis]",
    exportAs: "breadcrumbsEllipsis",
    host: {
        type: "button",
        "data-primitives-part": "breadcrumbs-ellipsis",
    },
})
export class BreadcrumbsEllipsis {}
