import { Component, computed, signal, ViewEncapsulation } from "@angular/core";
import { injectToastManager } from "@fragiola/primitives-angular/toast";
import { toast } from "examples-shared/recipes/toast";
import { Output } from "../../kit/output.ts";
import { TOAST_PARTS } from "./toast-parts.ts";
import { notifications } from "./toast-queue.ts";

/**
 * spec/toast.md `/toast/basic`: the module's queue, and the Provider's through the hook. The
 * route puts `toastProvider [toastManager]="notifications"` on the scenario's `<main>`.
 */
@Component({
    selector: "[scenario-toast-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [TOAST_PARTS, Output],
    template: `
        <div class="flex gap-2">
            <button type="button">Before</button>
            <button type="button" (click)="showToast()">Show toast</button>
            <button type="button" (click)="showAlert()">Show alert</button>
            <button type="button" (click)="manager.close()">Close all</button>
        </div>
        <ng-container *toastPortal>
            <div toastViewport aria-label="Notifications" [class]="styles.viewport">
                @for (item of manager.toasts(); track item.id) {
                    <div toastRoot [toast]="item" [class]="styles.root">
                        <h2 toastTitle [class]="styles.title">{{ item.title }}</h2>
                        <p toastDescription [class]="styles.description">{{ item.description }}</p>
                        <button toastAction [class]="styles.action" (click)="undo(item.id, item.title)">Undo</button>
                        <button toastClose [class]="styles.close">Dismiss</button>
                    </div>
                }
            </div>
        </ng-container>
        <pre fixtureOutput [values]="{ toasts: count(), closed: closed(), action: action() }"></pre>
    `,
})
export class ToastBasic {
    protected readonly styles = toast;
    protected readonly manager = injectToastManager();
    protected readonly closed = signal<string | undefined>(undefined);
    protected readonly action = signal<string | undefined>(undefined);
    protected readonly count = computed(
        () => this.manager.toasts().filter((item) => !item.closing).length,
    );

    protected showToast(): void {
        notifications.add({
            title: "Saved",
            description: "Your draft was saved.",
            onClose: () => this.closed.set("Saved"),
        });
    }

    protected showAlert(): void {
        this.manager.add({
            title: "Connection lost",
            description: "Retrying in 5 seconds.",
            priority: "high",
            onClose: () => this.closed.set("Connection lost"),
        });
    }

    protected undo(id: string, title: string | undefined): void {
        this.action.set(title);
        this.manager.close(id);
    }
}
