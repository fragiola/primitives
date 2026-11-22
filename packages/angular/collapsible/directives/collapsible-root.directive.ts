import {
    booleanAttribute,
    computed,
    Directive,
    input,
    output,
} from "@angular/core";
import {
    type ChangeDetails,
    type ChangeReason,
    controllable,
    dataValues,
    injectId,
    type OpenChangeEvent,
} from "@fragiola/primitives-angular/internal";

export interface CollapsibleState {
    open: boolean;
    disabled: boolean;
}

/** `data-open` / `data-closed` (exactly one) and `data-disabled` (spec/collapsible.md). */
export function collapsibleAttributes(state: CollapsibleState) {
    return dataValues({
        open: state.open,
        closed: !state.open,
        disabled: state.disabled,
    });
}

/**
 * spec/collapsible.md (the APG disclosure): `<div collapsibleRoot [(open)]="open">`, holding a
 * `[collapsibleTrigger]` and a `*collapsiblePanel`.
 */
@Directive({
    selector: "[collapsibleRoot]",
    exportAs: "collapsibleRoot",
    host: {
        "data-primitives-part": "collapsible-root",
        "[attr.data-open]": "data().open",
        "[attr.data-closed]": "data().closed",
        "[attr.data-disabled]": "data().disabled",
    },
})
export class CollapsibleRoot {
    readonly open = input<boolean | undefined>(undefined);
    readonly openChange = output<boolean>();
    readonly defaultOpen = input(false, { transform: booleanAttribute });
    readonly openChangeDetails = output<OpenChangeEvent<ChangeDetails>>();
    /** Nothing but a bound `open` opens or closes it (default `false`). */
    readonly disabled = input(false, { transform: booleanAttribute });

    private readonly own = controllable<boolean, ChangeDetails>(
        this.open,
        this.openChange,
        () => this.defaultOpen(),
        (open, details) => this.openChangeDetails.emit({ open, details }),
    );
    /** The Panel's id, which the Trigger's `aria-controls` names. */
    readonly panelId = `${injectId("primitives-collapsible")}-panel`;
    readonly state = computed<CollapsibleState>(() => ({
        open: this.own.value(),
        disabled: this.disabled(),
    }));
    protected readonly data = computed(() =>
        collapsibleAttributes(this.state()),
    );

    setOpen(open: boolean, reason: ChangeReason): void {
        this.own.set(open, { reason });
    }
}
