import { Component, ViewEncapsulation } from "@angular/core";
import { Separator } from "@fragiola/primitives-angular/separator";
import { separator } from "examples-shared/recipes/separator";

/** A horizontal, a vertical and a decorative separator (spec/separator.md). */
@Component({
    selector: "[scenario-separator-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [Separator],
    template: `
        <div class="flex w-64 flex-col gap-3 text-sm">
            <p>Account settings</p>
            <div separator [class]="styles.root"></div>
            <p>Danger zone</p>
            <div class="flex items-center gap-3">
                <a href="#docs">Docs</a>
                <div separator [orientation]="'vertical'" [class]="styles.root"></div>
                <a href="#blog">Blog</a>
            </div>
            <div separator [decorative]="true" [class]="styles.root"></div>
        </div>
    `,
})
export class SeparatorBasic {
    protected readonly styles = separator;
}
