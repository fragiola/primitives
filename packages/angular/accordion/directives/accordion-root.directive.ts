import {
    booleanAttribute,
    computed,
    Directive,
    input,
    output,
} from "@angular/core";
import { accordionKeyTarget } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    type ChangeDetails,
    type ChangeReason,
    controllable,
    dataValues,
    injectHost,
    injectId,
    injectProvidedDirection,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";

export type AccordionOrientation = "horizontal" | "vertical";

export interface AccordionRootState {
    value: string[];
    disabled: boolean;
    orientation: AccordionOrientation;
}

const NONE: string[] = [];

/**
 * spec/accordion.md (the APG accordion): `<div accordionRoot [(value)]="open">`, holding
 * `[accordionItem]`s. The value is the open items' values, an array in every mode.
 */
@Directive({
    selector: "[accordionRoot]",
    exportAs: "accordionRoot",
    host: {
        "data-primitives-part": "accordion-root",
        "[attr.data-orientation]": "data().orientation",
        "[attr.data-disabled]": "data().disabled",
        "(keydown)": "onKeyDown($event)",
    },
})
export class AccordionRoot {
    /** The values of the open items. */
    readonly value = input<string[] | undefined>(undefined);
    readonly valueChange = output<string[]>();
    readonly defaultValue = input<string[]>(NONE);
    readonly valueChangeDetails = output<ValueChangeEvent<string[]>>();
    /** Several items may be open (default `false`). */
    readonly multiple = input(false, { transform: booleanAttribute });
    /** Every item is disabled. */
    readonly disabled = input(false, { transform: booleanAttribute });
    readonly orientation = input<AccordionOrientation>("vertical");
    /** Whether the arrow keys wrap from the last trigger to the first and back (default `true`). */
    readonly loopFocus = input(true, { transform: booleanAttribute });

    private readonly host = injectHost();
    /** A DirectionProvider's direction, else `null` (the computed one is read). */
    private readonly direction = injectProvidedDirection();
    private readonly own = controllable<string[], ChangeDetails>(
        this.value,
        this.valueChange,
        () => this.defaultValue(),
        (value, details) => this.valueChangeDetails.emit({ value, details }),
    );
    readonly baseId = injectId("primitives-accordion");
    readonly state = computed<AccordionRootState>(() => ({
        value: this.own.value(),
        disabled: this.disabled(),
        orientation: this.orientation(),
    }));
    protected readonly data = computed(() => {
        const { orientation, disabled } = this.state();
        return dataValues({ orientation, disabled });
    });

    /** Opens or closes an item; in single mode, opening one closes the open one. */
    toggle(item: string, open: boolean, reason: ChangeReason): void {
        const value = this.own.value();
        const next = open
            ? this.multiple()
                ? [...value.filter((entry) => entry !== item), item]
                : [item]
            : value.filter((entry) => entry !== item);
        this.own.set(next, { reason });
    }

    // A value may hold any character: it is encoded, so the ids hold no whitespace
    triggerId(value: string): string {
        return `${this.baseId}-trigger-${encodeURIComponent(value)}`;
    }

    panelId(value: string): string {
        return `${this.baseId}-panel-${encodeURIComponent(value)}`;
    }

    // the arrows, Home and End move among the enabled triggers (spec/accordion.md, "Keyboard")
    protected onKeyDown(event: KeyboardEvent): void {
        const root = this.host;
        const triggers = [
            ...root.querySelectorAll<HTMLButtonElement>(
                '[data-primitives-part="accordion-trigger"]',
            ),
        ].filter(
            (trigger) =>
                !trigger.disabled &&
                trigger.closest('[data-primitives-part="accordion-root"]') ===
                    root,
        );
        const current = triggers.indexOf(event.target as HTMLButtonElement);
        if (current === -1) {
            return;
        }
        const index = accordionKeyTarget(event.key, current, triggers.length, {
            orientation: this.orientation(),
            rtl: getDirection(root, this.direction()) === "rtl",
            loop: this.loopFocus(),
        });
        if (index === null) {
            return;
        }
        event.preventDefault();
        triggers[index]?.focus();
    }
}
