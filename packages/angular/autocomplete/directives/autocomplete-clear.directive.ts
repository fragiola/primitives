import { computed, DestroyRef, Directive, effect, inject } from "@angular/core";
import {
    conditionalView,
    dataValue,
    writeAttributes,
} from "@fragiola/primitives-angular/internal";
import { AutocompleteRoot } from "./autocomplete-root.directive.ts";

/**
 * Empties the text; structural, so it is rendered only while there is text
 * (spec/autocomplete.md): `<button *autocompleteClear aria-label="Clear search">×</button>`. The
 * directive writes its attributes on the element it renders, and keeps focus in the input.
 */
@Directive({ selector: "[autocompleteClear]", exportAs: "autocompleteClear" })
export class AutocompleteClear {
    private readonly root = inject(AutocompleteRoot);
    readonly state = computed(() => ({ disabled: this.root.isDisabled() }));

    constructor() {
        const root = this.root;
        const onPointerDown = (event: Event) => event.preventDefault();
        const onClick = (event: Event) => {
            root.clear("clear-press", event);
            if (root.overlay.open() && !root.openOnInputClick()) {
                root.setOpen(false, "input-clear", event);
            }
            root.overlay.trigger()?.focus();
        };
        const element = conditionalView(
            computed(() => root.value() !== ""),
            (button) => {
                writeAttributes(button, {
                    type: "button",
                    tabindex: "-1",
                    "data-primitives-part": "autocomplete-clear",
                });
                button.addEventListener("pointerdown", onPointerDown);
                button.addEventListener("click", onClick);
            },
        );
        effect((onCleanup) => {
            const button = element();
            const disabled = this.state().disabled;
            if (button === null) {
                return;
            }
            writeAttributes(button, {
                disabled: disabled ? "" : null,
                "data-disabled": dataValue(disabled),
            });
            root.clearButton.set(button);
            onCleanup(() => {
                if (root.clearButton() === button) {
                    root.clearButton.set(null);
                }
            });
        });
        inject(DestroyRef).onDestroy(() => root.clearButton.set(null));
    }
}
