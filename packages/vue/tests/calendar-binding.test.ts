import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { computed, defineComponent, h, provide, reactive } from "vue";
import {
    type PickerBinding,
    PickerBindingKey,
} from "../src/components/calendar/picker-binding-context.ts";
import type { CalendarStateProps } from "../src/components/calendar/use-calendar.ts";
import { useCalendar } from "../src/components/calendar/use-calendar.ts";

// spec/calendar.md, "Anatomy": a calendar inside a picker of its mode, with no value of its own,
// binds to the picker. Epic #22 (#19): Vue decides it from the current props, not once at setup.
describe("a Vue calendar's picker binding", () => {
    it("follows the props: a value given later unbinds it, removed binds it again", async () => {
        const chosen: unknown[] = [];
        const picker: PickerBinding = {
            mode: "single",
            open: () => false,
            value: computed(() => ({ year: 2026, month: 11, day: 20 })),
            choose: (value) => chosen.push(value),
            options: () => ({}),
        };
        const props = reactive<CalendarStateProps>({});
        const own: unknown[] = [];
        let calendar: ReturnType<typeof useCalendar> | undefined;
        const Child = defineComponent({
            setup() {
                calendar = useCalendar("calendar", "single", props, (value) =>
                    own.push(value),
                );
                return () => h("div");
            },
        });
        const Parent = defineComponent({
            setup() {
                provide(PickerBindingKey, picker);
                return () => h(Child);
            },
        });
        mount(Parent);
        const date = { year: 2026, month: 11, day: 5 };
        calendar?.context.select(date);
        expect(chosen).toEqual([date]);
        // given a value of its own: a choice is its own, not the picker's
        props.value = { year: 2026, month: 11, day: 2 };
        calendar?.context.select(date);
        expect(chosen).toEqual([date]);
        expect(own).toEqual([date]);
        // the value removed: bound again
        props.value = undefined;
        calendar?.context.select(date);
        expect(chosen).toEqual([date, date]);
    });
});
