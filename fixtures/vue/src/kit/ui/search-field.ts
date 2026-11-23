import { SearchField as Primitive } from "@fragiola/primitives-vue/search-field";
import { searchField } from "examples-shared/recipes/search-field";
import { type Component, defineComponent, h, mergeProps } from "vue";
import { styled } from "../styled.ts";
import { icon } from "./icon.ts";

/** The styled Root, with its search icon before its parts. */
const Root = defineComponent({
    name: "StyledSearchFieldRoot",
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
        return () =>
            h(
                Primitive.Root as Component,
                mergeProps({ class: searchField.root }, attrs),
                {
                    default: () => [
                        icon(searchField.icon, [
                            h("circle", { cx: "11", cy: "11", r: "7" }),
                            h("path", { d: "M20 20l-4-4" }),
                        ]),
                        ...(slots.default?.() ?? []),
                    ],
                },
            );
    },
});

/** The styled button, with its cross icon. */
const ClearButton = defineComponent({
    name: "StyledSearchFieldClearButton",
    inheritAttrs: false,
    setup(_, { attrs }) {
        return () =>
            h(
                Primitive.ClearButton as Component,
                mergeProps({ class: searchField["clear-button"] }, attrs),
                {
                    default: () => [
                        icon("size-4", [
                            h("path", { d: "M6 6l12 12M18 6L6 18" }),
                        ]),
                    ],
                },
            );
    },
});

export const SearchField = {
    Root,
    Input: styled(Primitive.Input, searchField.input),
    ClearButton,
};
