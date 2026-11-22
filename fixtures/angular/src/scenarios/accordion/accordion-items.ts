/** An item of the accordion scenarios (spec/accordion.md). */
export interface Item {
    value: string;
    label: string;
    disabled: boolean;
}

export const ITEMS: Item[] = [
    { value: "shipping", label: "Shipping", disabled: false },
    { value: "returns", label: "Returns", disabled: false },
    { value: "support", label: "Support", disabled: false },
];

/**
 * The items of every accordion scenario: a Header holding a Trigger, then a Panel holding the
 * paragraph "<label> details". The scenarios repeat it in their templates (a component would add a
 * host element React's fragment has not); the paragraph is two text nodes, as JSX makes
 * `{item.label} details` (AGENTS.md, "Porting a framework").
 */
export const ITEM_TEMPLATE = `
    @for (item of items; track item.value) {
        <div accordionItem [value]="item.value" [disabled]="item.disabled" [class]="styles.item">
            <h3 accordionHeader [class]="styles.header">
                <button accordionTrigger [class]="styles.trigger">{{ item.label }}</button>
            </h3>
            <div *accordionPanel="{ hiddenUntilFound: hiddenUntilFound }" [class]="styles.panel"><p>@for (run of [item.label, " details"]; track $index) {<ng-container>{{ run }}</ng-container>}</p></div>
        </div>
    }
`;
