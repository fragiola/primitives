<script setup lang="ts">
import {
    type PlainDate,
    DatePicker as Primitive,
} from "@fragiola/primitives-vue/date-picker";
import { ref } from "vue";
import { iso } from "../../kit/iso.ts";
import { useLifecycle } from "../../kit/lifecycle.ts";
import Output from "../../kit/output.vue";
import { TextRuns } from "../../kit/text-runs.ts";
import { Calendar } from "../../kit/ui/calendar.ts";
import { DatePicker } from "../../kit/ui/date-picker.ts";
import MonthView from "../../kit/ui/month-view.vue";

// spec/README.md, "The lifecycle scenarios".
const props = defineProps<{ locale?: string; cancel?: boolean }>();
const lifecycle = useLifecycle(props.cancel);
const value = ref<PlainDate | null>(null);
</script>

<template>
    <Primitive.Root
        v-model:value="value"
        :locale="locale"
        @open-change="lifecycle.onOpenChange"
        @open-change-complete="lifecycle.onOpenChangeComplete"
    >
        <DatePicker.Trigger><TextRuns :runs="['Choose date: ', iso(value) ?? 'none']" /></DatePicker.Trigger>
        <DatePicker.Portal keep-mounted>
            <DatePicker.Positioner :side-offset="4">
                <DatePicker.Popup aria-label="Choose date">
                    <Calendar.Root>
                        <MonthView />
                    </Calendar.Root>
                </DatePicker.Popup>
            </DatePicker.Positioner>
        </DatePicker.Portal>
    </Primitive.Root>
    <Output :values="lifecycle.values" />
</template>
