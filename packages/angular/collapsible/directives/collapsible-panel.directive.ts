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
import { CollapsibleRoot } from "./collapsible-root.directive.ts";

export type CollapsiblePanelOptions = PanelOptions;

export interface CollapsiblePanelState {
    open: boolean;
    disabled: boolean;
    transitionStatus: TransitionStatus;
}

/**
 * The content shown and hidden, animatable with no layout jump (spec/collapsible.md). Structural,
 * as a Tab's panel, since a closed panel is not rendered: `<div *collapsiblePanel>`, or
 * `*collapsiblePanel="{ keepMounted: true }"` to keep it, `hidden`, or
 * `*collapsiblePanel="{ hiddenUntilFound: true }"` to keep it `hidden="until-found"`, so
 * find-in-page opens it. The directive writes the panel's attributes and its size variables
 * (`--collapsible-panel-height`, `--collapsible-panel-width`) on the element it renders.
 */
@Directive({ selector: "[collapsiblePanel]", exportAs: "collapsiblePanel" })
export class CollapsiblePanel {
    private readonly root = inject(CollapsibleRoot);
    /** `keepMounted`, `hiddenUntilFound` (default `false`); `*collapsiblePanel` alone: none. */
    readonly options = input<CollapsiblePanelOptions, unknown>(
        {},
        { alias: "collapsiblePanel", transform: panelOptions },
    );
    private readonly panel = createPanelTransition({
        open: computed(() => this.root.state().open),
        prefix: "collapsible",
        options: this.options,
        onFound: () => this.root.setOpen(true, "none"),
    });
    readonly state = computed<CollapsiblePanelState>(() => ({
        ...this.root.state(),
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
                id: this.root.panelId,
                hidden: panel.hidden(),
                "data-primitives-part": "collapsible-panel",
                ...dataAttributes({
                    open: state.open,
                    closed: !state.open,
                    disabled: state.disabled,
                    "starting-style": state.transitionStatus === "starting",
                    "ending-style": state.transitionStatus === "ending",
                }),
            });
            writeVariables(element, panel.variables());
        });
    }
}
