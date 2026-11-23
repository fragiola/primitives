import {
    afterNextRender,
    afterRenderEffect,
    computed,
    DestroyRef,
    Directive,
    inject,
} from "@angular/core";
import { stepThroughNone } from "@fragiola/primitives/collection";
import { bridgeForm } from "@fragiola/primitives/form";
import { writeFieldAria } from "@fragiola/primitives-angular/field";
import {
    dataValues,
    injectFlush,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import {
    type AutocompletePending,
    AutocompleteRoot,
} from "./autocomplete-root.directive.ts";

/**
 * The `combobox` and the form control: `<input autocompleteInput>`. It keeps DOM focus while the
 * list is open; the highlighted suggestion is announced with `aria-activedescendant`
 * (spec/autocomplete.md, "Keyboard").
 */
@Directive({
    selector: "input[autocompleteInput]",
    exportAs: "autocompleteInput",
    host: {
        type: "text",
        role: "combobox",
        autocomplete: "off",
        "data-primitives-part": "autocomplete-input",
        "[attr.name]": "root.formName() ?? null",
        "[attr.required]": "root.required() ? '' : null",
        "[attr.disabled]": "data().disabled",
        "[value]": "root.displayed()",
        // the attribute follows the value, as React's controlled input (spec/README.md, "Server
        // rendering")
        "[attr.value]": "root.displayed()",
        "[attr.aria-autocomplete]": "root.mode()",
        "[attr.aria-expanded]": "String(state().open)",
        "[attr.aria-controls]": "root.listId",
        "[attr.aria-activedescendant]": "activeId()",
        "[attr.data-invalid]": "root.field.data().invalid",
        "[attr.data-valid]": "root.field.data().valid",
        "[attr.data-dirty]": "root.field.data().dirty",
        "[attr.data-touched]": "root.field.data().touched",
        "[attr.data-filled]": "root.field.data().filled",
        "[attr.data-focused]": "root.field.data().focused",
        "[attr.data-popup-open]": "data().open",
        "[attr.data-disabled]": "data().disabled",
        "(input)": "onInput($event)",
        "(click)": "onClick($event)",
        "(keydown)": "onKeyDown($event)",
        "(focus)": "root.field.focused()",
        "(blur)": "root.field.blurred()",
    },
})
export class AutocompleteInput {
    protected readonly root = inject(AutocompleteRoot);
    readonly state = computed(() => ({
        open: this.root.overlay.open(),
        disabled: this.root.isDisabled(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));
    /** The highlighted suggestion, while the list is open and it is rendered. */
    private readonly active = computed(() => {
        this.root.itemCount();
        const highlighted = this.root.highlighted();
        if (!this.state().open || highlighted === null) {
            return undefined;
        }
        return this.root.orderedItems().find((item) => item.id === highlighted);
    });
    protected readonly activeId = computed(() => this.active()?.id ?? null);
    protected readonly String = String;
    private readonly input = registerHost<HTMLInputElement>(
        this.root.overlay.singleTrigger,
    );
    private readonly flush = injectFlush();

    constructor() {
        const { field } = this.root;
        const host = this.input;
        writeFieldAria(field, host, {
            "aria-labelledby": field.labelledBy,
            "aria-describedby": field.describedBy,
            "aria-invalid": field.ariaInvalid,
        });
        let stop: (() => void) | null = null;
        // the consumer's own id wins (the label's `for` points at it)
        afterNextRender(() => {
            if (host.id === "") {
                host.id = this.root.overlay.triggerId;
            }
            this.root.inputElementId.set(host.id);
            stop = bridgeForm(host, { reset: () => this.root.reset() });
        });
        inject(DestroyRef).onDestroy(() => stop?.());
        // the completion string is selected, so the next character replaces it (APG)
        afterRenderEffect(() => {
            const shown = this.root.shown();
            if (shown === null || host.ownerDocument.activeElement !== host) {
                return;
            }
            const end = shown.text.length;
            if (host.value === shown.text) {
                host.setSelectionRange(shown.selectFrom ?? end, end);
            }
        });
    }

    protected onInput(event: Event): void {
        const root = this.root;
        const inputType = (event as InputEvent).inputType ?? "";
        root.type(
            this.input.value,
            root.inline() && inputType.startsWith("insert"),
            event,
        );
        // a bound `value` the consumer kept unchanged does not re-run the binding: put the shown
        // text back (React re-asserts a controlled value too)
        this.flush();
        const displayed = root.displayed();
        if (this.input.value !== displayed) {
            this.input.value = displayed;
            const shown = root.shown();
            if (shown !== null) {
                const end = shown.text.length;
                this.input.setSelectionRange(shown.selectFrom ?? end, end);
            }
        }
    }

    protected onClick(event: MouseEvent): void {
        const root = this.root;
        if (
            root.openOnInputClick() &&
            !root.overlay.open() &&
            !root.isDisabled()
        ) {
            root.setOpen(true, "input-press", event);
        }
    }

    protected onKeyDown(event: KeyboardEvent): void {
        const root = this.root;
        const open = root.overlay.open();
        const openWith = (pending: AutocompletePending) => {
            root.pending.set(pending);
            root.setOpen(true, "list-navigation", event);
        };
        switch (event.key) {
            case "ArrowDown":
            case "ArrowUp": {
                event.preventDefault();
                if (event.altKey) {
                    if (event.key === "ArrowDown" && !open) {
                        openWith(null);
                    } else if (event.key === "ArrowUp" && open) {
                        root.setOpen(false, "list-navigation", event);
                    }
                    return;
                }
                if (!open) {
                    openWith(event.key === "ArrowDown" ? "first" : "last");
                    return;
                }
                // past an end, the visual focus goes back to the input; from the input, to the
                // near end
                const items = root.orderedItems();
                const index = items.findIndex(
                    (item) => item.id === root.highlighted(),
                );
                const delta = event.key === "ArrowDown" ? 1 : -1;
                root.highlight(
                    items[stepThroughNone(items.length, index, delta)]?.id ??
                        null,
                    "keyboard",
                );
                return;
            }
            case "Enter": {
                if (!open) {
                    return;
                }
                const active = this.active();
                if (active === undefined) {
                    // no highlight: the list closes and the form may submit
                    root.setOpen(false, "none", event);
                    return;
                }
                event.preventDefault();
                if (!active.disabled) {
                    root.choose(active.value, event);
                }
                return;
            }
            case "Escape":
                // the open list's layer takes Escape first; here the list is closed
                if (!open && root.value() !== "") {
                    event.preventDefault();
                    root.clear("escape-key", event);
                }
                return;
            case "Tab":
                if (open) {
                    root.setOpen(false, "focus-out", event);
                }
                return;
            default:
        }
    }
}
