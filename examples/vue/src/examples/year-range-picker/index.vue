<script setup lang="ts">
import { YearRangeCalendar } from "@fragiola/primitives-vue/year-range-calendar";
import {
    type PlainYear,
    type YearRange,
    YearRangePicker,
} from "@fragiola/primitives-vue/year-range-picker";
import { computed, ref } from "vue";
import { styles } from "./styles.ts";

const FILMS = [
    { title: "Metropolis", year: 1927 },
    { title: "Casablanca", year: 1942 },
    { title: "Vertigo", year: 1958 },
    { title: "Alien", year: 1979 },
    { title: "Back to the Future", year: 1985 },
    { title: "Spirited Away", year: 2001 },
    { title: "Parasite", year: 2019 },
    { title: "Past Lives", year: 2023 },
];
const thisYear: PlainYear = { year: new Date().getFullYear() };
const inRange = (year: number, range: YearRange | null) =>
    range === null || (year >= range.start.year && year <= range.end.year);

const range = ref<YearRange | null>(null);
const films = computed(() =>
    FILMS.filter((film) => inRange(film.year, range.value)),
);

// A list filtered by a range of years: the picker's popup holds a page of twelve years (the
// previous and next pages a press away), two years set the range, and the list keeps the films of
// those years; Clear shows them all again (spec/month-calendar.md).
</script>

<template>
    <div :class="styles.page">
        <div :class="styles.filter">
            <YearRangePicker.Root v-model:value="range" :max="thisYear" locale="en-US">
                <YearRangePicker.Trigger :class="styles.picker.trigger">{{ range ? `Years: ${range.start.year} – ${range.end.year}` : "Years: all" }}</YearRangePicker.Trigger>
                <YearRangePicker.Portal>
                    <YearRangePicker.Positioner :side-offset="4" :class="styles.picker.positioner">
                        <YearRangePicker.Popup aria-label="Choose years" :class="styles.picker.popup">
                            <YearRangeCalendar.Root :class="styles.calendar.root">
                                <div :class="styles.header">
                                    <YearRangeCalendar.PrevButton aria-label="Previous years" :class="styles.calendar.prevButton">‹</YearRangeCalendar.PrevButton>
                                    <YearRangeCalendar.Heading :class="styles.calendar.heading" />
                                    <YearRangeCalendar.NextButton aria-label="Next years" :class="styles.calendar.nextButton">›</YearRangeCalendar.NextButton>
                                </div>
                                <YearRangeCalendar.Grid :class="styles.calendar.grid">
                                    <YearRangeCalendar.GridBody v-slot="{ row }">
                                        <YearRangeCalendar.Row :key="row[0]?.year" :row="row" v-slot="{ item }">
                                            <YearRangeCalendar.Cell :key="item.year" :value="item" :class="styles.calendar.cell" />
                                        </YearRangeCalendar.Row>
                                    </YearRangeCalendar.GridBody>
                                </YearRangeCalendar.Grid>
                            </YearRangeCalendar.Root>
                        </YearRangePicker.Popup>
                    </YearRangePicker.Positioner>
                </YearRangePicker.Portal>
            </YearRangePicker.Root>
            <button type="button" :class="styles.clear" @click="range = null">Clear</button>
        </div>
        <ul aria-label="Films" :class="styles.list">
            <li v-for="film in films" :key="film.title" :class="styles.item"><span>{{ film.title }}</span><span :class="styles.year">{{ film.year }}</span></li>
        </ul>
    </div>
</template>
