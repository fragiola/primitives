import {
    afterNextRender,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    input,
    numberAttribute,
    output,
    signal,
    untracked,
} from "@angular/core";
import { inDocumentOrder } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    bridgeForm,
    normalizeOtp,
    type OtpValidationType,
    otpInputMode,
    otpPattern,
    removeOtpCharacter,
    replaceOtp,
} from "@fragiola/primitives/form";
import {
    fieldControl,
    writeFieldAria,
} from "@fragiola/primitives-angular/field";
import {
    type ChangeDetails,
    type ChangeReason,
    controllable,
    createHiddenInput,
    dataValues,
    injectFlush,
    injectHost,
    injectId,
    injectProvidedDirection,
    setInputAttribute,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";

/** The state every part renders with (spec/otp-field.md, "State attributes and ARIA"). */
export interface OTPFieldState {
    /** The code typed so far. */
    value: string;
    length: number;
    /** The value is `length` characters long. */
    complete: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

/**
 * Holds an OTP field's code, its slots and its hidden form input, rendered right after it
 * (spec/otp-field.md: one native input per slot, in a `group` with one tab stop):
 * `<div otpFieldRoot [length]="6" [(value)]="code" name="code">` around its `input[otpFieldInput]`
 * slots. Every part carries its state (`data-disabled`, `data-readonly`, `data-required`,
 * `data-complete`, and the Field's).
 */
@Directive({
    selector: "[otpFieldRoot]",
    exportAs: "otpFieldRoot",
    host: {
        role: "group",
        "data-primitives-part": "otp-field-root",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-readonly]": "data().readonly",
        "[attr.data-required]": "data().required",
        "[attr.data-complete]": "data().complete",
        "[attr.data-invalid]": "data().invalid",
        "[attr.data-valid]": "data().valid",
        "[attr.data-dirty]": "data().dirty",
        "[attr.data-touched]": "data().touched",
        "[attr.data-filled]": "data().filled",
        "[attr.data-focused]": "data().focused",
    },
})
export class OTPFieldRoot {
    /** The number of slots. */
    readonly length = input.required({ transform: numberAttribute });
    /** The code typed so far; bound, the field is controlled. */
    readonly value = input<string | undefined>(undefined);
    readonly valueChange = output<string>();
    readonly defaultValue = input("");
    readonly valueChangeDetails = output<ValueChangeEvent<string>>();
    /** The value became `length` long, or a complete code was pasted again. */
    readonly valueComplete = output<ValueChangeEvent<string>>();
    /** Typed or pasted text held characters `validationType` refuses: `value` is that text. */
    readonly valueInvalid = output<ValueChangeEvent<string>>();
    /** The characters a slot accepts (default `"numeric"`). */
    readonly validationType = input<OtpValidationType>("numeric");
    /** The slots hide their characters (`type="password"`). */
    readonly mask = input(false, { transform: booleanAttribute });
    /** The first slot's and the hidden input's `autocomplete` (default `"one-time-code"`). */
    readonly autoComplete = input("one-time-code");
    /** The slots' virtual keyboard (default from `validationType`). */
    readonly inputMode = input<string | undefined>(undefined);
    readonly required = input(false, { transform: booleanAttribute });
    readonly readOnly = input(false, { transform: booleanAttribute });
    readonly disabled = input(false, { transform: booleanAttribute });
    readonly name = input<string | undefined>(undefined);
    /** The first slot's `id`; slot `n` gets `<id>-<n>`. */
    readonly id = input<string | undefined>(undefined);

    private readonly host = injectHost();
    private readonly flush = injectFlush();
    private readonly direction = injectProvidedDirection();
    private readonly generatedId = injectId("primitives-otp-field");
    /** The first slot's `id`. */
    readonly slotId = computed(() => this.id() ?? this.generatedId);
    private readonly own = controllable<string, ChangeDetails>(
        this.value,
        this.valueChange,
        () => this.defaultValue(),
        (value, details) => this.valueChangeDetails.emit({ value, details }),
    );
    /** The value, normalized: at most `length` accepted characters. */
    readonly code = computed(
        () =>
            normalizeOtp(this.own.value(), this.length(), this.validationType())
                .value,
    );
    private readonly slots = signal<readonly HTMLInputElement[]>([]);
    /** The slots in document order, once rendered. */
    readonly ordered = computed(() =>
        inDocumentOrder(this.slots(), (slot) => slot),
    );
    /** The focused slot's index while focus is inside, else `null`. */
    private readonly focusedIndex = signal<number | null>(null);
    private readonly last = computed(() => Math.max(this.length() - 1, 0));
    /** The slot holding the tab stop. */
    readonly activeIndex = computed(
        () => this.focusedIndex() ?? Math.min(this.code().length, this.last()),
    );
    private readonly hidden = createHiddenInput(this.host, {
        type: "text",
        "data-primitives-part": "otp-field-hidden-input",
    });
    readonly field = fieldControl({
        id: this.slotId,
        labelable: true,
        value: this.code,
        filled: computed(() => this.code() !== ""),
        input: () => this.hidden,
        focusTarget: () => this.firstEmptySlot(),
    });
    readonly isDisabled = computed(
        () => this.disabled() || this.field.disabled(),
    );
    readonly slotInputMode = computed(
        () => this.inputMode() ?? otpInputMode(this.validationType()),
    );
    readonly state = computed<OTPFieldState>(() => {
        const value = this.code();
        const length = this.length();
        return {
            value,
            length,
            complete: value.length === length && length > 0,
            disabled: this.isDisabled(),
            readOnly: this.readOnly(),
            required: this.required(),
        };
    });
    /** The state attributes and the field's, for every part. */
    readonly data = computed(() => {
        const state = this.state();
        const field = this.field.data();
        return {
            ...dataValues({
                disabled: state.disabled,
                readonly: state.readOnly,
                required: state.required,
                complete: state.complete,
            }),
            invalid: field.invalid,
            valid: field.valid,
            dirty: field.dirty,
            touched: field.touched,
            filled: field.filled,
            focused: field.focused,
        };
    });

    constructor() {
        const host = this.host;
        const hidden = this.hidden;
        writeFieldAria(this.field, host, {
            "aria-labelledby": this.field.labelledBy,
            "aria-describedby": this.field.describedBy,
        });
        const formName = computed(
            () => this.field.name() ?? this.name() ?? null,
        );
        effect(() => {
            const state = this.state();
            setInputAttribute(hidden, "name", formName());
            setInputAttribute(hidden, "autocomplete", this.autoComplete());
            setInputAttribute(hidden, "maxlength", String(state.length));
            setInputAttribute(
                hidden,
                "pattern",
                otpPattern(this.validationType(), state.length),
            );
            hidden.value = state.value;
            hidden.required = state.required;
            hidden.disabled = state.disabled;
        });
        // a focus on the hidden input goes to the first slot; the browser's autofill of it spreads
        const onHiddenFocus = () => this.focusSlot(0);
        const onHiddenInput = (event: Event) => {
            if (!this.interactive()) {
                return;
            }
            const { value } = normalizeOtp(
                hidden.value,
                untracked(this.length),
                untracked(this.validationType),
            );
            this.setValue(value, "input-change", event);
        };
        hidden.addEventListener("focus", onHiddenFocus);
        hidden.addEventListener("input", onHiddenInput);

        // a form reset returns it to its default, and writes the rendered value back (Switch's way)
        const destroyRef = inject(DestroyRef);
        let stop: (() => void) | null = null;
        afterNextRender(() => {
            stop = bridgeForm(hidden, {
                reset: () => {
                    this.field.reset();
                    this.setValue(
                        normalizeOtp(
                            untracked(this.defaultValue),
                            untracked(this.length),
                            untracked(this.validationType),
                        ).value,
                        "none",
                        undefined,
                    );
                    // the browser reset the inputs after the state: write the state back
                    hidden.value = untracked(this.code);
                    this.syncSlots();
                },
                invalid: () => this.firstEmptySlot(),
            });
        });
        destroyRef.onDestroy(() => {
            stop?.();
            hidden.removeEventListener("focus", onHiddenFocus);
            hidden.removeEventListener("input", onHiddenInput);
        });
    }

    /** Registers a slot, once rendered; returns the cleanup. */
    register(element: HTMLInputElement): () => void {
        this.slots.update((list) => [...list, element]);
        return () =>
            this.slots.update((list) =>
                list.filter((slot) => slot !== element),
            );
    }

    /** The character slot `index` shows, `""` when empty (or unknown: `-1`). */
    characterAt(index: number): string {
        return index < 0 ? "" : (Array.from(this.code())[index] ?? "");
    }

    /**
     * Focuses a slot, or the first empty one when it lies after it (no gap), and selects its
     * character; the change before it is rendered first, so the slot holds its character.
     */
    focusSlot(index: number): void {
        this.flush();
        const target = Math.max(
            0,
            Math.min(index, untracked(this.code).length, untracked(this.last)),
        );
        const slot = untracked(this.ordered)[target];
        if (slot !== undefined) {
            slot.focus();
            slot.select();
        }
    }

    /** Typed (`input-change`) or pasted (`input-paste`) text in slot `index` (spec/otp-field.md, "Typing"). */
    commit(
        index: number,
        text: string,
        reason: "input-change" | "input-paste",
        event: Event,
    ): void {
        if (!this.interactive()) {
            return;
        }
        const length = untracked(this.length);
        const type = untracked(this.validationType);
        const normalized = normalizeOtp(text, length, type);
        if (normalized.rejected) {
            this.valueInvalid.emit({ value: text, details: { reason, event } });
        }
        const current = untracked(this.code);
        if (normalized.value === "") {
            if (reason === "input-change" && text === "") {
                this.setValue(
                    removeOtpCharacter(current, index),
                    "input-clear",
                    event,
                );
            }
            return;
        }
        this.setValue(
            replaceOtp(current, index, normalized.value, length, type),
            reason,
            event,
        );
        this.focusSlot(index + Array.from(normalized.value).length);
    }

    /** A slot's keys (spec/otp-field.md, "Keyboard"; the arrows mirrored in RTL). */
    keydown(index: number, event: KeyboardEvent): void {
        if (event.defaultPrevented || untracked(this.isDisabled)) {
            return;
        }
        const length = untracked(this.length);
        const current = untracked(this.code);
        const end = Math.min(current.length, length - 1);
        const boundary = (event.ctrlKey || event.metaKey) && !event.altKey;
        const element = event.currentTarget as HTMLElement;
        const rtl = getDirection(element, this.direction()) === "rtl";
        const previousKey = rtl ? "ArrowRight" : "ArrowLeft";
        const nextKey = rtl ? "ArrowLeft" : "ArrowRight";
        const move = (target: number) => {
            event.preventDefault();
            this.focusSlot(target);
        };
        if (event.key === previousKey) {
            move(boundary ? 0 : Math.max(0, index - 1));
            return;
        }
        if (event.key === nextKey) {
            move(boundary ? end : Math.min(length - 1, index + 1));
            return;
        }
        if (event.key === "Home" || event.key === "ArrowUp") {
            move(0);
            return;
        }
        if (event.key === "End" || event.key === "ArrowDown") {
            move(end);
            return;
        }
        if (untracked(this.readOnly)) {
            return;
        }
        const character = Array.from(current)[index] ?? "";
        if (event.key === "Backspace" && boundary) {
            event.preventDefault();
            this.setValue("", "keyboard", event);
            this.focusSlot(0);
            return;
        }
        if (event.key === "Delete") {
            event.preventDefault();
            this.setValue(
                removeOtpCharacter(current, index),
                "keyboard",
                event,
            );
            this.focusSlot(index);
            return;
        }
        if (event.key === "Backspace") {
            event.preventDefault();
            const target = Math.max(0, index - 1);
            this.setValue(
                removeOtpCharacter(current, character === "" ? target : index),
                "keyboard",
                event,
            );
            this.focusSlot(target);
            return;
        }
        const input = event.currentTarget as HTMLInputElement;
        const selectsAll =
            input.selectionStart === 0 &&
            input.selectionEnd === input.value.length;
        if (
            event.key.length === 1 &&
            !boundary &&
            selectsAll &&
            character === event.key
        ) {
            // the character it already holds: only move on
            event.preventDefault();
            if (index < length - 1) {
                this.focusSlot(index + 1);
            }
        }
    }

    /** A slot took focus: it holds the tab stop, unless it lies after the first empty slot. */
    slotFocused(index: number, element: HTMLInputElement): void {
        if (index > untracked(this.code).length) {
            // no gap: the first empty slot takes the focus
            this.focusSlot(untracked(this.code).length);
            return;
        }
        this.focusedIndex.set(index);
        element.select();
        this.field.focused();
    }

    /** A slot lost focus: the code is blurred once focus leaves its group. */
    slotBlurred(related: EventTarget | null): void {
        if (related instanceof Node && this.host.contains(related)) {
            return;
        }
        this.focusedIndex.set(null);
        this.field.blurred();
    }

    /** Writes every slot's character back onto its input (a refused text, a form reset). */
    syncSlots(): void {
        this.flush();
        untracked(this.ordered).forEach((slot, index) => {
            const character = this.characterAt(index);
            if (slot.value !== character) {
                slot.value = character;
            }
        });
    }

    private interactive(): boolean {
        return !untracked(this.isDisabled) && !untracked(this.readOnly);
    }

    /** The first empty slot, the last when the code is complete. */
    private firstEmptySlot(): HTMLElement | null {
        return (
            untracked(this.ordered)[
                Math.min(untracked(this.code).length, untracked(this.last))
            ] ?? null
        );
    }

    private setValue(
        next: string,
        reason: ChangeReason,
        event: Event | undefined,
    ): void {
        const details = { reason, event };
        const length = untracked(this.length);
        if (next === untracked(this.code)) {
            // a complete code pasted again completes again (Base UI)
            if (reason === "input-paste" && next.length === length) {
                this.valueComplete.emit({ value: next, details });
            }
            return;
        }
        this.own.set(next, details);
        if (next.length === length) {
            this.valueComplete.emit({ value: next, details });
        }
        this.flush();
    }
}
