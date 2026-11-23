import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/tag-group";
import { tagGroup } from "examples-shared/recipes/tag-group";
import { Output } from "../../kit/output.ts";
import { TAG_GROUP_PARTS, tagGroupTags } from "./tag-group-parts.ts";
import { CATEGORIES, printList } from "./tags.ts";

/** Removable tags, no selection (spec/tag-group.md, `/tag-group/basic`). */
@Component({
    selector: "[scenario-tag-group-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [TAG_GROUP_PARTS, Output],
    template: `
        <div class="flex flex-col items-start gap-4">
            <div tagGroupRoot removable (remove)="onRemove($event)" [class]="styles.root">
                <span tagGroupLabel [class]="styles.label">Categories</span>
                <div tagGroupList [class]="styles.list">${tagGroupTags("tags()", true)}</div>
                @if (tags().length === 0) {
                    <p class="text-xs">No categories.</p>
                }
            </div>
            <button type="button">After</button>
        </div>
        <pre fixtureOutput [values]="{ tags: print(values()), removed: removed(), reason: reason() }"></pre>
    `,
})
export class TagGroupBasic {
    protected readonly styles = tagGroup;
    protected readonly print = printList;
    protected readonly tags = signal(CATEGORIES);
    protected readonly removed = signal<string | undefined>(undefined);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly values = () => this.tags().map((tag) => tag.value);

    protected onRemove(event: ValueChangeEvent<string>): void {
        this.tags.update((current) =>
            current.filter((tag) => tag.value !== event.value),
        );
        this.removed.set(event.value);
        this.reason.set(event.details.reason);
    }
}
