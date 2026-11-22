import {
    afterNextRender,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    input,
    output,
    PLATFORM_ID,
    signal,
    untracked,
} from "@angular/core";
import { bridgeForm } from "@fragiola/primitives/form";
import { moveThumb } from "@fragiola/primitives/range";
import { fieldControl } from "@fragiola/primitives-angular/field";
import {
    type ChangeDetails,
    type ChangeReason,
    controllable,
    dataValues,
    injectHost,
    injectProvidedDirection,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
import { writeLabelledBy } from "../utils/write-labelled-by.ts";

/** A number, or an array of numbers for several thumbs. */
export type SliderRootValue = number | readonly number[];

/** The state every slider part shares. */
export interface SliderState {
    orientation: "horizontal" | "vertical";
    disabled: boolean;
    dragging: boolean;
}

function toArray(value: SliderRootValue): readonly number[] {
    return typeof value === "number" ? [value] : value;
}

function sameValues(a: readonly number[], b: readonly number[]): boolean {
    return (
        a.length === b.length && a.every((entry, index) => entry === b[index])
    );
}

/**
 * Holds the slider's values; the `group` with one hidden input per value at its end
 * (spec/slider.md): `<div sliderRoot [(value)]="volume" name="volume">`. `format` and `locale`
 * format the Value and each Thumb's `aria-valuetext` (`Intl.NumberFormat`); a `[sliderLabel]`
 * names the group and its Thumbs.
 */
@Directive({
    selector: "[sliderRoot]",
    exportAs: "sliderRoot",
    host: {
        role: "group",
        "data-primitives-part": "slider-root",
        "[attr.data-invalid]": "field.data().invalid",
        "[attr.data-valid]": "field.data().valid",
        "[attr.data-dirty]": "field.data().dirty",
        "[attr.data-touched]": "field.data().touched",
        "[attr.data-filled]": "field.data().filled",
        "[attr.data-focused]": "field.data().focused",
        "[attr.data-orientation]": "data().orientation",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-dragging]": "data().dragging",
    },
})
export class SliderRoot {
    readonly value = input<SliderRootValue | undefined>(undefined);
    readonly valueChange = output<SliderRootValue>();
    readonly defaultValue = input<SliderRootValue | undefined>(undefined);
    readonly valueChangeDetails = output<ValueChangeEvent<SliderRootValue>>();
    /** When a drag ends, or after a key changed the value. */
    readonly valueCommit = output<SliderRootValue>();
    readonly min = input(0);
    readonly max = input(100);
    readonly step = input(1);
    readonly largeStep = input(10);
    readonly minStepsBetweenValues = input(0);
    readonly orientation = input<"horizontal" | "vertical">("horizontal");
    readonly disabled = input(false, { transform: booleanAttribute });
    readonly name = input<string | undefined>(undefined);
    /** How the Value and the Thumbs' `aria-valuetext` show the values (`Intl.NumberFormatOptions`). */
    readonly format = input<Intl.NumberFormatOptions | undefined>(undefined);
    /** The locale of `format` (BCP 47; default: the runtime's). */
    readonly locale = input<string | undefined>(undefined);

