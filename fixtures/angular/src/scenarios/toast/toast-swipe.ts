import { Component, computed, ViewEncapsulation } from "@angular/core";
import { injectToastManager } from "@fragiola/primitives-angular/toast";
import { toast } from "examples-shared/recipes/toast";
import { Output } from "../../kit/output.ts";
import { TOAST_PARTS } from "./toast-parts.ts";

/** spec/toast.md `/toast/swipe`; the route's `<main>` is the Provider (`timeout` 0). */
@Component({
    selector: "[scenario-toast-swipe]",
    encapsulation: ViewEncapsulation.None,
    imports: [TOAST_PARTS, Output],
    template: `
        <button type="button" (click)="notify()">Notify</button>
        <ng-container *toastPortal>
            <div toastViewport aria-label="Notifications" [class]="styles.viewport">
                @for (item of manager.toasts(); track item.id) {
                    <div toastRoot [toast]="item" swipeDirection="right" [class]="styles.root">
                        <h2 toastTitle [class]="styles.title">{{ item.title }}</h2>
                        <p toastDescription [class]="styles.description">{{ item.description }}</p>
                        <button toastClose [class]="styles.close">Dismiss</button>
                    </div>
                }
            </div>
        </ng-container>
        <pre fixtureOutput [values]="{ toasts: count() }"></pre>
    `,
})
export class ToastSwipe {
    protected readonly styles = toast;
    protected readonly manager = injectToastManager();
    protected readonly count = computed(
        () => this.manager.toasts().filter((item) => !item.closing).length,
    );

    protected notify(): void {
        this.manager.add({ title: "Swipe me", description: "Drag to dismiss" });
    }
}
