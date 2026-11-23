import { Listbox } from "../../kit/ui/listbox.tsx";
import type { Option } from "./options.ts";

/** The Items of a list of options, each with its label and indicator. */
export function ListboxOptions({ options }: { options: readonly Option[] }) {
    return options.map((option) => (
        <Listbox.Item
            key={option.value}
            value={option.value}
            disabled={option.disabled}
        >
            {option.label}
            <Listbox.ItemIndicator>✓</Listbox.ItemIndicator>
        </Listbox.Item>
    ));
}