    private readonly range = computed(() =>
        Array.isArray(this.value() ?? this.defaultValue()),
    );
    private readonly current = controllable<readonly number[], ChangeDetails>(
        computed(() => {
            const value = this.value();
            return value === undefined ? undefined : toArray(value);
        }),
        { emit: (next) => this.valueChange.emit(this.shape(next)) },
        () => toArray(this.defaultValue() ?? this.min()),
        (next, details) =>
            this.valueChangeDetails.emit({ value: this.shape(next), details }),
    );
    readonly values = this.current.value;
    /** One hidden input per value, in order. */
    private readonly inputs: HTMLInputElement[] = [];
    /** The enclosing field's binding, for the root and the thumbs (spec/field.md). */
    readonly field = fieldControl({
        id: signal(undefined),
        labelable: false,
        value: computed(() => {
            const values = this.values();
            return this.range() ? [...values] : (values[0] ?? 0);
        }),
        // a slider always has a value
        filled: signal(true),
        input: () => this.inputs[0] ?? null,
        focusTarget: () => untracked(this.thumbs)[0] ?? null,
    });
    /** Its own `disabled`, or the field's. */
    readonly isDisabled = computed(
        () => this.disabled() || this.field.disabled(),
    );
    readonly dragging = signal(false);
    /** The thumb a pointer drags (or last pressed), else -1. */
    readonly activeIndex = signal(-1);
    /** The thumbs, in document order: the default `index`, and the one to focus. */
    readonly thumbs = signal<readonly HTMLElement[]>([]);
    /** Each thumb's id by its value's index: the Value's `for`. */
    readonly thumbIds = signal<Readonly<Record<number, string>>>({});
    /** The Label's id while one is rendered. */
    readonly labelId = signal<string | undefined>(undefined);
    /** A DirectionProvider's direction, else `null` (the computed one is read). */
    readonly providedDirection = injectProvidedDirection();
    private readonly formatter = computed(() => {
        const format = this.format();
        return format === undefined
            ? null
            : new Intl.NumberFormat(this.locale(), format);
    });
    /** The values as the Value shows them: formatted with `format`, else the plain numbers. */
    readonly formattedValues = computed(() => {
        const formatter = this.formatter();
        return this.values().map(
            (value) => formatter?.format(value) ?? String(value),
        );
    });
    readonly state = computed<SliderState>(() => ({
        orientation: this.orientation(),
        disabled: this.isDisabled(),
        dragging: this.dragging(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));

    constructor() {
        const host = injectHost();
        writeLabelledBy(host, [this.field.labelledBy, this.labelId]);
        // one `type="hidden"` input per value, after the consumer's children (as React renders);
        // in the browser only, as the other hidden inputs (a server's would be a second set once
        // the page is hydrated)
        const inputs = this.inputs;
        const browser = inject(PLATFORM_ID) === "browser";
        effect(() => {
            if (!browser) {
                return;
            }
            const values = this.values();
            const name = this.field.name() ?? this.name();
            untracked(() => {
                while (inputs.length > values.length) {
                    inputs.pop()?.remove();
                }
                while (inputs.length < values.length) {
                    const input = host.ownerDocument.createElement("input");
                    input.type = "hidden";
                    input.setAttribute("data-primitives-part", "slider-input");
                    host.appendChild(input);
                    inputs.push(input);
                }
                values.forEach((value, index) => {
                    const input = inputs[index] as HTMLInputElement;
                    input.value = String(value);
                    if (name === undefined) {
                        input.removeAttribute("name");
                    } else {
                        input.name = name;
                    }
                });
            });
        });
        // a form reset: back to the default (spec/README.md, "Forms")
        let stop: (() => void) | null = null;
        afterNextRender(() => {
            const first = inputs[0];
            if (first !== undefined) {
                stop = bridgeForm(first, {
                    reset: () => {
                        const initial = toArray(
                            this.defaultValue() ?? this.min(),
                        );
                        // no change reported when the slider already is at its default
                        if (!sameValues(initial, untracked(this.values))) {
                            this.field.reset();
                            this.current.set(initial, { reason: "none" });
                        }
                    },
                });
            }
        });
        inject(DestroyRef).onDestroy(() => stop?.());
    }

    /** The formatted value for `aria-valuetext`, only with `format` (else none of its own). */
    valueText(value: number): string | null {
        const formatter = this.formatter();
        return formatter === null ? null : formatter.format(value);
    }

    private shape(values: readonly number[]): SliderRootValue {
        return untracked(this.range) ? [...values] : (values[0] ?? 0);
    }

    /** Moves thumb `index` to `value` (snapped, within its bounds), reports it, returns the values. */
    setThumb(
        index: number,
        value: number,
        reason: ChangeReason,
    ): readonly number[] {
        const before = untracked(this.values);
        const next = moveThumb(before, index, value, {
            min: this.min(),
            max: this.max(),
            step: this.step(),
            minStepsBetweenValues: this.minStepsBetweenValues(),
        });
        if (!sameValues(next, before)) {
            this.current.set(next, { reason });
        }
        return next;
    }

    /** Reports the values (default: the current ones) as committed. */
    commit(values?: readonly number[]): void {
        this.valueCommit.emit(this.shape(values ?? untracked(this.values)));
    }

    registerThumb(element: HTMLElement): () => void {
        this.thumbs.update((list) =>
            [...list.filter((entry) => entry !== element), element].sort(
                (a, b) =>
                    a.compareDocumentPosition(b) &
                    Node.DOCUMENT_POSITION_FOLLOWING
                        ? -1
                        : 1,
            ),
        );
        return () =>
            this.thumbs.update((list) =>
                list.filter((entry) => entry !== element),
            );
    }
}
