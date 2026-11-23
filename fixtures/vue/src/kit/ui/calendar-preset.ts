import { CalendarPreset as Primitive } from "@fragiola/primitives-vue/calendar-preset";
import { calendarPreset } from "examples-shared/recipes/calendar";
import { defineComponent, h } from "vue";
import { styled } from "../styled.ts";

/** The presets of a calendar, in a row under its grid. */
export const PresetList = defineComponent({
    name: "PresetList",
    setup(_, { slots }) {
        return () =>
            h("div", { class: calendarPreset.list }, slots.default?.());
    },
});

export const CalendarPreset = styled(Primitive, calendarPreset.preset);
