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
import { SelectGroupKey } from "./select-context.ts";

/** Names its Group (spec/select.md). */
export const SelectGroupLabel: PartComponent<
    Record<never, never>,
    Record<never, never>
> = publicComponent(
    defineComponent({
        name: "SelectGroupLabel",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const labelId = inject(SelectGroupKey, null);
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
                    { id: id(), "data-primitives-part": "select-group-label" },
                );
        },
    }),
);
