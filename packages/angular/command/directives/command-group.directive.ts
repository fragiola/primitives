import { computed, Directive, type Signal, signal } from "@angular/core";
import { injectId } from "@fragiola/primitives-angular/internal";

/**
 * A `group` of Items, named by its GroupLabel, hidden while it shows none (spec/command.md):
 * `<div commandGroup>`.
 */
@Directive({
    selector: "[commandGroup]",
    exportAs: "commandGroup",
    host: {
        role: "group",
        "data-primitives-part": "command-group",
        "[attr.aria-labelledby]": "labelId",
        "[attr.hidden]": "state().hidden ? '' : null",
    },
})
export class CommandGroup {
    /** Its GroupLabel's id. */
    readonly labelId = `${injectId("primitives-command-group")}-label`;
    /** Its Items' hidden states. */
    private readonly members = signal<readonly Signal<boolean>[]>([]);
    readonly state = computed(() => ({
        hidden: this.members().every((hidden) => hidden()),
    }));

    /** An Item of the group: its hidden state, until it leaves. */
    register(hidden: Signal<boolean>): () => void {
        this.members.update((members) => [...members, hidden]);
        return () =>
            this.members.update((members) =>
                members.filter((member) => member !== hidden),
            );
    }
}
