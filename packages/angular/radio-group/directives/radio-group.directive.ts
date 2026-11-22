import {
    booleanAttribute,
    computed,
    Directive,
    input,
    output,
    signal,
    untracked,
} from "@angular/core";
import { radioKeyTarget } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    fieldControl,
    writeFieldAria,
} from "@fragiola/primitives-angular/field";
import {
    type ChangeDetails,
    controllable,
    dataValues,
    injectFlush,
    injectHost,
    injectProvidedDirection,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";

export type RadioGroupOrientation = "horizontal" | "vertical";

export interface RadioGroupState {
    /** The checked radio's value, `null` for none. */
    value: string | null;
    disabled: boolean;
    required: boolean;
    orientation: RadioGroupOrientation | undefined;
}

/** A radio of the group, as it registered (spec/radio-group.md). */
export interface RadioEntry {
    value: string;
    disabled: boolean;
    element: HTMLElement;
    /** Its hidden input: what the form submits and validates. */
    input: HTMLInputElement;
}

/** The radios in document order. */
export function radiosInOrder(entries: readonly RadioEntry[]): RadioEntry[] {
    return [...entries].sort((a, b) =>
        a.element.compareDocumentPosition(b.element) &
        Node.DOCUMENT_POSITION_FOLLOWING
            ? -1
            : 1,
    );
}

/** The radio holding the tab stop: the checked one when enabled, else the first enabled one. */
export function tabStopOf(
    entries: readonly RadioEntry[],
    value: string | null,
): RadioEntry | undefined {
    const enabled = radiosInOrder(entries).filter((entry) => !entry.disabled);
    return enabled.find((entry) => entry.value === value) ?? enabled[0];
}

/**
 * A set of radios of which one can be checked (spec/radio-group.md, the APG radio group): the
 * `radiogroup`, one tab stop, the arrows move the focus and the check together:
 * `<div radioGroup [(value)]="plan" name="plan">` around its `[radioRoot]` buttons. Inside a
 * `[fieldRoot]`, the group is the field's control (spec/field.md, "Integration contract"), as a
 * CheckboxGroup: the field's label names it, its description and errors describe it, and its
 * radios take the field's `name` and `disabled`.
 */
@Directive({
    selector: "[radioGroup]",
    exportAs: "radioGroup",
    host: {
        role: "radiogroup",
        "data-primitives-part": "radio-group-root",
        "[attr.aria-required]": "state().required ? 'true' : null",
        "[attr.aria-disabled]": "state().disabled ? 'true' : null",
        "[attr.aria-orientation]": "state().orientation ?? null",
        "[attr.data-invalid]": "field.data().invalid",
        "[attr.data-valid]": "field.data().valid",
        "[attr.data-dirty]": "field.data().dirty",
        "[attr.data-touched]": "field.data().touched",
        "[attr.data-filled]": "field.data().filled",
        "[attr.data-focused]": "field.data().focused",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-required]": "data().required",
        "[attr.data-orientation]": "data().orientation",
        "(focusin)": "field.focused()",
        "(focusout)": "onFocusOut($event)",
    },
})
export class RadioGroup {
    /** The checked radio's value; `null` for none (controlled). */
    readonly value = input<string | null | undefined>(undefined);
    readonly valueChange = output<string | null>();
    /** The radio checked at first (default: none). */
    readonly defaultValue = input<string | null>(null);
    readonly valueChangeDetails = output<ValueChangeEvent<string | null>>();
    /** Disables every radio. */
    readonly disabled = input(false, { transform: booleanAttribute });
    /** The form's validation fails while no radio is checked. */
    readonly required = input(false, { transform: booleanAttribute });
    /** Every radio's hidden input takes it. */
    readonly name = input<string | undefined>(undefined);
    /** `aria-orientation` and `data-orientation`; it changes no key (APG). */
    readonly orientation = input<RadioGroupOrientation | undefined>(undefined);
    /** The arrows wrap from the last radio to the first and back (default `true`). */
    readonly loopFocus = input(true, { transform: booleanAttribute });

