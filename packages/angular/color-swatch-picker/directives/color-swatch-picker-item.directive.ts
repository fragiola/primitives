import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    input,
    untracked,
} from "@angular/core";
import {
    type Color,
    formatColor,
    parseColor,
} from "@fragiola/primitives/color";
import {
    dataValues,
    injectEnclosing,
    injectHost,
    injectId,
} from "@fragiola/primitives-angular/internal";
import { ColorSwatchPickerRoot } from "./color-swatch-picker-root.directive.ts";

export interface ColorSwatchPickerItemState {
    color: Color;
    selected: boolean;
    highlighted: boolean;
    disabled: boolean;
}

const BLACK: Color = { space: "rgb", red: 0, green: 0, blue: 0, alpha: 1 };

/**
 * An `option` of the palette, focusable with a roving `tabindex` (spec/color-swatch-picker.md):
 * `<div colorSwatchPickerItem value="#ff0000">` holding a `[colorSwatch]`.
 */
@Directive({
    selector: "[colorSwatchPickerItem]",
    exportAs: "colorSwatchPickerItem",
    host: {
        role: "option",
        "data-primitives-part": "color-swatch-picker-item",
        "[attr.id]": "itemId",
        "[attr.tabindex]": "tabIndex()",
        "[attr.aria-selected]": "state().selected ? 'true' : 'false'",
        "[attr.aria-disabled]": "state().disabled ? 'true' : null",
        "[attr.data-selected]": "data().selected",
        "[attr.data-highlighted]": "data().highlighted",
        "[attr.data-disabled]": "data().disabled",
        "[style.--color-swatch-picker-item-color]": "css()",
        "(focus)": "root.focused(host)",
        "(click)": "root.press(host, $event)",
    },
})
export class ColorSwatchPickerItem {
    /** The color it selects. */
    readonly value = input.required<Color | string>();
    /** Takes focus, never the selection. */
    readonly disabled = input(false, { transform: booleanAttribute });

    protected readonly root = injectEnclosing(
        ColorSwatchPickerRoot,
        "colorSwatchPickerRoot",
        "colorSwatchPickerItem",
    );
    protected readonly host = injectHost();
    protected readonly itemId = injectId("primitives-color-swatch-picker-item");
    private readonly color = computed(() => parseColor(this.value()) ?? BLACK);
    private readonly key = computed(() => formatColor(this.color(), "hexa"));
    protected readonly css = computed(() => formatColor(this.color(), "css"));
    readonly state = computed<ColorSwatchPickerItemState>(() => ({
        color: this.color(),
        selected: this.root.selected() === this.key(),
        highlighted: this.root.highlighted() === this.host,
        disabled: this.disabled() || this.root.isDisabled(),
    }));
    protected readonly data = computed(() =>
        dataValues({
            selected: this.state().selected,
            highlighted: this.state().highlighted,
            disabled: this.state().disabled,
        }),
    );
    /** A disabled list's options take no focus at all; before the items are known, `-1`. */
    protected readonly tabIndex = computed(() => {
        if (this.root.isDisabled()) {
            return null;
        }
        return this.root.tabStop() === this.host ? 0 : -1;
    });

    constructor() {
        const host = this.host;
        const root = this.root;
        effect((onCleanup) => {
            const entry = {
                element: host,
                key: this.key(),
                color: this.color(),
                disabled: this.disabled(),
            };
            onCleanup(untracked(() => root.register(entry)));
        });
    }
}
