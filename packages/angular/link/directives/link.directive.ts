import { booleanAttribute, computed, Directive, input } from "@angular/core";
import {
    dataValues,
    injectLinkPress,
} from "@fragiola/primitives-angular/internal";

export interface LinkState {
    disabled: boolean;
    current: boolean;
}

/**
 * A link with a disabled and a current state (spec/link.md): `<a link href="/docs">`, or on a
 * router's own anchor, `<a routerLink="/docs" link>`. A disabled link's press navigates nowhere:
 * its click stops in its capture phase, before the router's listener.
 */
@Directive({
    selector: "a[link]",
    exportAs: "link",
    host: {
        "data-primitives-part": "link-root",
        "[attr.aria-disabled]": "disabled() ? 'true' : null",
        "[attr.aria-current]": "current() ? 'page' : null",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-current]": "data().current",
    },
})
export class Link {
    /** The link is unavailable: `aria-disabled`, and its press navigates nowhere. */
    readonly disabled = input(false, { transform: booleanAttribute });
    /** It links to the page the app is on: `aria-current="page"`. */
    readonly current = input(false, { transform: booleanAttribute });
    readonly state = computed<LinkState>(() => ({
        disabled: this.disabled(),
        current: this.current(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));

    constructor() {
        injectLinkPress(this.disabled);
    }
}
