import {
    containsFilter,
    type ItemFilter,
} from "@fragiola/primitives/collection";
import { describe, expectTypeOf, it } from "vitest";
import type { ComboboxRoot } from "../combobox/directives/combobox-root.directive.ts";

// Epic #22 (#19): the Root's callback inputs take the consumer's own item type, with no cast and
// no `any` (`pnpm typecheck` compiles this file).
interface Country {
    code: string;
    name: string;
}

type InputOf<K extends keyof ComboboxRoot> =
    ComboboxRoot[K] extends () => infer T ? T : never;

describe("Angular Combobox callback input types", () => {
    it("bind a filter, an equality and the item names typed by the consumer's item", () => {
        const filter: InputOf<"filter"> = ((item, query) =>
            item.name.startsWith(query)) satisfies ItemFilter<Country>;
        const contains: InputOf<"filter"> = containsFilter<Country>("en-US");
        const equal: InputOf<"isItemEqualToValue"> = (
            item: Country,
            value: Country,
        ) => item.code === value.code;
        const label: InputOf<"itemToStringLabel"> = (item: Country) =>
            item.name;
        const value: InputOf<"itemToStringValue"> = (item: Country) =>
            item.code;
        expectTypeOf(filter).not.toBeAny();
        expectTypeOf(contains).not.toBeAny();
        expectTypeOf(equal).not.toBeAny();
        expectTypeOf(label).not.toBeAny();
        expectTypeOf(value).not.toBeAny();
    });
});
