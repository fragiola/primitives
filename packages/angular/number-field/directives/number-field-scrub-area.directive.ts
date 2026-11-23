import {
    afterRenderEffect,
    Directive,
    inject,
    input,
    numberAttribute,
} from "@angular/core";
import { watchScrub } from "@fragiola/primitives/number";
import { injectHost } from "@fragiola/primitives-angular/internal";
import { NumberFieldRoot } from "./number-field-root.directive.ts";

/**
 * A press dragged along it steps the value (spec/number-field.md, "Pointer": scrub):
 * `<span numberFieldScrubArea>` around a label or an icon, and the ScrubAreaCursor. Its
 * structural style keeps a touch drag from scrolling and its text from being selected.
 */
@Directive({
    selector: "[numberFieldScrubArea]",
    exportAs: "numberFieldScrubArea",
    host: {
        "data-primitives-part": "number-field-scrub-area",
        "[style.touch-action]": "'none'",
        "[style.user-select]": "'none'",
        "[attr.data-disabled]": "root.data().disabled",
        "[attr.data-readonly]": "root.data().readonly",
        "[attr.data-required]": "root.data().required",
        "[attr.data-scrubbing]": "root.data().scrubbing",
        "[attr.data-invalid]": "root.data().invalid",
        "[attr.data-valid]": "root.data().valid",
        "[attr.data-dirty]": "root.data().dirty",
        "[attr.data-touched]": "root.data().touched",
        "[attr.data-filled]": "root.data().filled",
        "[attr.data-focused]": "root.data().focused",
        "(mousedown)": "onMouseDown($event)",
    },
})
export class NumberFieldScrubArea {
    /** The axis the pointer scrubs along (default `"horizontal"`). */
    readonly direction = input<"horizontal" | "vertical">("horizontal");
    /** The pixels one step takes (default `2`). */
    readonly pixelSensitivity = input(2, { transform: numberAttribute });
    protected readonly root = inject(NumberFieldRoot);
    readonly state = this.root.state;

    constructor() {
        const host = injectHost();
        const root = this.root;
        // in the browser only, once rendered, again when its options change
        afterRenderEffect((onCleanup) => {
            const stop = watchScrub(host, {
                direction: this.direction(),
                pixelSensitivity: this.pixelSensitivity(),
                onStart: () => {
                    if (root.isDisabled() || root.readOnly()) {
                        return false;
                    }
                    root.scrubbing.set(true);
                    return true;
                },
                onScrub: (steps, event) => {
                    const amount = root.amount(event);
                    root.stepBy(
                        steps > 0 ? amount : -amount,
                        "scrub",
                        event,
                        Math.abs(steps),
                    );
                },
                onEnd: () => root.scrubbing.set(false),
                onCursor: (point) => root.cursor.set(point),
            });
            onCleanup(stop);
        });
    }

    protected onMouseDown(event: MouseEvent): void {
        // a press keeps the focus where it is
        if (event.button === 0) {
            event.preventDefault();
        }
    }
}
