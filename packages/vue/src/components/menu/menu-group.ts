import {
    defineComponent,
    type InjectionKey,
    inject,
    provide,
    type Ref,
    ref,
} from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { MenuKey } from "./menu-context.ts";

export const MenuGroupKey: InjectionKey<Ref<string | undefined>> =
    Symbol("MenuGroup");

/** Groups items under its GroupLabel. */
export const MenuGroup: PartComponent<
    Record<never, never>,
    Record<never, never>
> = publicComponent(
    defineComponent({
        name: "MenuGroup",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const component = inject(MenuKey, null)?.component ?? "menu";
            const labelId = ref<string>();
            provide(MenuGroupKey, labelId);
            return () =>
                renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    {},
                    {
                        role: "group",
                        "aria-labelledby": labelId.value,
                        "data-primitives-part": `${component}-group`,
                    },
                );
        },
    }),
);
