import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { ListboxKey } from "./listbox-context.ts";

/**
 * Between items or groups; no role of its own (a `listbox` owns only groups and options), across
 * the list's orientation (spec/listbox.md).
 */
export const ListboxSeparator: PartComponent<
    Record<never, never>,
    Record<never, never>
> = publicComponent(
    defineComponent({
        name: "ListboxSeparator",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(ListboxKey, "Listbox.Separator");
            return () =>
                renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    {},
                    {
                        role: "presentation",
                        "data-orientation":
                            context.orientation() === "vertical"
                                ? "horizontal"
                                : "vertical",
                        "data-primitives-part": "listbox-separator",
                    },
                );
        },
    }),
);
