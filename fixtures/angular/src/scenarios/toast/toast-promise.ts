import { Component, ViewEncapsulation } from "@angular/core";
import { injectToastManager } from "@fragiola/primitives-angular/toast";
import { toast } from "examples-shared/recipes/toast";
import { TOAST_PARTS } from "./toast-parts.ts";

/** A save that settles 1 s later (on the page's clock). */
function save(fails: boolean): Promise<string> {
    return new Promise((resolve, reject) => {
        setTimeout(
            () => (fails ? reject(new Error("offline")) : resolve("ok")),
            1000,
        );
    });
}

/** spec/toast.md `/toast/promise`; the route's `<main>` is the Provider (`timeout` 2000). */
@Component({
    selector: "[scenario-toast-promise]",
    encapsulation: ViewEncapsulation.None,
    imports: [TOAST_PARTS],
    template: `
        <div class="flex gap-2">
            <button type="button" (click)="run(false)">Save file</button>
            <button type="button" (click)="run(true)">Save offline</button>
        </div>
        <ng-container *toastPortal>
            <div toastViewport aria-label="Notifications" [class]="styles.viewport">
                @for (item of manager.toasts(); track item.id) {
                    <div toastRoot [toast]="item" [class]="styles.root">
                        <h2 toastTitle [class]="styles.title">{{ item.title }}</h2>
                        <button toastClose [class]="styles.close">Dismiss</button>
                    </div>
                }
            </div>
        </ng-container>
    `,
})
export class ToastPromise {
    protected readonly styles = toast;
    protected readonly manager = injectToastManager();

    protected run(fails: boolean): void {
        this.manager
            .promise(save(fails), {
                loading: "Saving file",
                success: "File saved",
                error: (error) => `Could not save: ${(error as Error).message}`,
            })
            .catch(() => {});
    }
}
