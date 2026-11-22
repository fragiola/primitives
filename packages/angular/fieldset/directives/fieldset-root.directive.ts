import {
    booleanAttribute,
    computed,
    Directive,
    forwardRef,
    inject,
    input,
    signal,
} from "@angular/core";
import {
    FIELDSET_CONTEXT,
    type FieldsetContext,
} from "@fragiola/primitives-angular/field";
import { dataValue } from "@fragiola/primitives-angular/internal";

export interface FieldsetState {
    disabled: boolean;
}

/**
 * Groups fields under a legend and disables them together (spec/fieldset.md), on the consumer's
 * own `<fieldset>`: `<fieldset fieldsetRoot [disabled]="locked">`. A Fieldset inside a disabled
 * one is disabled too; the Fields inside it read it by injection.
 */
@Directive({
    selector: "[fieldsetRoot]",
    exportAs: "fieldsetRoot",
    providers: [
        {
            provide: FIELDSET_CONTEXT,
            useFactory: (): FieldsetContext => ({
                disabled: inject(forwardRef(() => FieldsetRoot)).isDisabled,
            }),
        },
    ],
    host: {
        "data-primitives-part": "fieldset-root",
        "[attr.aria-labelledby]": "legendId() ?? null",
        "[attr.disabled]": "dataDisabled()",
        "[attr.data-disabled]": "dataDisabled()",
    },
})
export class FieldsetRoot {
    readonly disabled = input(false, { transform: booleanAttribute });

    private readonly parent = inject(FIELDSET_CONTEXT, {
        optional: true,
        skipSelf: true,
    });
    /** Its own `disabled`, or an enclosing Fieldset's. */
    readonly isDisabled = computed(
        () => this.disabled() || (this.parent?.disabled() ?? false),
    );
    /** The Legend's id while one is rendered: the Root's `aria-labelledby`. */
    readonly legendId = signal<string | undefined>(undefined);
    readonly state = computed<FieldsetState>(() => ({
        disabled: this.isDisabled(),
    }));
    protected readonly dataDisabled = computed(() =>
        dataValue(this.isDisabled()),
    );
}
