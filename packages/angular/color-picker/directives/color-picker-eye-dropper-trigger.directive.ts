import {
    afterNextRender,
    computed,
    Directive,
    effect,
    inject,
    signal,
    untracked,
} from "@angular/core";
import { openEyeDropper, supportsEyeDropper } from "@fragiola/primitives/color";
import { conditionalView } from "@fragiola/primitives-angular/internal";
import {
    ColorPickerRoot,
    type ColorPickerState,
} from "./color-picker-root.directive.ts";

/**
 * Picks a color on screen with the browser's eyedropper (spec/color-picker.md,
 * "EyeDropperTrigger"); structural, rendered only once in the browser where `EyeDropper` exists:
 * `<button *colorPickerEyeDropperTrigger>Pick a color</button>`. The directive writes its
 * attributes on the element it renders.
 */
@Directive({
    selector: "[colorPickerEyeDropperTrigger]",
    exportAs: "colorPickerEyeDropperTrigger",
})
export class ColorPickerEyeDropperTrigger {
    private readonly root = inject(ColorPickerRoot);
    readonly state = computed<ColorPickerState>(() => this.root.state());
    // the API is the browser's: read after the first render, so the server render and hydration
    // match
    private readonly supported = signal(false);
    protected readonly element = conditionalView(this.supported, (element) => {
        element.setAttribute("type", "button");
        element.setAttribute(
            "data-primitives-part",
            "color-picker-eye-dropper-trigger",
        );
        element.addEventListener("click", (event) => {
            if (untracked(this.state).disabled) {
                return;
            }
            void openEyeDropper(element).then((picked) => {
                if (picked !== null) {
                    this.root.pick(picked, event);
                }
            });
        });
    });

    constructor() {
        afterNextRender(() =>
            this.supported.set(supportsEyeDropper(this.root.host)),
        );
        effect(() => {
            const element = this.element();
            const disabled = this.state().disabled;
            if (element === null) {
                return;
            }
            (element as HTMLButtonElement).disabled = disabled;
            if (disabled) {
                element.setAttribute("data-disabled", "");
            } else {
                element.removeAttribute("data-disabled");
            }
        });
    }
}
