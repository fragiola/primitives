import { accordionKeyTarget } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import { computed, defineComponent, type PropType, provide, useId } from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import { useProvidedDirection } from "../../direction/direction-context.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    AccordionKey,
    type AccordionOrientation,
    type AccordionRootState,
} from "./accordion-context.ts";

export interface AccordionRootProps {
    /** The values of the open items. */
    value?: readonly string[];
    defaultValue?: readonly string[];
    /** Several items may be open (default `false`). */
    multiple?: boolean;
    disabled?: boolean;
    orientation?: AccordionOrientation;
    /** Whether the arrow keys wrap from the last trigger to the first and back (default `true`). */
    loopFocus?: boolean;
}

export type AccordionRootEmits = {
    "update:value": (value: string[]) => true;
    valueChange: (value: string[], details: ChangeDetails) => true;
};

/** spec/accordion.md (the APG accordion, `v-model:value`) */
export const AccordionRoot: PartComponent<
    AccordionRootProps,
    AccordionRootState,
    AccordionRootEmits
> = publicComponent(
    defineComponent({
        name: "AccordionRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            /** The values of the open items. */
            value: {
                type: Array as PropType<readonly string[]>,
                default: undefined,
            },
            defaultValue: {
                type: Array as PropType<readonly string[]>,
                default: () => [],
            },
            /** Several items may be open. */
            multiple: { type: Boolean, default: false },
            disabled: { type: Boolean, default: false },
            orientation: {
                type: String as PropType<AccordionOrientation>,
                default: "vertical",
            },
            /** Whether the arrow keys wrap from the last trigger to the first and back. */
            loopFocus: { type: Boolean, default: true },
        },
        emits: {
            "update:value": (_value: string[]) => true,
            valueChange: (_value: string[], _details: ChangeDetails) => true,
        },
        setup(props, { attrs, slots, emit }) {
            const own = useControllable<readonly string[], ChangeDetails>(
                () => props.value,
                props.defaultValue,
                (next, details) => {
                    emit("update:value", [...next]);
                    emit("valueChange", [...next], details);
                },
            );
            const value = computed(() => own.value.value);
            const direction = useProvidedDirection();
            provide(AccordionKey, {
                value,
                toggle: (item, open, reason) => {
                    const current: readonly string[] = value.value;
                    const next = open
                        ? props.multiple
                            ? [
                                  ...current.filter((entry) => entry !== item),
                                  item,
                              ]
                            : [item]
                        : current.filter((entry) => entry !== item);
                    own.set(next, { reason });
                },
                disabled: () => props.disabled,
                orientation: () => props.orientation,
                baseId: useId(),
            });

            // the arrows, Home and End move among the enabled triggers (spec/accordion.md,
            // "Keyboard")
            const onKeydown = (event: KeyboardEvent) => {
                const root = event.currentTarget as HTMLElement;
                const triggers = [
                    ...root.querySelectorAll<HTMLButtonElement>(
                        '[data-primitives-part="accordion-trigger"]',
                    ),
                ].filter(
                    (trigger) =>
                        !trigger.disabled &&
                        trigger.closest(
                            '[data-primitives-part="accordion-root"]',
                        ) === root,
                );
                const current = triggers.indexOf(
                    event.target as HTMLButtonElement,
                );
                if (current === -1) {
                    return;
                }
                const index = accordionKeyTarget(
                    event.key,
                    current,
                    triggers.length,
                    {
                        orientation: props.orientation,
                        rtl: getDirection(root, direction()) === "rtl",
                        loop: props.loopFocus,
                    },
                );
                if (index === null) {
                    return;
                }
                event.preventDefault();
                triggers[index]?.focus();
            };

            return () => {
                const state = {
                    value: [...value.value],
                    disabled: props.disabled,
                    orientation: props.orientation,
                };
                return renderPart("div", { attrs, slots }, props.as, state, {
                    "data-primitives-part": "accordion-root",
                    ...stateAttributes({
                        orientation: props.orientation,
                        disabled: props.disabled,
                    }),
                    onKeydown,
                });
            };
        },
    }),
);
