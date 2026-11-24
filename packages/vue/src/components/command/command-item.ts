import { scrollIntoViewWithin } from "@fragiola/primitives/collection";
import { commandItemScore } from "@fragiola/primitives/command";
import {
    computed,
    defineComponent,
    type PropType,
    shallowRef,
    useId,
    watch,
} from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { type CommandItemInfo, CommandKey } from "./command-context.ts";

export interface CommandItemState {
    highlighted: boolean;
    disabled: boolean;
    /** It does not match the text: rendered `hidden`. */
    hidden: boolean;
}

export interface CommandItemProps {
    /** The text the filter scores, and the Item's identity in the Command. */
    value: string;
    /** More texts the filter scores. */
    keywords?: readonly string[];
    /** Highlighted by the arrows, never run. */
    disabled?: boolean;
    /** Always shown, whatever the text. */
    forceMount?: boolean;
}

export type CommandItemEmits = {
    /** Runs the action (Enter, a press). */
    select: (value: string, event: Event) => true;
};

const NO_KEYWORDS: readonly string[] = [];

/** An `option`: an action, hidden while it does not match the text (spec/command.md). */
export const CommandItem: PartComponent<
    CommandItemProps,
    CommandItemState,
    CommandItemEmits
> = publicComponent(
    defineComponent({
        name: "CommandItem",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: { type: String, required: true },
            keywords: {
                type: Array as PropType<readonly string[]>,
                default: () => NO_KEYWORDS,
            },
            disabled: { type: Boolean, default: false },
            forceMount: { type: Boolean, default: false },
        },
        emits: {
            select: (_value: string, _event: Event) => true,
        },
        setup(props, { attrs, slots, emit }) {
            const context = useRequiredContext(CommandKey, "Command.Item");
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            const id = useId();
            // the Root reads the Item's latest props through these getters; it is told only when
            // the Item mounts or unmounts
            const info: CommandItemInfo = {
                get value() {
                    return props.value;
                },
                get keywords() {
                    return props.keywords;
                },
                get disabled() {
                    return props.disabled;
                },
                get forceMount() {
                    return props.forceMount;
                },
                id,
                select: (event) => emit("select", props.value, event),
            };
            const { items, version } = context;
            watch(
                element,
                (node, _, onCleanup) => {
                    if (node === null) {
                        return;
                    }
                    items.set(node, info);
                    version.value += 1;
                    onCleanup(() => {
                        items.delete(node);
                        version.value += 1;
                    });
                },
                { flush: "post", immediate: true },
            );

            const state = computed<CommandItemState>(() => {
                const hidden =
                    commandItemScore(
                        props.value,
                        context.search.value,
                        props.keywords,
                        context.filter(),
                        props.forceMount,
                    ) === 0;
                return {
                    highlighted:
                        !hidden && context.highlighted.value === props.value,
                    disabled: props.disabled,
                    hidden,
                };
            });
            watch(
                () => [state.value.highlighted, element.value] as const,
                ([highlighted, node]) => {
                    if (highlighted && node !== null) {
                        scrollIntoViewWithin(node, context.root.value);
                    }
                },
                { flush: "post", immediate: true },
            );

            return () => {
                const { highlighted, disabled, hidden } = state.value;
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    state.value,
                    {
                        role: "option",
                        id,
                        hidden: hidden || undefined,
                        "aria-selected": highlighted ? "true" : "false",
                        "aria-disabled": disabled ? "true" : undefined,
                        "data-primitives-part": "command-item",
                        ...stateAttributes({ highlighted, disabled }),
                        onPointermove: () => {
                            if (!state.value.highlighted) {
                                context.highlighted.value = props.value;
                            }
                        },
                        // the Input keeps DOM focus
                        onPointerdown: (event: PointerEvent) =>
                            event.preventDefault(),
                        onClick: (event: MouseEvent) => {
                            if (!props.disabled) {
                                emit("select", props.value, event);
                            }
                        },
                        ref: setElement,
                    },
                );
            };
        },
    }),
);
