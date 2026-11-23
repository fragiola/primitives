import { computed, Directive, inject } from "@angular/core";
import { dataValues } from "@fragiola/primitives-angular/internal";
import { HoverCardRoot } from "./hover-card-root.directive.ts";

/** Behind the card while it shows; takes no pointer (spec/hover-card.md): `<div hoverCardBackdrop>`. */
@Directive({
    selector: "[hoverCardBackdrop]",
    exportAs: "hoverCardBackdrop",
    host: {
        role: "presentation",
        "data-primitives-part": "hover-card-backdrop",
        "[attr.hidden]": "root.overlay.presence.mounted() ? null : ''",
        "[attr.data-open]": "data().open",
        "[attr.data-closed]": "data().closed",
        "[attr.data-starting-style]": "data()['starting-style']",
        "[attr.data-ending-style]": "data()['ending-style']",
        "[style.pointer-events]": "'none'",
    },
})
export class HoverCardBackdrop {
    protected readonly root = inject<HoverCardRoot>(HoverCardRoot);
    readonly state = computed(() => ({ open: this.root.overlay.open() }));
    protected readonly data = computed(() => {
        const status = this.root.overlay.presence.status();
        const open = this.state().open;
        return dataValues({
            open,
            closed: !open,
            "starting-style": status === "starting",
            "ending-style": status === "ending",
        });
    });
}
