import { computed, Directive } from "@angular/core";
import { injectEnclosing } from "@fragiola/primitives-angular/internal";
import { ListboxRoot } from "./listbox-root.directive.ts";

/**
 * Between items or groups (spec/listbox.md); no role of its own (a `listbox` owns only groups and
 * options), across the list's orientation: `<div listboxSeparator>`.
 */
@Directive({
    selector: "[listboxSeparator]",
    host: {
        role: "presentation",
        "data-primitives-part": "listbox-separator",
        "[attr.data-orientation]": "orientation()",
    },
})
export class ListboxSeparator {
    private readonly root = injectEnclosing(
        ListboxRoot,
        "listboxRoot",
        "listboxSeparator",
    );
    protected readonly orientation = computed(() =>
        this.root.orientation() === "vertical" ? "horizontal" : "vertical",
    );
}
