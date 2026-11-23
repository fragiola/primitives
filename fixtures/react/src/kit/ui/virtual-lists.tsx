import {
    AutocompleteVirtual as AutocompletePrimitive,
    type AutocompleteVirtualListProps,
} from "@fragiola/primitives-react/autocomplete-virtual";
import {
    ComboboxVirtual as ComboboxPrimitive,
    type ComboboxVirtualListProps,
} from "@fragiola/primitives-react/combobox-virtual";
import {
    ListboxVirtual as ListboxPrimitive,
    type ListboxVirtualRootProps,
} from "@fragiola/primitives-react/listbox-virtual";
import {
    SelectVirtual as SelectPrimitive,
    type SelectVirtualListProps,
} from "@fragiola/primitives-react/select-virtual";
import { autocomplete } from "examples-shared/recipes/autocomplete";
import { combobox } from "examples-shared/recipes/combobox";
import { listbox } from "examples-shared/recipes/listbox";
import { select } from "examples-shared/recipes/select";

// The virtual parts are their component's parts: the component's recipe styles them. A virtual
// list is its own scroll container, 320 px high (spec/virtual-lists.md, "Scenarios"): a popup's
// listbox that scrolls is the combobox's popup for axe, not a region to focus.
const SCROLL = "max-h-80 overflow-y-auto";
export const ListboxVirtual = {
    Root: (props: ListboxVirtualRootProps) => (
        <ListboxPrimitive.Root className={`${listbox.root} h-80`} {...props} />
    ),
};

export const SelectVirtual = {
    List: (props: SelectVirtualListProps) => (
        <SelectPrimitive.List className={`${select.list} ${SCROLL}`} {...props} />
    ),
};

export const ComboboxVirtual = {
    List: <Entry,>(props: ComboboxVirtualListProps<Entry>) => (
        <ComboboxPrimitive.List<Entry> className={`${combobox.list} ${SCROLL}`} {...props} />
    ),
};

export const AutocompleteVirtual = {
    List: <Entry,>(props: AutocompleteVirtualListProps<Entry>) => (
        <AutocompletePrimitive.List<Entry>
            className={`${autocomplete.list} ${SCROLL}`}
            {...props}
        />
    ),
};
