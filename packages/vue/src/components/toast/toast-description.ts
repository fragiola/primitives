import { defineComponent, onBeforeUnmount, onMounted, useId } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ToastRootKey } from "./toast-context.ts";

/** The toast's description (its Root's `aria-describedby`); its content defaults to the toast's `description`. */
export const ToastDescription: PartComponent<
    Record<never, never>,
    { type: string | undefined }
> = publicComponent(
    defineComponent({
        name: "ToastDescription",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                ToastRootKey,
                "Toast.Description",
            );
            const generated = useId();
            const id = () => (attrs.id as string | undefined) ?? generated;
            onMounted(() => {
                context.descriptionId.value = id();
            });
            onBeforeUnmount(() => {
                context.descriptionId.value = undefined;
            });
            return () => {
                const toast = context.toast();
                const state = { type: toast.type };
                return renderPart(
                    "p",
                    { attrs, slots },
                    props.as,
                    state,
                    {
                        id: id(),
                        "data-primitives-part": "toast-description",
                        ...stateAttributes({ type: toast.type }),
                    },
                    () => slots.default?.({ state }) ?? toast.description,
                );
            };
        },
    }),
);
