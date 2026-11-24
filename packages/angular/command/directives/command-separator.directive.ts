import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
} from "@angular/core";
import { CommandRoot } from "./command-root.directive.ts";

/**
 * Between groups, hidden while there is text (the groups it separates may be hidden); no role of
 * its own (a `listbox` owns only groups and options): `<div commandSeparator>`.
 */
@Directive({
    selector: "[commandSeparator]",
    exportAs: "commandSeparator",
    host: {
        role: "presentation",
        "data-orientation": "horizontal",
        "data-primitives-part": "command-separator",
        "[attr.hidden]": "state().hidden ? '' : null",
    },
})
export class CommandSeparator {
    private readonly root = inject(CommandRoot);
    /** Shown while there is text too. */
    readonly forceMount = input(false, { transform: booleanAttribute });
    readonly state = computed(() => ({
        hidden: !this.forceMount() && this.root.search().trim() !== "",
    }));
}
