import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
    output,
} from "@angular/core";
import type { RovingOrientation } from "@fragiola/primitives/collection";
import {
    type ChangeDetails,
    controllable,
    dataValues,
    injectRovingComposite,
    ROVING_SCOPE,
    type RovingScope,
    TOGGLE_GROUP,
    type ToggleGroupContext,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";

export interface ToggleGroupState {
    value: string[];
    disabled: boolean;
    multiple: boolean;
    orientation: RovingOrientation;
}

const NONE: readonly string[] = [];

/**
 * Toggles sharing one value (spec/toggle-group.md, Base UI's ToggleGroup with the APG toolbar's
 * keys): `<div toggleGroup [(value)]="styles" multiple>`, its `[toggle]`s each with a `value`. One
 * tab stop, the arrows move the focus. Inside a Toolbar it opens no roving focus of its own: its
 * Toggles are the toolbar's items (spec/toolbar.md, "Nested composites").
 */
@Directive({
    selector: "[toggleGroup]",
    exportAs: "toggleGroup",
    providers: [
        {
            provide: TOGGLE_GROUP,
            useFactory: () => inject(ToggleGroup).context,
        },
        { provide: ROVING_SCOPE, useFactory: () => inject(ToggleGroup).scope },
    ],
    host: {
        role: "group",
        "data-primitives-part": "toggle-group-root",
        "[attr.data-orientation]": "data().orientation",
        "[attr.data-multiple]": "data().multiple",
        "[attr.data-disabled]": "data().disabled",
        "(keydown)": "own?.keydown($event)",
    },
})
export class ToggleGroup {
    /** The values of the pressed toggles (controlled). */
    readonly value = input<readonly string[] | undefined>(undefined);
    readonly valueChange = output<string[]>();
    /** The values pressed at first (default `[]`). */
    readonly defaultValue = input<readonly string[]>(NONE);
    /** Every change of the pressed values (reason `none`). */
    readonly valueChangeDetails = output<ValueChangeEvent<string[]>>();
    /** Several toggles may be pressed (default `false`). */
    readonly multiple = input(false, { transform: booleanAttribute });
    /** Every toggle is disabled. */
    readonly disabled = input(false, { transform: booleanAttribute });
    /** The arrow keys' axis (default `"horizontal"`); a Toolbar's inside one. */
    readonly orientation = input<RovingOrientation>("horizontal");
    /** The arrows wrap from the last toggle to the first and back (default `true`). */
    readonly loopFocus = input(true, { transform: booleanAttribute });

    private readonly outer = inject(ROVING_SCOPE, {
        optional: true,
        skipSelf: true,
    });
    /** Its own roving focus, with no Toolbar around it; inside one, the toolbar handles the keys. */
    protected readonly own =
        this.outer === null
            ? injectRovingComposite({
                  orientation: this.orientation,
                  loopFocus: this.loopFocus,
                  disabled: () => false,
              })
            : null;
    /** The scope its Toggles register with: its own, or the Toolbar's. */
    readonly scope: RovingScope = this.outer ?? (this.own as RovingScope);

    private readonly selection = controllable<readonly string[], ChangeDetails>(
        this.value,
        { emit: (next) => this.valueChange.emit([...next]) },
        () => this.defaultValue(),
        (value, details) =>
            this.valueChangeDetails.emit({ value: [...value], details }),
    );
    private readonly isDisabled = computed(
        () => this.disabled() || (this.outer?.disabled() ?? false),
    );
    readonly state = computed<ToggleGroupState>(() => ({
        value: [...this.selection.value()],
        disabled: this.isDisabled(),
        multiple: this.multiple(),
        orientation: this.outer?.orientation() ?? this.orientation(),
    }));
    protected readonly data = computed(() =>
        dataValues({
            orientation: this.state().orientation,
            multiple: this.state().multiple,
            disabled: this.state().disabled,
        }),
    );

    /** What its Toggles read (`TOGGLE_GROUP`). */
    readonly context: ToggleGroupContext = {
        value: this.selection.value,
        disabled: this.isDisabled,
        setPressed: (item, pressed, details) => {
            const value = this.selection.value();
            const others = value.filter((entry) => entry !== item);
            const next = pressed
                ? this.multiple()
                    ? [...others, item]
                    : [item]
                : others;
            this.selection.set(next, details);
        },
    };
}
