import { computed, Directive, effect, inject, input } from "@angular/core";
import {
    createPanelTransition,
    dataAttributes,
    type PanelOptions,
    panelOptions,
    type TransitionStatus,
    writeAttributes,
    writeVariables,
} from "@fragiola/primitives-angular/internal";
import { AccordionItem } from "./accordion-item.directive.ts";
import type { AccordionOrientation } from "./accordion-root.directive.ts";

export type AccordionPanelOptions = PanelOptions;

export interface AccordionPanelState {
    open: boolean;
    disabled: boolean;
    orientation: AccordionOrientation;
    transitionStatus: TransitionStatus;
}

/**
 * A section's content, a `region` named by its Trigger (spec/accordion.md). Structural, as a
 * Collapsible's panel: `<div *accordionPanel>`, `*accordionPanel="{ keepMounted: true }"` or
 * `*accordionPanel="{ hiddenUntilFound: true }"`. The directive writes the panel's attributes and
 * its size variables (`--accordion-panel-height`, `--accordion-panel-width`) on the element it
 * renders.
 */
@Directive({ selector: "[accordionPanel]", exportAs: "accordionPanel" })
export class AccordionPanel {
    private readonly item = inject(AccordionItem);
    /** `keepMounted`, `hiddenUntilFound` (default `false`); `*accordionPanel` alone: none. */
    readonly options = input<AccordionPanelOptions, unknown>(
        {},
        { alias: "accordionPanel", transform: panelOptions },
    );
    private readonly panel = createPanelTransition({
        open: computed(() => this.item.state().open),
        prefix: "accordion",
        options: this.options,
        onFound: () => this.item.setOpen(true, "none"),
    });
    readonly state = computed<AccordionPanelState>(() => ({
        ...this.item.state(),
        transitionStatus: this.panel.status(),
    }));

    constructor() {
        const panel = this.panel;
        effect(() => {
            const element = panel.element();
            if (element === null) {
                return;
            }
            const state = this.state();
            writeAttributes(element, {
                role: "region",
                id: this.item.panelId(),
                "aria-labelledby": this.item.triggerId(),
                hidden: panel.hidden(),
                "data-primitives-part": "accordion-panel",
                ...dataAttributes({
                    open: state.open,
                    closed: !state.open,
                    disabled: state.disabled,
                    orientation: state.orientation,
                    "starting-style": state.transitionStatus === "starting",
                    "ending-style": state.transitionStatus === "ending",
                }),
            });
            writeVariables(element, panel.variables());
        });
    }
}
