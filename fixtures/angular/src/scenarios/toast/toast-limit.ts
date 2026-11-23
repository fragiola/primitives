import { Component, ViewEncapsulation } from "@angular/core";
import { injectToastManager } from "@fragiola/primitives-angular/toast";
import { toast } from "examples-shared/recipes/toast";
import { TOAST_PARTS } from "./toast-parts.ts";

/** spec/toast.md `/toast/limit`; the route's `<main>` is the Provider (`limit` 2, `timeout` 0). */
@Component({
    selector: "[scenario-toast-limit]",
    encapsulation: ViewEncapsulation.None,
    imports: [TOAST_PARTS],
    template: `
        <button type="button" (click)="notify()">Notify</button>
        <ng-container *toastPortal>
            <div toastViewport aria-label="Notifications" [class]="styles.viewport">
                @for (item of manager.toasts(); track item.id) {
                    <div toastRoot [toast]="item" [class]="styles.root">
                        <h2 toastTitle [class]="styles.title">{{ item.title }}</h2>
                        <p toastDescription [class]="styles.description">{{ item.description }}</p>
                        <button toastClose [class]="styles.close">Dismiss</button>
                    </div>
                }
            </div>
        </ng-container>
    `,
})
export class ToastLimit {
    protected readonly styles = toast;
    protected readonly manager = injectToastManager();
    private count = 0;

    protected notify(): void {
        this.count += 1;
        this.manager.add({
            title: `Notification ${this.count}`,
            description: `Message ${this.count}`,
        });
    }
}
