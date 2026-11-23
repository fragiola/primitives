import {
    afterRenderEffect,
    booleanAttribute,
    computed,
    Directive,
    input,
    linkedSignal,
    output,
    signal,
    untracked,
} from "@angular/core";
import {
    type ActivationDirection,
    activationDirection,
} from "@fragiola/primitives/collection";
import type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
import {
    controllable,
    dataValues,
    injectId,
} from "@fragiola/primitives-angular/internal";

export interface TabInfo {
    value: string;
    disabled: boolean;
}

export type { ActivationDirection };

export interface TabsRootState {
    orientation: "horizontal" | "vertical";
    activation: "automatic" | "manual";
    activationDirection: ActivationDirection;
}

/** spec/tabs.md: `<div tabsRoot [(value)]="value">`. */
@Directive({
    selector: "[tabsRoot]",
    exportAs: "tabsRoot",
    host: {
        "data-primitives-part": "tabs-root",
        "[attr.data-orientation]": "data().orientation",
        "[attr.data-activation]": "data().activation",
        "[attr.data-activation-direction]": "data().activationDirection",
    },
})
export class TabsRoot {
    readonly value = input<string | undefined>(undefined);
    readonly valueChange = output<string>();
    /** Default: the first enabled tab. */
    readonly defaultValue = input<string | undefined>(undefined);
    readonly valueChangeDetails = output<ValueChangeEvent<string>>();
    readonly orientation = input<"horizontal" | "vertical">("horizontal");
    /** `automatic`: moving focus selects; `manual`: Enter or Space selects. */
    readonly activation = input<"automatic" | "manual">("automatic");
    /** Whether the arrow keys wrap from the last tab to the first and back. */
    readonly loopFocus = input(true, { transform: booleanAttribute });

    private readonly selection = controllable<
        string | undefined,
        ChangeDetails
    >(
        this.value,
        this.valueChange,
        () => this.defaultValue(),
        (value, details) =>
            this.valueChangeDetails.emit({ value: value ?? "", details }),
    );
    /** The selected tab's value. */
    readonly selected = this.selection.value;
    readonly baseId = injectId("primitives-tabs");
    readonly tabs = new Map<HTMLElement, TabInfo>();
    readonly list = signal<HTMLElement | null>(null);
    /** Bumped when a tab registers, so the roving tabindex and the indicator follow. */
    readonly version = signal(0);
    /**
     * Where the selected tab sits from the one selected before it (spec/tabs.md,
     * `data-activation-direction`): derived from the selection, so the render that selects a tab
     * (and its panel's first frame) already carries it. Measured on the page, before that render
     * (the tabs do not move when the selection changes), and read at each `select` so every step
     * is measured from the one before it.
     */
    readonly activationDirection = linkedSignal<
        string | undefined,
        ActivationDirection
    >({
        source: this.selected,
        computation: (value, previous) =>
            previous === undefined
                ? "none"
                : untracked(() =>
                      activationDirection(
                          this.tabElement(previous.source),
                          this.tabElement(value),
                          this.orientation(),
                      ),
                  ),
    });
    readonly state = computed<TabsRootState>(() => ({
        orientation: this.orientation(),
        activation: this.activation(),
        activationDirection: this.activationDirection(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));

    constructor() {
        // no value: the first enabled tab, once the tabs are known
        afterRenderEffect(() => {
            this.version();
            const list = this.list();
            if (this.selected() !== undefined || list === null) {
                return;
            }
            untracked(() => {
                const first = [
                    ...list.querySelectorAll<HTMLElement>('[role="tab"]'),
                ]
                    .map((element) => this.tabs.get(element))
                    .find((info) => info !== undefined && !info.disabled);
                if (first) {
                    this.select(first.value, "none");
                }
            });
        });
    }

    select(value: string, reason: ChangeReason): void {
        this.selection.set(value, { reason });
        // measured at each step, not when a render first reads it: two keys handled before one
        // render give the last step's direction (Epic #49, spec/tabs.md `data-activation-direction`)
        untracked(this.activationDirection);
    }

    // A value may hold any character (`"my account"`): it is encoded, so the id holds no
    // whitespace and `aria-controls` / `aria-labelledby` (lists of ids) still name one element.
    tabId(value: string): string {
        return `${this.baseId}-tab-${encodeURIComponent(value)}`;
    }

    private tabElement(value: string | undefined): HTMLElement | null {
        if (value === undefined) {
            return null;
        }
        return (
            this.list()?.ownerDocument.getElementById(this.tabId(value)) ?? null
        );
    }

    panelId(value: string): string {
        return `${this.baseId}-panel-${encodeURIComponent(value)}`;
    }
}
