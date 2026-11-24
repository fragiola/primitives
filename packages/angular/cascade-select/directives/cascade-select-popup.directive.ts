import { computed, Directive, inject } from "@angular/core";
import {
    dataValues,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { CascadeSelectRoot } from "./cascade-select-root.directive.ts";

/** The floating container of the levels (no role of its own; spec/cascade-select.md): `<div cascadeSelectPopup>`. */
@Directive({
    selector: "[cascadeSelectPopup]",
    exportAs: "cascadeSelectPopup",
    host: {
        "data-primitives-part": "cascade-select-popup",
        "[attr.data-open]": "data().open",
        "[attr.data-closed]": "data().closed",
        "[attr.data-side]": "data().side",
        "[attr.data-align]": "data().align",
        "[attr.data-starting-style]": "data()['starting-style']",
        "[attr.data-ending-style]": "data()['ending-style']",
    },
})
export class CascadeSelectPopup {
    private readonly root = inject(CascadeSelectRoot);
    readonly state = computed(() => ({
        open: this.root.overlay.open(),
        ...this.root.placed(),
    }));
    protected readonly data = computed(() => {
        const status = this.root.overlay.presence.status();
        const state = this.state();
        return dataValues({
            ...state,
            closed: !state.open,
            "starting-style": status === "starting",
            "ending-style": status === "ending",
        });
    });

    constructor() {
        registerHost(this.root.overlay.popup);
    }
}
