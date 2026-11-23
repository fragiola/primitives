import {
    defineComponent,
    onBeforeUnmount,
    onMounted,
    onUpdated,
    useId,
} from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { TagGroupKey } from "./tag-group-context.ts";

/** Names the List (spec/tag-group.md); in a Field, the `Field.Label` does. */
export const TagGroupLabel: PartComponent<
    Record<never, never>,
    Record<never, never>
> = publicComponent(
    defineComponent({
        name: "TagGroupLabel",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(TagGroupKey, "TagGroup.Label");
            const generated = useId();
            const id = () => (attrs.id as string | undefined) ?? generated;
            // once mounted, as React's layout effect: the server render has no `aria-labelledby`
            onMounted(() => context.setLabelId(id()));
            onUpdated(() => context.setLabelId(id()));
            onBeforeUnmount(() => context.setLabelId(undefined));
            return () =>
                renderPart(
                    "span",
                    { attrs, slots },
                    props.as,
                    {},
                    { id: id(), "data-primitives-part": "tag-group-label" },
                );
        },
    }),
);
