import {
    defineComponent,
    inject,
    onBeforeUnmount,
    onMounted,
    useId,
} from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { ListboxGroupKey } from "./listbox-context.ts";

/** Names its Group (spec/listbox.md). */
export const ListboxGroupLabel: PartComponent<
    Record<never, never>,
    Record<never, never>
> = publicComponent(
    defineComponent({
        name: "ListboxGroupLabel",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const labelId = inject(ListboxGroupKey, null);
            const generated = useId();
            const id = () => (attrs.id as string | undefined) ?? generated;
            onMounted(() => {
                if (labelId) {
                    labelId.value = id();
                }
            });
            onBeforeUnmount(() => {
                if (labelId) {
                    labelId.value = undefined;
                }
            });
            return () =>
                renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    {},
                    { id: id(), "data-primitives-part": "listbox-group-label" },
                );
        },
    }),
);
