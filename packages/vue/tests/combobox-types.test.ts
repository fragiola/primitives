import {
    containsFilter,
    type ItemFilter,
} from "@fragiola/primitives/collection";
import { describe, expectTypeOf, it } from "vitest";
import type { ComboboxRootProps } from "../src/components/combobox/combobox-root.ts";

// Epic #22 (#19): the Root's callbacks take the consumer's own item type, with no cast (`pnpm
// typecheck` compiles this file; a cast-free typed filter failed before, as `ItemFilter<unknown>`).
interface Country {
    code: string;
    name: string;
}

describe("Vue Combobox callback types", () => {
    it("bind a filter, an equality and the item names typed by the consumer's item", () => {
        const filter: ItemFilter<Country> = (item, query) =>
            item.name.startsWith(query);
        const props: ComboboxRootProps = {
            filter,
            isItemEqualToValue: (item: Country, value: Country) =>
                item.code === value.code,
            itemToStringLabel: (item: Country) => item.name,
            itemToStringValue: (item: Country) => item.code,
        };
        expectTypeOf(props.filter).not.toBeAny();
        const contains: ComboboxRootProps = {
            filter: containsFilter<Country>("en-US"),
        };
        expectTypeOf(contains).toMatchTypeOf<ComboboxRootProps>();
        // a filter's own item type still checks what it reads
        // @ts-expect-error `population` is not a Country's
        const wrong: ItemFilter<Country> = (item) => item.population > 0;
        expectTypeOf(wrong).toBeFunction();
    });
});