    private readonly host = injectHost();
    /** A DirectionProvider's direction, else `null` (the computed one is read). */
    private readonly direction = injectProvidedDirection();
    private readonly flush = injectFlush();
    private readonly selection = controllable<string | null, ChangeDetails>(
        this.value,
        this.valueChange,
        () => this.defaultValue(),
        (value, details) => this.valueChangeDetails.emit({ value, details }),
    );
    /** The checked radio's value, `null` for none. */
    readonly checked = this.selection.value;
    private readonly radios = signal<readonly RadioEntry[]>([]);

    /**
     * The enclosing field's binding (spec/field.md): the group is the field's control, with no
     * labelable element; the validated element is its first enabled radio's hidden input, and a
     * Form focuses its tab stop.
     */
    readonly field = fieldControl({
        id: signal(undefined),
        labelable: false,
        value: this.checked,
        filled: computed(() => this.checked() !== null),
        input: () =>
            radiosInOrder(untracked(this.radios)).find(
                (entry) => !entry.disabled,
            )?.input ?? null,
        element: () => this.host,
        focusTarget: () => this.tabStopElement(),
    });
    /** Its own `disabled`, or the field's: every radio inside is disabled. */
    readonly isDisabled = computed(
        () => this.disabled() || this.field.disabled(),
    );
    /** The hidden inputs' name: its Field's, which wins (spec/field.md), or the group's. */
    readonly formName = computed(() => this.field.name() ?? this.name());
    /** The value of the radio holding the tab stop (before any radio registered, the checked one). */
    readonly tabStop = computed(() => {
        const radios = this.radios();
        const value = this.checked();
        return radios.length === 0
            ? value
            : (tabStopOf(radios, value)?.value ?? null);
    });
    readonly state = computed<RadioGroupState>(() => ({
        value: this.checked(),
        disabled: this.isDisabled(),
        required: this.required(),
        orientation: this.orientation(),
    }));
    protected readonly data = computed(() => {
        const state = this.state();
        return dataValues({
            disabled: state.disabled,
            required: state.required,
            orientation: state.orientation,
        });
    });

    /** Every radio's hidden input reports its form's reset: the group resets once per reset. */
    private resetting = false;

    constructor() {
        writeFieldAria(this.field, this.host, {
            "aria-labelledby": this.field.labelledBy,
            "aria-describedby": this.field.describedBy,
            "aria-invalid": this.field.ariaInvalid,
        });
    }

    /** Focus left the group (not to one of its radios): the field is touched. */
    protected onFocusOut(event: FocusEvent): void {
        const next = event.relatedTarget;
        if (next instanceof Node && this.host.contains(next)) {
            return;
        }
        this.field.blurred();
    }

    /** Checks a radio. */
    select(value: string): void {
        this.selection.set(value, { reason: "none" });
    }

    /** An arrow key on a radio: moves the focus and the check (spec/radio-group.md, "Keyboard"). */
    navigate(key: string, from: HTMLElement): boolean {
        const ordered = radiosInOrder(untracked(this.radios));
        const index = ordered.findIndex((entry) => entry.element === from);
        if (index === -1) {
            return false;
        }
        const target = radioKeyTarget(key, index, ordered.length, {
            rtl: getDirection(this.host, this.direction()) === "rtl",
            loop: untracked(this.loopFocus),
            skip: (candidate) => ordered[candidate]?.disabled ?? true,
        });
        const entry = target === null ? undefined : ordered[target];
        if (entry === undefined) {
            return false;
        }
        entry.element.focus();
        this.select(entry.value);
        // the new tab stop and check reach the DOM before the next key (AGENTS.md, "Porting")
        this.flush();
        return true;
    }

    /** A form reset: back to `defaultValue`, once for all the radios' inputs. */
    reset(): void {
        if (this.resetting) {
            return;
        }
        this.resetting = true;
        setTimeout(() => {
            this.resetting = false;
        });
        this.field.reset();
        this.selection.set(untracked(this.defaultValue), { reason: "none" });
    }

    /** The group's tab stop's element, where a failed validation sends the focus. */
    tabStopElement(): HTMLElement | null {
        return (
            tabStopOf(untracked(this.radios), untracked(this.checked))
                ?.element ?? null
        );
    }

    /** Registers a radio for as long as it lives; returns its unregistration. */
    register(entry: RadioEntry): () => void {
        this.radios.update((current) => [...current, entry]);
        return () =>
            this.radios.update((current) =>
                current.filter((item) => item !== entry),
            );
    }
}
