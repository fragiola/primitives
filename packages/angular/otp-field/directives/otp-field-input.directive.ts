import {
    afterNextRender,
    computed,
    Directive,
    effect,
    inject,
    signal,
    untracked,
} from "@angular/core";
import { injectHost } from "@fragiola/primitives-angular/internal";
import { writeSlotLabelledBy } from "../utils/write-slot-labelled-by.ts";
import {
    OTPFieldRoot,
    type OTPFieldState,
} from "./otp-field-root.directive.ts";

export interface OTPFieldInputState extends OTPFieldState {
    /** The slot's index; `-1` before the slots are known (a server render). */
    index: number;
    /** The slot's character, `""` when empty. */
    character: string;
    /** The slot holds a character. */
    filled: boolean;
}

/**
 * One slot of the code: a native input holding one character (spec/otp-field.md),
 * `<input otpFieldInput aria-label="Digit 1 of 6">`. Its name is the consumer's, which says its
 * position (a static or bound `aria-label` or `aria-labelledby`); a slot with none is labelled by
 * the Field's label. It registers once rendered, so before the slots are known (a server render,
 * the first render) it has `tabindex="-1"` and shows no character.
 */
@Directive({
    selector: "input[otpFieldInput]",
    exportAs: "otpFieldInput",
    host: {
        autocorrect: "off",
        spellcheck: "false",
        "data-primitives-part": "otp-field-input",
        "[attr.id]": "slotId()",
        "[attr.type]": "root.mask() ? 'password' : 'text'",
        "[attr.inputmode]": "root.slotInputMode()",
        "[attr.autocomplete]":
            "state().index === 0 ? root.autoComplete() : 'off'",
        "[attr.enterkeyhint]":
            "state().index === state().length - 1 ? 'done' : 'next'",
        "[attr.maxlength]": "state().index === 0 ? state().length : null",
        "[attr.tabindex]": "tabIndex()",
        "[value]": "state().character",
        // the attribute follows the value, as React's controlled input (spec/README.md, "Server
        // rendering"), and a form reset restores the rendered character
        "[attr.value]": "state().character",
        "[attr.disabled]": "root.data().disabled",
        "[attr.readonly]": "root.data().readonly",
        "[attr.aria-invalid]": "root.field.ariaInvalid()",
        "[attr.data-disabled]": "root.data().disabled",
        "[attr.data-readonly]": "root.data().readonly",
        "[attr.data-required]": "root.data().required",
        "[attr.data-complete]": "root.data().complete",
        "[attr.data-invalid]": "root.data().invalid",
        "[attr.data-valid]": "root.data().valid",
        "[attr.data-dirty]": "root.data().dirty",
        "[attr.data-touched]": "root.data().touched",
        "[attr.data-focused]": "root.data().focused",
        "[attr.data-filled]": "state().filled ? '' : null",
        "[attr.data-index]": "known() ? state().index : null",
        "(mousedown)": "onMouseDown($event)",
        "(focus)": "onFocus()",
        "(blur)": "root.slotBlurred($event.relatedTarget)",
        "(input)": "onInput($event)",
        "(paste)": "onPaste($event)",
        "(keydown)": "onKeyDown($event)",
    },
})
export class OTPFieldInput {
    protected readonly root = inject(OTPFieldRoot);
    private readonly host = injectHost<HTMLInputElement>();
    private readonly rendered = signal(false);
    /** Its index in document order, `-1` until the slots are known. */
    private readonly index = computed(() =>
        this.rendered() ? this.root.ordered().indexOf(this.host) : -1,
    );
    protected readonly known = computed(() => this.index() >= 0);
    readonly state = computed<OTPFieldInputState>(() => {
        const index = this.index();
        const character = this.root.characterAt(index);
        return {
            ...this.root.state(),
            index,
            character,
            filled: character !== "",
        };
    });
    protected readonly slotId = computed(() => {
        const index = this.index();
        if (index < 0) {
            return null;
        }
        const id = this.root.slotId();
        return index === 0 ? id : `${id}-${index + 1}`;
    });
    protected readonly tabIndex = computed(() =>
        this.known() && this.index() === this.root.activeIndex() ? "0" : "-1",
    );

    constructor() {
        const host = this.host;
        writeSlotLabelledBy(this.root.field, host);
        // registered once rendered, in the browser only
        afterNextRender(() => this.rendered.set(true));
        effect((onCleanup) => {
            if (this.rendered()) {
                onCleanup(untracked(() => this.root.register(host)));
            }
        });
    }

    protected onMouseDown(event: MouseEvent): void {
        if (event.button !== 0 || this.root.isDisabled() || !this.known()) {
            return;
        }
        // focused without a caret inside its character: it is selected
        event.preventDefault();
        this.root.focusSlot(this.index());
    }

    protected onFocus(): void {
        if (this.known()) {
            this.root.slotFocused(this.index(), this.host);
        }
    }

    protected onInput(event: Event): void {
        if (!this.known()) {
            return;
        }
        this.root.commit(this.index(), this.host.value, "input-change", event);
        // a refused character, or a bound value the consumer kept, does not re-run the binding:
        // put the slot's character back (React re-asserts a controlled value too)
        this.root.syncSlots();
    }

    protected onPaste(event: ClipboardEvent): void {
        if (!this.known() || this.root.isDisabled() || this.root.readOnly()) {
            return;
        }
        event.preventDefault();
        this.root.commit(
            this.index(),
            event.clipboardData?.getData("text/plain") ?? "",
            "input-paste",
            event,
        );
    }

    protected onKeyDown(event: KeyboardEvent): void {
        if (this.known()) {
            this.root.keydown(this.index(), event);
        }
    }
}
