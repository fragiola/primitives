import { computed, defineComponent, type PropType, provide, useId } from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { StepsKey, type StepsState } from "./steps-context.ts";

export interface StepsRootProps {
    /** The current step, from 0; `count` is the completed state (`v-model:step`). */
    step?: number;
    /** The step at first (default `0`). */
    defaultStep?: number;
    /** The number of steps. */
    count: number;
    /** A step can only be reached once every step before it is valid. */
    linear?: boolean;
    /** Whether a step is valid (default: every step), read at each render. */
    isStepValid?: (index: number) => boolean;
    orientation?: "horizontal" | "vertical";
}

export type StepsRootEmits = {
    /** The new step (`v-model:step`). */
    "update:step": (step: number) => true;
    /** Every step change, with its reason. */
    stepChange: (step: number, details: ChangeDetails) => true;
};

const ALWAYS_VALID = () => true;

/** A process in a fixed number of steps (spec/steps.md): it holds the step and the validation. */
export const StepsRoot: PartComponent<
    StepsRootProps,
    StepsState,
    StepsRootEmits
> = publicComponent(
    defineComponent({
        name: "StepsRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            step: { type: Number, default: undefined },
            defaultStep: { type: Number, default: 0 },
            count: { type: Number, required: true },
            linear: { type: Boolean, default: false },
            isStepValid: {
                type: Function as PropType<(index: number) => boolean>,
                default: undefined,
            },
            orientation: {
                type: String as PropType<"horizontal" | "vertical">,
                default: "horizontal",
            },
        },
        emits: {
            "update:step": (_step: number) => true,
            stepChange: (_step: number, _details: ChangeDetails) => true,
        },
        setup(props, { attrs, slots, emit }) {
            const own = useControllable<number, ChangeDetails>(
                () => props.step,
                props.defaultStep,
                (next, details) => {
                    emit("update:step", next);
                    emit("stepChange", next, details);
                },
            );
            const count = computed(() => Math.max(0, Math.floor(props.count)));
            const step = computed(() =>
                Math.min(count.value, Math.max(0, Math.floor(own.value.value))),
            );
            const state = (): StepsState => ({
                step: step.value,
                count: count.value,
                completed: step.value === count.value,
                orientation: props.orientation,
            });
            provide(StepsKey, {
                state,
                linear: () => props.linear,
                isStepValid: (index) =>
                    (props.isStepValid ?? ALWAYS_VALID)(index),
                baseId: useId(),
                setStep: (next, details) => {
                    const target = Math.min(count.value, Math.max(0, next));
                    if (target !== step.value) {
                        own.set(target, details);
                    }
                },
            });
            return () => {
                const current = state();
                return renderPart("div", { attrs, slots }, props.as, current, {
                    "data-primitives-part": "steps-root",
                    ...stateAttributes({
                        orientation: current.orientation,
                        completed: current.completed,
                    }),
                });
            };
        },
    }),
);
