import { computed, Directive, inject } from "@angular/core";
import { commandKeyTarget } from "@fragiola/primitives/command";
import { CommandRoot } from "./command-root.directive.ts";

/**
 * The `combobox`: `<input commandInput aria-label="Command">`. It keeps DOM focus, filters the
 * Items as it is typed in and moves the highlight, announced with `aria-activedescendant`
 * (spec/command.md, "Keyboard").
 */
@Directive({
    selector: "input[commandInput]",
    exportAs: "commandInput",
    host: {
        type: "text",
        role: "combobox",
        "aria-expanded": "true",
        "aria-autocomplete": "list",
        autocomplete: "off",
        spellcheck: "false",
        "data-primitives-part": "command-input",
        "[attr.aria-controls]": "root.listId",
        "[attr.aria-activedescendant]": "activeId()",
        "[value]": "root.search()",
        // the attribute follows the value, as React's controlled input (spec/README.md, "Server
        // rendering")
        "[attr.value]": "root.search()",
        "(input)": "onInput($event)",
        "(keydown)": "onKeyDown($event)",
    },
})
export class CommandInput {
    protected readonly root = inject(CommandRoot);
    /** The highlighted Item's id. */
    protected readonly activeId = computed(() => {
        this.root.version();
        const highlighted = this.root.highlighted();
        let active: string | null = null;
        for (const info of this.root.items()) {
            if (info.value() === highlighted) {
                active = info.id;
            }
        }
        return active;
    });

    protected onInput(event: Event): void {
        this.root.type((event.target as HTMLInputElement).value, event);
    }

    protected onKeyDown(event: KeyboardEvent): void {
        if (event.isComposing) {
            return;
        }
        const root = this.root;
        const shown = root.shownItems();
        const highlighted = root.highlighted();
        const current = shown.findIndex((info) => info.value() === highlighted);
        const target = commandKeyTarget(
            event,
            current,
            shown.length,
            root.loopFocus(),
        );
        if (target !== null) {
            event.preventDefault();
            root.highlight(shown[target]?.value() ?? null);
            return;
        }
        if (event.key === "Enter") {
            const item = shown[current];
            if (item !== undefined) {
                event.preventDefault();
                if (!item.disabled()) {
                    item.run(event);
                }
            }
            return;
        }
        if (
            event.key === "Backspace" &&
            (event.currentTarget as HTMLInputElement).value === "" &&
            root.pages().length > 0
        ) {
            event.preventDefault();
            root.back(event);
        }
    }
}
