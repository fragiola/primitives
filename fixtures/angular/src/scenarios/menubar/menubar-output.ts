import { computed, signal } from "@angular/core";
import type { OpenChangeEvent } from "@fragiola/primitives-angular/menu";

/** The open menu's name, the last reason and the last clicked item a menubar scenario prints. */
export class MenubarOutput {
    private readonly menu = signal<string | undefined>(undefined);
    private readonly reason = signal<string | undefined>(undefined);
    private readonly action = signal<string | undefined>(undefined);
    readonly values = computed(() => ({
        menu: this.menu(),
        reason: this.reason(),
        action: this.action(),
    }));

    /** A menu's open change: its name while open, back to none when the open one closes. */
    onOpenChange(name: string, event: OpenChangeEvent): void {
        this.menu.update((current) =>
            event.open ? name : current === name ? undefined : current,
        );
        this.reason.set(event.details.reason);
    }

    select(label: string): void {
        this.action.set(label);
    }
}
