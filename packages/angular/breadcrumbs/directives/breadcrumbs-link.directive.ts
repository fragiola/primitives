import { booleanAttribute, computed, Directive, input } from "@angular/core";
import {
    dataValues,
    injectLinkPress,
} from "@fragiola/primitives-angular/internal";

export interface BreadcrumbsLinkState {
    disabled: boolean;
    current: boolean;
}

/**
 * A parent page of the trail (spec/breadcrumbs.md): `<a breadcrumbsLink href="/docs">`, or on a
 * router's anchor; Link's behaviour (spec/link.md), through the package's shared code.
 */
@Directive({
    selector: "a[breadcrumbsLink]",
    exportAs: "breadcrumbsLink",
    host: {
        "data-primitives-part": "breadcrumbs-link",
        "[attr.aria-disabled]": "disabled() ? 'true' : null",
        "[attr.aria-current]": "current() ? 'page' : null",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-current]": "data().current",
    },
})
export class BreadcrumbsLink {
    /** It links to the current page: `aria-current="page"`. */
    readonly current = input(false, { transform: booleanAttribute });
    /** The link is unavailable, as Link's (spec/link.md). */
    readonly disabled = input(false, { transform: booleanAttribute });
    readonly state = computed<BreadcrumbsLinkState>(() => ({
        disabled: this.disabled(),
        current: this.current(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));

    constructor() {
        injectLinkPress(this.disabled);
    }
}
