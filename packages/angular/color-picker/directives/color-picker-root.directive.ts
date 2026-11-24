import {
    afterNextRender,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    forwardRef,
    inject,
    input,
    output,
    PLATFORM_ID,
    untracked,
} from "@angular/core";
import {
    type Color,
    type ColorSpace,
    convertColor,
    formatColor,
    isSameColor,
    parseColor,
} from "@fragiola/primitives/color";
import { getTabbables } from "@fragiola/primitives/focus";
import { bridgeForm } from "@fragiola/primitives/form";
import {
    fieldControl,
    writeFieldAria,
} from "@fragiola/primitives-angular/field";
import {
    type ChangeDetails,
    COLOR_PICKER_BINDING,
    type ColorPickerBinding,
    controllable,
    dataValues,
    injectHost,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";

/** The picker's format: which channel controls the app shows (spec/color-picker.md, "The format"). */
export type ColorPickerFormat = "hex" | "rgb" | "hsl" | "hsb";

export const COLOR_PICKER_FORMATS: readonly ColorPickerFormat[] = [
    "hex",
    "rgb",
    "hsl",
    "hsb",
];

/** The state every ColorPicker part renders with. */
export interface ColorPickerState {
    /** The picker's color. */
    color: Color;
    format: ColorPickerFormat;
    disabled: boolean;
}

const BLACK: Color = { space: "rgb", red: 0, green: 0, blue: 0, alpha: 1 };

/** A `Color`, or a string `parseColor` reads (black when it reads none). */
function toColor(value: Color | string): Color {
    return parseColor(value) ?? BLACK;
}

/** The space a format edits in (`hex`: rgb). */
function formatSpace(format: ColorPickerFormat): ColorSpace {
    return format === "hex" ? "rgb" : format;
}

/**
 * Holds one color and shares it with the color controls inside it (spec/color-picker.md):
 * `<div colorPickerRoot [(value)]="color" name="color">`, a `group` with its format, its form value
 * as hex (a hidden input at its end) and its Field binding.
 */
@Directive({
    selector: "[colorPickerRoot]",
    exportAs: "colorPickerRoot",
    providers: [
        {
            provide: COLOR_PICKER_BINDING,
            useFactory: () => inject(forwardRef(() => ColorPickerRoot)).binding,
        },
    ],
    host: {
        role: "group",
        "data-primitives-part": "color-picker-root",
        "[style.--color-picker-color]": "css()",
        "[attr.data-invalid]": "field.data().invalid",
        "[attr.data-valid]": "field.data().valid",
        "[attr.data-dirty]": "field.data().dirty",
        "[attr.data-touched]": "field.data().touched",
        "[attr.data-filled]": "field.data().filled",
        "[attr.data-focused]": "field.data().focused",
        "[attr.data-format]": "data().format",
        "[attr.data-disabled]": "data().disabled",
        "(focusin)": "field.focused()",
        "(focusout)": "onFocusOut($event)",
    },
})
export class ColorPickerRoot {
    /** A `Color`, or a string `parseColor` reads; bound, the picker is controlled. */
    readonly value = input<Color | string | undefined>(undefined);
    readonly valueChange = output<Color>();
    readonly defaultValue = input<Color | string>("#000000");
    /** The color, as the control that changed it reports it, with the change's details. */
    readonly valueChangeDetails = output<ValueChangeEvent<Color>>();
    /** Once a control's change is complete (a drag ended, a key, a commit, a choice, a pick). */
    readonly valueCommit = output<Color>();
    /** The format (bound: controlled). */
    readonly format = input<ColorPickerFormat | undefined>(undefined);
    readonly formatChange = output<ColorPickerFormat>();
    readonly defaultFormat = input<ColorPickerFormat>("hex");
    readonly formatChangeDetails =
        output<ValueChangeEvent<ColorPickerFormat>>();
    /** Every control inside is disabled. */
    readonly disabled = input(false, { transform: booleanAttribute });
    readonly name = input<string | undefined>(undefined);

    /** The Root's element (the eyedropper's API is read on its window). */
    readonly host = injectHost();
    private readonly current = controllable<Color, ChangeDetails>(
        computed(() => {
            const value = this.value();
            return value === undefined ? undefined : toColor(value);
        }),
        this.valueChange,
        () => toColor(this.defaultValue()),
        (value, details) => this.valueChangeDetails.emit({ value, details }),
    );
    private readonly ownFormat = controllable<ColorPickerFormat, ChangeDetails>(
        this.format,
        this.formatChange,
        () => this.defaultFormat(),
        (value, details) => this.formatChangeDetails.emit({ value, details }),
    );
    /** The picker's color. */
    readonly color = this.current.value;
    /** The picker's format. */
    readonly currentFormat = this.ownFormat.value;
    private readonly hex = computed(() => formatColor(this.color(), "hex"));
    protected readonly css = computed(() => formatColor(this.color(), "css"));
    /** The hidden input, once created (in the browser). */
    private hidden: HTMLInputElement | null = null;
    /** The enclosing field's binding: the picker is the field's control (a `group`). */
    readonly field = fieldControl({
        id: computed(() => undefined),
        labelable: false,
        value: this.hex,
        // a picker always has a color
        filled: computed(() => true),
        input: () => this.hidden,
        element: () => this.host,
        focusTarget: () => getTabbables(this.host)[0] ?? null,
    });
    /** Its own `disabled`, or the field's. */
    readonly isDisabled = computed(
        () => this.disabled() || this.field.disabled(),
    );
    readonly state = computed<ColorPickerState>(() => ({
        color: this.color(),
        format: this.currentFormat(),
        disabled: this.isDisabled(),
    }));
    protected readonly data = computed(() =>
        dataValues({
            format: this.currentFormat(),
            disabled: this.isDisabled(),
        }),
    );
    /** What the controls inside read (spec/color-picker.md, "Sharing the color"). */
    readonly binding: ColorPickerBinding = {
        value: this.color,
        disabled: this.isDisabled,
        setValue: (color, details) => this.current.set(color, details),
        commit: (color) => this.valueCommit.emit(color),
    };

    constructor() {
        const host = this.host;
        writeFieldAria(this.field, host, {
            "aria-labelledby": this.field.labelledBy,
            "aria-describedby": this.field.describedBy,
            "aria-invalid": this.field.ariaInvalid,
        });
        // the `type="hidden"` input with the color as hex, after the consumer's children (as React
        // renders it); in the browser only (a server's would be a second one once hydrated)
        const browser = inject(PLATFORM_ID) === "browser";
        effect(() => {
            if (!browser) {
                return;
            }
            const hex = this.hex();
            const name = this.field.name() ?? this.name();
            const disabled = this.isDisabled();
            untracked(() => {
                if (this.hidden === null) {
                    const element = host.ownerDocument.createElement("input");
                    element.type = "hidden";
                    element.setAttribute(
                        "data-primitives-part",
                        "color-picker-input",
                    );
                    host.appendChild(element);
                    this.hidden = element;
                }
                const hidden = this.hidden;
                if (name === undefined) {
                    hidden.removeAttribute("name");
                } else {
                    hidden.name = name;
                }
                hidden.value = hex;
                hidden.disabled = disabled;
            });
        });
        // a form reset returns the picker to its default, and every bound control with it
        let stop: (() => void) | null = null;
        afterNextRender(() => {
            const hidden = this.hidden;
            if (hidden !== null) {
                stop = bridgeForm(hidden, {
                    reset: () => {
                        const next = toColor(untracked(this.defaultValue));
                        if (!isSameColor(next, untracked(this.color))) {
                            this.field.reset();
                            this.current.set(next, { reason: "none" });
                        }
                    },
                });
            }
        });
        inject(DestroyRef).onDestroy(() => {
            stop?.();
            this.hidden?.remove();
        });
    }

    /** The FormatSelect chose a format: it converts the value to the format's space. */
    setFormat(format: ColorPickerFormat, event: Event): void {
        const details = { reason: "input-change" as const, event };
        this.ownFormat.set(format, details);
        const now = untracked(this.color);
        const space = formatSpace(format);
        if (now.space !== space) {
            this.current.set(convertColor(now, space), details);
        }
    }

    /** The eyedropper picked a color: set in the value's space, its alpha kept, and committed. */
    pick(picked: Color, event: Event | undefined): void {
        const now = untracked(this.color);
        const next = convertColor({ ...picked, alpha: now.alpha }, now.space);
        this.current.set(next, { reason: "trigger-press", event });
        this.valueCommit.emit(next);
    }

    protected onFocusOut(event: FocusEvent): void {
        const next = event.relatedTarget;
        if (next instanceof Node && this.host.contains(next)) {
            return;
        }
        this.field.blurred();
    }
}
