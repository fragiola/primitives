import { computed, Directive, effect, inject, input } from "@angular/core";
import {
    conditionalView,
    writeAttributes,
} from "@fragiola/primitives-angular/internal";
import { RadioRoot, radioAttributes } from "./radio-root.directive.ts";

/**
 * The dot, hidden from assistive technologies (spec/radio-group.md); structural, so it is rendered
 * only while its radio is checked: `<span *radioIndicator></span>`, or `*radioIndicator="true"` to
 * keep it in every state. Read the state through the radio (`#radio="radioRoot"`,
 * `radio.state().checked`). The directive writes its attributes on the element it renders.
 */
@Directive({ selector: "[radioIndicator]", exportAs: "radioIndicator" })
export class RadioIndicator {
    private readonly root = inject(RadioRoot);
    /** Rendered in every state, not only while checked. */
    readonly keepMounted = input(false, {
        alias: "radioIndicator",
        // `*radioIndicator` alone gives "": not kept
        transform: (value: unknown) => value === true || value === "true",
    });
    readonly state = computed(() => this.root.state());

    constructor() {
        const element = conditionalView(
            computed(() => this.keepMounted() || this.state().checked),
        );
        effect(() => {
            const rendered = element();
            if (rendered === null) {
                return;
            }
            writeAttributes(rendered, {
                "aria-hidden": "true",
                "data-primitives-part": "radio-indicator",
                ...Object.fromEntries(
                    Object.entries(radioAttributes(this.state())).map(
                        ([key, value]) => [`data-${key}`, value],
                    ),
                ),
            });
        });
    }
}
