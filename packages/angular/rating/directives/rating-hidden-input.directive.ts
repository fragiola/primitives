import {
    afterNextRender,
    computed,
    DestroyRef,
    Directive,
    inject,
    untracked,
} from "@angular/core";
import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import {
    injectEnclosing,
    injectHost,
} from "@fragiola/primitives-angular/internal";
import { RatingRoot, type RatingRootState } from "./rating-root.directive.ts";

/** The structural hidden style, as a `[style]` binding's dash-case properties. */
const HIDDEN_STYLE = Object.fromEntries(
    Object.entries(VISUALLY_HIDDEN_INPUT_STYLE).map(([name, value]) => [
        name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`),
        value,
    ]),
);

/** The value as the input's text: `"2.5"`, `""` for `0`. */
function valueText(value: number): string {
    return value > 0 ? String(value) : "";
}

/**
 * The Rating's form value (spec/rating.md, "Forms"): `<input ratingHiddenInput />` inside the
 * Root, a visually hidden input with the score as text, its `name` only while there is one,
 * validated by the browser.
 */
@Directive({
    selector: "input[ratingHiddenInput]",
    exportAs: "ratingHiddenInput",
    host: {
        "aria-hidden": "true",
        tabindex: "-1",
        "data-primitives-part": "rating-hidden-input",
        "[attr.name]": "state().value > 0 ? (rating.formName() ?? null) : null",
        // the attribute too, which a server writes for the property: the hydrated page keeps it
        "[attr.value]": "text()",
        "[value]": "text()",
        "[required]": "state().required",
        "[disabled]": "state().disabled",
        "[style]": "style",
    },
})
export class RatingHiddenInput {
    protected readonly rating = injectEnclosing(
        RatingRoot,
        "ratingRoot",
        "ratingHiddenInput",
    );
    readonly state = computed<RatingRootState>(() => this.rating.state());
    protected readonly text = computed(() => valueText(this.state().value));
    protected readonly style = HIDDEN_STYLE;

    constructor() {
        const host = injectHost<HTMLInputElement>();
        const rating = this.rating;
        rating.hiddenInput.set(host);
        let stop: (() => void) | null = null;
        afterNextRender(() => {
            stop = bridgeForm(host, {
                reset: () => {
                    rating.reset();
                    // the browser reset the input to its default: write the value back
                    host.value = valueText(untracked(rating.value));
                },
                invalid: () => rating.tabStopElement(),
            });
        });
        inject(DestroyRef).onDestroy(() => {
            stop?.();
            if (untracked(rating.hiddenInput) === host) {
                rating.hiddenInput.set(null);
            }
        });
    }
}
