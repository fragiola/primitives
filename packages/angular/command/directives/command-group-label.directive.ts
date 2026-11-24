import { Directive } from "@angular/core";
import { injectEnclosing } from "@fragiola/primitives-angular/internal";
import { CommandGroup } from "./command-group.directive.ts";

/** Names its Group: `<div commandGroupLabel>`. */
@Directive({
    selector: "[commandGroupLabel]",
    host: {
        "data-primitives-part": "command-group-label",
        "[attr.id]": "group.labelId",
    },
})
export class CommandGroupLabel {
    protected readonly group = injectEnclosing(
        CommandGroup,
        "commandGroup",
        "CommandGroupLabel",
    );
}
