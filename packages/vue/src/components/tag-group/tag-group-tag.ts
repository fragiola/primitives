import {
    defineComponent,
    onBeforeUnmount,
    onMounted,
    provide,
    shallowRef,
} from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { TagGroupKey, TagGroupTagKey } from "./tag-group-context.ts";

export interface TagGroupTagState {
    selected: boolean;
    disabled: boolean;
}

export interface TagGroupTagProps {
    /** The value it selects and removes (unique in the group). */
    value: string;
    /** Never focused, selected nor removed. */
    disabled?: boolean;
}

/** A `row`, focusable with a roving `tabindex` (spec/tag-group.md); holds one TagCell. */
export const TagGroupTag: PartComponent<TagGroupTagProps, TagGroupTagState> =
    publicComponent(
        defineComponent({
            name: "TagGroupTag",
            inheritAttrs: false,
            props: {
                ...asProp,
                value: { type: String, required: true },
                disabled: { type: Boolean, default: false },
            },
            setup(props, { attrs, slots }) {
                const context = useRequiredContext(TagGroupKey, "TagGroup.Tag");
                const element = shallowRef<HTMLElement | null>(null);
                const setElement = elementSetter(element);
                let unregister: (() => void) | null = null;
                onMounted(() => {
                    const node = element.value;
                    if (node !== null) {
                        unregister = context.register({
                            element: node,
                            value: () => props.value,
                            disabled: () => props.disabled,
                        });
                    }
                });
                onBeforeUnmount(() => {
                    unregister?.();
                    unregister = null;
                });
                const disabled = () =>
                    props.disabled ||
                    context.disabled() ||
                    context.disabledKeys().includes(props.value);
                provide(TagGroupTagKey, {
                    disabled,
                    element: () => element.value,
                });
                return () => {
                    const isDisabled = disabled();
                    const selected = context.selected.value.includes(
                        props.value,
                    );
                    const state = { selected, disabled: isDisabled };
                    const node = element.value;
                    return renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
                        state,
                        {
                            role: "row",
                            // a disabled tag never takes focus (spec/tag-group.md, "Keyboard")
                            tabindex: isDisabled
                                ? undefined
                                : node !== null &&
                                    context.tabStop.value === node
                                  ? 0
                                  : -1,
                            "aria-selected": context.selectable()
                                ? selected
                                    ? "true"
                                    : "false"
                                : undefined,
                            "aria-disabled": isDisabled ? "true" : undefined,
                            "data-primitives-part": "tag-group-tag",
                            ...stateAttributes(state),
                            onFocus: (event: FocusEvent) => {
                                if (
                                    element.value !== null &&
                                    event.target === element.value
                                ) {
                                    context.focused(element.value);
                                }
                            },
                            onClick: (event: MouseEvent) => {
                                // a RemoveButton's press prevents its click: it selects nothing
                                if (
                                    element.value !== null &&
                                    !event.defaultPrevented
                                ) {
                                    context.press(element.value, event);
                                }
                            },
                            ref: setElement,
                        },
                    );
                };
            },
        }),
    );
