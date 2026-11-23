import { Component, computed, signal } from "@angular/core";
import { Toggle } from "@fragiola/primitives-angular/toggle";
import { ToggleGroup } from "@fragiola/primitives-angular/toggle-group";
import {
    ToolbarButton,
    ToolbarInput,
    ToolbarRoot,
    ToolbarSeparator,
} from "@fragiola/primitives-angular/toolbar";
import { styles } from "./styles.ts";

const STYLES = [
    { value: "bold", label: "Bold" },
    { value: "italic", label: "Italic" },
    { value: "underline", label: "Underline" },
];

const ALIGNMENTS = [
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
    { value: "right", label: "Right" },
];

// A text-format toolbar: the text styles (several pressed) and the alignment (one pressed) are
// ToggleGroups whose toggles join the toolbar, which stays one tab stop; the arrow keys, Home and
// End move through every item, and the font size field keeps its caret keys until the caret
// reaches an end (spec/toolbar.md).
@Component({
    selector: "example-text-format-toolbar",
    imports: [
        Toggle,
        ToggleGroup,
        ToolbarRoot,
        ToolbarButton,
        ToolbarInput,
        ToolbarSeparator,
    ],
    template: `
        <div [class]="styles.stack">
            <div toolbarRoot aria-label="Text formatting" [class]="styles.root">
                <div toggleGroup aria-label="Text style" [multiple]="true" [(value)]="textStyle" [class]="styles.toggleGroup">
                    @for (entry of textStyles; track entry.value) {
                        <button toggle [value]="entry.value" [class]="styles.toggle">{{ entry.label }}</button>
                    }
                </div>
                <div toolbarSeparator [class]="styles.separator"></div>
                <div toggleGroup aria-label="Alignment" [(value)]="align" [class]="styles.toggleGroup">
                    @for (entry of alignments; track entry.value) {
                        <button toggle [value]="entry.value" [class]="styles.toggle">{{ entry.label }}</button>
                    }
                </div>
                <div toolbarSeparator [class]="styles.separator"></div>
                <button toolbarButton (click)="clear()" [class]="styles.button">Clear</button>
                <input toolbarInput aria-label="Font size" inputmode="numeric" [value]="size()" (input)="onSizeInput($event)" [class]="styles.input">
            </div>
            <p
                [attr.data-bold]="textStyle().includes('bold') ? '' : null"
                [attr.data-italic]="textStyle().includes('italic') ? '' : null"
                [attr.data-underline]="textStyle().includes('underline') ? '' : null"
                [attr.data-align]="align()[0] ?? 'start'"
                [style.font-size.px]="fontSize()"
                [class]="styles.preview"
            >Toolbars group the controls of a task in one tab stop.</p>
        </div>
    `,
})
export default class TextFormatToolbar {
    protected readonly styles = styles;
    protected readonly textStyles = STYLES;
    protected readonly alignments = ALIGNMENTS;
    protected readonly textStyle = signal<string[]>([]);
    protected readonly align = signal<string[]>(["left"]);
    protected readonly size = signal("16");
    protected readonly fontSize = computed(() =>
        Math.min(Math.max(Number(this.size()) || 16, 10), 32),
    );

    protected clear(): void {
        this.textStyle.set([]);
        this.align.set(["left"]);
        this.size.set("16");
    }

    protected onSizeInput(event: Event): void {
        this.size.set((event.target as HTMLInputElement).value);
    }
}
