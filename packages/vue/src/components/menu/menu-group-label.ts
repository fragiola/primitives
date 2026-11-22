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
import { MenuGroupKey } from "./menu-group.ts";

/** Names its Group. */
export const MenuGroupLabel: PartComponent<
    Record<never, never>,
    Record<never, never>
> = publicComponent(
    defineComponent({
        name: "MenuGroupLabel",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const labelId = inject(MenuGroupKey, null);
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
                    { id: id(), "data-primitives-part": "menu-group-label" },
                );
        },
    }),
);
