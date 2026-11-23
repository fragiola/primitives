import {
    booleanAttribute,
    computed,
    Directive,
    input,
    numberAttribute,
    output,
} from "@angular/core";
import {
    type ChangeDetails,
    controllable,
    dataValues,
    injectId,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";

/** What the Root renders with (spec/steps.md). */
export interface StepsState {
    /** The current step, from 0; `count` once completed. */
    step: number;
    count: number;
    /** Every step is done. */
    completed: boolean;
    orientation: "horizontal" | "vertical";
}

/** What a step's parts render with: its index and where it is from the current step. */
export interface StepsItemState {
    index: number;
    current: boolean;
    completed: boolean;
    incomplete: boolean;
    /** The step cannot be reached (spec/steps.md, "Which steps can be reached"). */
    disabled: boolean;
    orientation: "horizontal" | "vertical";
}

/** A number input that may be left unset. */
function optionalNumber(value: unknown): number | undefined {
    return value === undefined || value === null || value === ""
        ? undefined
        : numberAttribute(value);
}

const ALWAYS_VALID = () => true;

/**
 * A process in a fixed number of steps (spec/steps.md): `<div stepsRoot [count]="3"
 * [(step)]="step">`. It holds the step and the validation (`linear`, `[isStepValid]`).
 */
@Directive({
    selector: "[stepsRoot]",
    exportAs: "stepsRoot",
    host: {
        "data-primitives-part": "steps-root",
        "[attr.data-orientation]": "data().orientation",
        "[attr.data-completed]": "data().completed",
    },
})
export class StepsRoot {
    /** The current step, from 0; `count` is the completed state (controlled: `[(step)]`). */
    readonly step = input<number | undefined, unknown>(undefined, {
        transform: optionalNumber,
    });
    /** Its new step (`[(step)]`). */
    readonly stepChange = output<number>();
    /** The step at first (default `0`). */
    readonly defaultStep = input(0, { transform: numberAttribute });
    /** Every step change, with its reason. */
    readonly stepChangeDetails = output<ValueChangeEvent<number>>();
    /** The number of steps. */
    readonly count = input.required({ transform: numberAttribute });
    /** A step can only be reached once every step before it is valid. */
    readonly linear = input(false, { transform: booleanAttribute });
    /** Whether a step is valid (default: every step), read at each render. */
    readonly isStepValid = input<(index: number) => boolean>(ALWAYS_VALID);
    readonly orientation = input<"horizontal" | "vertical">("horizontal");

    readonly baseId = injectId("primitives-steps");
    /** The number of steps, a whole number from 0. */
    readonly stepCount = computed(() => Math.max(0, Math.floor(this.count())));
    private readonly own = controllable<number, ChangeDetails>(
        this.step,
        this.stepChange,
        () => this.defaultStep(),
        (value, details) => this.stepChangeDetails.emit({ value, details }),
    );
    /** The current step, clamped to `[0, count]`. */
    readonly currentStep = computed(() =>
        Math.min(this.stepCount(), Math.max(0, Math.floor(this.own.value()))),
    );
    readonly state = computed<StepsState>(() => ({
        step: this.currentStep(),
        count: this.stepCount(),
        completed: this.currentStep() === this.stepCount(),
        orientation: this.orientation(),
    }));
    protected readonly data = computed(() =>
        dataValues({
            orientation: this.state().orientation,
            completed: this.state().completed,
        }),
    );

    /** Whether a step can be reached from the current one (spec/steps.md). */
    reachable(index: number): boolean {
        if (index <= this.currentStep() || !this.linear()) {
            return true;
        }
        const valid = this.isStepValid();
        for (let before = 0; before < index; before++) {
            if (!valid(before)) {
                return false;
            }
        }
        return true;
    }

    /** A step's state. */
    itemState(index: number): StepsItemState {
        const step = this.currentStep();
        return {
            index,
            current: index === step,
            completed: index < step,
            incomplete: index > step,
            disabled: !this.reachable(index),
            orientation: this.orientation(),
        };
    }

    /** A step's Content id, which its Trigger controls. */
    contentId(index: number): string {
        return `${this.baseId}-content-${index}`;
    }

    /** Moves to `step` (clamped), unless it is the current one. */
    setStep(step: number, details: ChangeDetails): void {
        const target = Math.min(this.stepCount(), Math.max(0, step));
        if (target !== this.currentStep()) {
            this.own.set(target, details);
        }
    }
}
