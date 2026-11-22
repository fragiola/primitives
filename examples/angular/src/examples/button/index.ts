import { Component, DestroyRef, inject, signal } from "@angular/core";
import { Button } from "@fragiola/primitives-angular/button";
import { styles } from "./styles.ts";

// Publish a post: "Publish" stays focusable while it is busy (`focusableWhenDisabled`), so the
// keyboard does not lose its place; "Archive" is a `span` that behaves as a button
// (`[nativeButton]="false"`): Enter and Space press it (spec/button.md).
@Component({
    selector: "example-publish-post",
    imports: [Button],
    template: `
        <div [class]="styles.stack">
            <div [class]="styles.row">
                <button button [disabled]="busy()" [focusableWhenDisabled]="true" (click)="publish()" [class]="styles.root">Publish</button>
                <span button [nativeButton]="false" [disabled]="busy()" (click)="status.set('Archived.')" [class]="styles.root">Archive</span>
            </div>
            <p role="status" [class]="styles.status">{{ status() }}</p>
        </div>
    `,
})
export default class PublishPost {
    protected readonly styles = styles;
    protected readonly busy = signal(false);
    protected readonly status = signal("Draft.");
    private timer: ReturnType<typeof setTimeout> | undefined;

    constructor() {
        inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
    }

    protected publish(): void {
        this.busy.set(true);
        this.status.set("Publishing…");
        this.timer = setTimeout(() => {
            this.busy.set(false);
            this.status.set("Published.");
        }, 1000);
    }
}
