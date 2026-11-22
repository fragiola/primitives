import { computed, signal } from "@angular/core";
import type { OpenChangeEvent } from "@fragiola/primitives-angular/dialog";

/**
 * What every lifecycle scenario prints and does (spec/README.md, "The lifecycle scenarios"): the
 * open state that happened, the last reason, `(openChangeComplete)`'s last value, and, with
 * `?cancel`, the reason of the last close it canceled. React's `useLifecycle`.
 */
export class Lifecycle {
    private readonly open = signal(false);
    private readonly reason = signal<string | undefined>(undefined);
    private readonly complete = signal<boolean | undefined>(undefined);
    private readonly canceled = signal<string | undefined>(undefined);
    readonly values = computed(() => ({
        open: this.open(),
        reason: this.reason(),
        complete: this.complete(),
        canceled: this.canceled(),
    }));

    private readonly cancel: () => boolean;

    /** `cancel`: whether the page has `?cancel` (read on each change). */
    constructor(cancel: () => boolean) {
        this.cancel = cancel;
    }

    onOpenChange(event: OpenChangeEvent): void {
        this.reason.set(event.details.reason);
        if (this.cancel() && !event.open) {
            event.details.cancel();
            this.canceled.set(event.details.reason);
            return;
        }
        this.open.set(event.open);
    }

    onOpenChangeComplete(open: boolean): void {
        this.complete.set(open);
    }
}
