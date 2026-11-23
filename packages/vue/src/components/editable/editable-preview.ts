import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { EditableKey, type EditableState } from "./editable-context.ts";

/**
 * The value as text (or the placeholder); `hidden` while editing; its focus, press or double press
 * starts an edit, as `activationMode` says (spec/editable.md, "Pointer").
 */
export const EditablePreview: PartComponent<
    Record<never, never>,
    EditableState
> = publicComponent(
    defineComponent({
        name: "EditablePreview",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(EditableKey, "Editable.Preview");
            return () => {
                const state = context.state.value;
                const mode = context.activationMode();
                const placeholder = context.placeholder();
                const interactive = !state.disabled && !state.readOnly;
                const showsPlaceholder =
                    state.empty && placeholder !== undefined;
                const text = showsPlaceholder ? placeholder : state.value;
                return renderPart(
                    "span",
                    { attrs, slots },
                    props.as,
                    state,
                    {
                        hidden: state.editing || undefined,
                        tabindex: interactive
                            ? mode === "focus"
                                ? 0
                                : -1
                            : undefined,
                        "data-primitives-part": "editable-preview",
                        ...context.attributes.value,
                        ...stateAttributes({ placeholder: showsPlaceholder }),
                        onFocus: () => context.onPreviewFocus(),
                        onClick: () => {
                            if (context.activationMode() === "click") {
                                context.edit();
                            }
                        },
                        onDblclick: () => {
                            if (context.activationMode() === "dblclick") {
                                context.edit();
                            }
                        },
                        onKeydown: (event: KeyboardEvent) => {
                            if (
                                event.key === "Enter" &&
                                context.activationMode() !== "none"
                            ) {
                                event.preventDefault();
                                context.edit();
                            }
                        },
                        ref: context.setPreview,
                    },
                    () => text,
                );
            };
        },
    }),
);
