import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/tag-group";
import { tagGroup } from "examples-shared/recipes/tag-group";
import { Output } from "../../kit/output.ts";
import { TAG_GROUP_PARTS, tagGroupTags } from "./tag-group-parts.ts";
import { CATEGORIES, printList } from "./tags.ts";

/** `disabledKeys` and a disabled Tag (spec/tag-group.md, `/tag-group/disabled`). */
@Component({
    selector: "[scenario-tag-group-disabled]",
    encapsulation: ViewEncapsulation.None,
    imports: [TAG_GROUP_PARTS, Output],
    template: `
        <div tagGroupRoot selectionMode="multiple" [disabledKeys]="disabledKeys" [value]="value()" (valueChange)="value.set($event)" removable (remove)="onRemove($event)" [class]="styles.root">
            <span tagGroupLabel [class]="styles.label">Categories</span>
            <div tagGroupList [class]="styles.list">${tagGroupTags("tags()", true, "disabledTags")}</div>
        </div>
        <pre fixtureOutput [values]="{ tags: print(values()), value: print(value()) }"></pre>
    `,
})
export class TagGroupDisabled {
    protected readonly styles = tagGroup;
    protected readonly print = printList;
    protected readonly disabledKeys = ["travel"];
    protected readonly disabledTags = ["sports"];
    protected readonly tags = signal(CATEGORIES);
    protected readonly value = signal<readonly string[]>([]);
    protected readonly values = () => this.tags().map((tag) => tag.value);

    protected onRemove(event: ValueChangeEvent<string>): void {
        this.tags.update((current) =>
            current.filter((tag) => tag.value !== event.value),
        );
    }
}
