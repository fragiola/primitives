import { AutocompleteVirtual as AutocompletePrimitive } from "@fragiola/primitives-vue/autocomplete-virtual";
import { ComboboxVirtual as ComboboxPrimitive } from "@fragiola/primitives-vue/combobox-virtual";
import { ListboxVirtual as ListboxPrimitive } from "@fragiola/primitives-vue/listbox-virtual";
import { SelectVirtual as SelectPrimitive } from "@fragiola/primitives-vue/select-virtual";
import { autocomplete } from "examples-shared/recipes/autocomplete";
import { combobox } from "examples-shared/recipes/combobox";
import { listbox } from "examples-shared/recipes/listbox";
import { select } from "examples-shared/recipes/select";
import { styled } from "../styled.ts";

// The virtual parts are their component's parts: the component's recipe styles them. A virtual
// list is its own scroll container, 320 px high (spec/virtual-lists.md, "Scenarios"): a popup's
// listbox that scrolls is the combobox's popup for axe, not a region to focus.
const SCROLL = "max-h-80 overflow-y-auto";

export const ListboxVirtual = {
    Root: styled(ListboxPrimitive.Root, `${listbox.root} h-80`),
};

export const SelectVirtual = {
    List: styled(SelectPrimitive.List, `${select.list} ${SCROLL}`),
};

export const ComboboxVirtual = {
    List: styled(ComboboxPrimitive.List, `${combobox.list} ${SCROLL}`),
};

export const AutocompleteVirtual = {
    List: styled(AutocompletePrimitive.List, `${autocomplete.list} ${SCROLL}`),
};
