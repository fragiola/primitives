import {
    afterRenderEffect,
    booleanAttribute,
    computed,
    Directive,
    input,
    output,
    signal,
    untracked,
} from "@angular/core";
import { createId } from "@fragiola/primitives/id";
import type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
import {
    controllable,
    dataValues,
} from "@fragiola/primitives-angular/internal";

export interface TabInfo {
    value: string;
    disabled: boolean;
}

export interface TabsRootState {
    orientation: "horizontal" | "vertical";
    activation: "automatic" | "manual";
}

/** spec/tabs.md: `<div tabsRoot [(value)]="value">`. */
@Directive({
    selector: "[tabsRoot]",
    exportAs: "tabsRoot",
    host: {
        "data-primitives-part": "tabs-root",
        "[attr.data-orientation]": "data().orientation",
        "[attr.data-activation]": "data().activation",
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
    readonly baseId = createId("primitives-tabs");
    readonly tabs = new Map<HTMLElement, TabInfo>();
    readonly list = signal<HTMLElement | null>(null);
    /** Bumped when a tab registers, so the roving tabindex and the indicator follow. */
    readonly version = signal(0);
    readonly state = computed<TabsRootState>(() => ({
        orientation: this.orientation(),
        activation: this.activation(),
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
    }

    // A value may hold any character (`"my account"`): it is encoded, so the id holds no
    // whitespace and `aria-controls` / `aria-labelledby` (lists of ids) still name one element.
    tabId(value: string): string {
        return `${this.baseId}-tab-${encodeURIComponent(value)}`;
    }

    panelId(value: string): string {
        return `${this.baseId}-panel-${encodeURIComponent(value)}`;
    }
}
