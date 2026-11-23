import { Component, computed, signal } from "@angular/core";
import { Toggle } from "@fragiola/primitives-angular/toggle";
import { ToggleGroup } from "@fragiola/primitives-angular/toggle-group";
import { styles } from "./styles.ts";

const ALIGNMENTS = [
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
    { value: "right", label: "Right" },
    { value: "justify", label: "Justify" },
];

// Text alignment: one toggle pressed at a time, and pressing the pressed one releases it (the
// paragraph falls back to the start). The group is one tab stop; the arrow keys, Home and End
// move the focus between the toggles, never the value (spec/toggle-group.md).
@Component({
    selector: "example-text-alignment",
    imports: [Toggle, ToggleGroup],
    template: `
        <div [class]="styles.stack">
            <div toggleGroup aria-label="Text alignment" [(value)]="value" [class]="styles.root">
                @for (entry of alignments; track entry.value) {
                    <button toggle [value]="entry.value" [class]="styles.toggle">{{ entry.label }}</button>
                }
            </div>
            <p [attr.data-align]="align()" [class]="styles.preview">The quick brown fox jumps over the lazy dog, then naps in the sun while the dog wonders what just happened.</p>
        </div>
    `,
})
export default class TextAlignment {
    protected readonly styles = styles;
    protected readonly alignments = ALIGNMENTS;
    protected readonly value = signal<string[]>(["left"]);
    protected readonly align = computed(() => this.value()[0] ?? "start");
}
