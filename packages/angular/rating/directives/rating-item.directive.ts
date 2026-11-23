import {
    computed,
    Directive,
    effect,
    input,
    numberAttribute,
    untracked,
} from "@angular/core";
import { getDirection } from "@fragiola/primitives/direction";
import {
    fractionAlong,
    ratingItemState,
    ratingValueAt,
} from "@fragiola/primitives/range";
import {
    dataValues,
    injectEnclosing,
    injectHost,
} from "@fragiola/primitives-angular/internal";
import { RatingRoot } from "./rating-root.directive.ts";

/** A star's state (spec/rating.md, "API"). */
export interface RatingItemState {
    index: number;
    checked: boolean;
    highlighted: boolean;
    half: boolean;
    disabled: boolean;
    readOnly: boolean;
}

/**
 * A star: a `radio` of a `[ratingRoot]` (spec/rating.md): `<button ratingItem [index]="index"
 * #star="ratingItem">`, its mark the consumer's content, drawn from `star.state()` or the
 * `data-*` attributes.
 */
@Directive({
    selector: "[ratingItem]",
    exportAs: "ratingItem",
    host: {
        type: "button",
        role: "radio",
        "data-primitives-part": "rating-item",
        "[attr.disabled]": "data().disabled",
        "[attr.aria-checked]": "state().checked ? 'true' : 'false'",
        "[attr.tabindex]": "rating.tabStop() === index() ? 0 : -1",
        "[attr.data-checked]": "data().checked",
        "[attr.data-unchecked]": "data().unchecked",
        "[attr.data-highlighted]": "data().highlighted",
        "[attr.data-half]": "data().half",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-readonly]": "data().readonly",
        "(pointermove)": "onPointerMove($event)",
        "(click)": "onClick($event)",
        "(keydown)": "onKeyDown($event)",
        "(keyup)": "onKeyUp($event)",
    },
})
export class RatingItem {
    /** The star's number, `1` to `count`: its whole value. */
    readonly index = input.required({ transform: numberAttribute });

    protected readonly rating = injectEnclosing(
        RatingRoot,
        "ratingRoot",
        "ratingItem",
    );
    private readonly host = injectHost<HTMLButtonElement>();
    readonly state = computed<RatingItemState>(() => {
        const index = this.index();
        return {
            index,
            ...ratingItemState(
                index,
                this.rating.value(),
                this.rating.displayed(),
            ),
            disabled: this.rating.isDisabled(),
            readOnly: this.rating.readOnly(),
        };
    });
    protected readonly data = computed(() => {
        const state = this.state();
        return dataValues({
            checked: state.checked,
            unchecked: !state.checked,
            highlighted: state.highlighted,
            half: state.half,
            disabled: state.disabled,
            readonly: state.readOnly,
        });
    });

    constructor() {
        const host = this.host;
        const rating = this.rating;
        effect((onCleanup) => {
            const index = this.index();
            onCleanup(untracked(() => rating.registerItem(index, host)));
        });
    }

    /** The value under the pointer on the star (spec/rating.md, "Pointer"). */
    private valueAt(event: MouseEvent): number {
        const fraction = fractionAlong(
            this.host.getBoundingClientRect(),
            { x: event.clientX, y: event.clientY },
            "horizontal",
            getDirection(this.host) === "rtl",
        );
        return ratingValueAt(
            untracked(this.index),
            fraction,
            untracked(this.rating.allowHalf),
        );
    }

    protected onPointerMove(event: PointerEvent): void {
        // a mouse or a pen previews the value under it; a touch has no hover
        if (
            untracked(this.rating.interactive) &&
            event.pointerType !== "touch"
        ) {
            this.rating.preview(this.valueAt(event));
        }
    }

    protected onClick(event: MouseEvent): void {
        const rating = this.rating;
        if (!untracked(rating.interactive)) {
            return;
        }
        this.host.focus();
        // a click with no pointer (a label's, a script's) chooses the whole star
        const next =
            event.detail === 0 ? untracked(this.index) : this.valueAt(event);
        if (next !== untracked(rating.value)) {
            rating.choose(next, "item-press", event);
        } else if (untracked(rating.allowClear)) {
            rating.choose(0, "item-press", event);
        }
    }

    protected onKeyDown(event: KeyboardEvent): void {
        // a native radio does not check on Enter (a button would click)
        if (event.key === "Enter") {
            event.preventDefault();
            return;
        }
        if (event.key === " ") {
            // Space is a key, not a press: its click on key up is prevented
            event.preventDefault();
        }
        if (this.rating.keyDown(event.key, untracked(this.index), event)) {
            event.preventDefault();
        }
    }

    protected onKeyUp(event: KeyboardEvent): void {
        if (event.key === " ") {
            event.preventDefault();
        }
    }
}
