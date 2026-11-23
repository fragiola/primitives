import {
    containsFilter,
    type ItemFilter,
} from "@fragiola/primitives/collection";
import { describe, expectTypeOf, it } from "vitest";
import { h, type VNode } from "vue";
import type { ComboboxListSlots } from "../src/components/combobox/combobox-list.ts";
import type { ComboboxRootProps } from "../src/components/combobox/combobox-root.ts";
import type { ComboboxValueSlots } from "../src/components/combobox/combobox-value.ts";

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

/**
 * `vue-tsc`'s check of an annotated `v-slot="{ entry }: { entry: Country }"`: the annotation's
 * function must extend the component's slot (`__VLS_vSlot<S, D extends S>`), and gives the scope
 * its type.
 */
declare function slotScope<S, D extends S>(
    slot: S,
    declared: D,
): D extends (...args: infer P) => unknown ? P : never;

// Epic #49 (#46): the List's and the Value's scoped slots take the consumer's own item type, with
// no cast (a slot typed `unknown` refused a function of `{ entry: Country }`).
describe("Vue Combobox slot types", () => {
    it("types the List's entry and the Value's value by an annotation of the consumer's", () => {
        const list: NonNullable<ComboboxListSlots["default"]> = ({
            entry,
        }: {
            entry: Country;
        }): VNode[] => [h("span", entry.name)];
        const single: NonNullable<ComboboxValueSlots["default"]> = ({
            value,
        }: {
            value: Country | null;
        }): VNode[] => [h("span", value?.name ?? "none")];
        const multiple: NonNullable<ComboboxValueSlots["default"]> = ({
            value,
        }: {
            value: Country[];
        }): VNode[] => value.map((country) => h("span", country.code));
        expectTypeOf(list).toBeFunction();
        expectTypeOf(single).toBeFunction();
        expectTypeOf(multiple).toBeFunction();

        // compiled, never run (`slotScope` is a type-level stand-in)
        const template = () => {
            const [scope] = slotScope(
                list,
                (_: { entry: Country; index: number }) => [],
            );
            expectTypeOf(scope.entry).toEqualTypeOf<Country>();
            expectTypeOf(scope.index).toEqualTypeOf<number>();
            // the annotation still checks what the slot gives: `index` is a number
            // @ts-expect-error `index` is not a string
            slotScope(list, (_: { entry: Country; index: string }) => []);
        };
        expectTypeOf(template).toBeFunction();
    });
});
