<script setup lang="ts">
import type {
    CascadeItem,
    ChangeDetails,
    OpenChangeDetails,
} from "@fragiola/primitives-vue/cascade-select";
import { CascadeSelect } from "../../kit/ui/cascade-select.ts";
import { LOCATION_ITEMS } from "./location-items.ts";

// The CascadeSelect of the cascade-select scenarios: three Levels side by side.
defineProps<{
    id?: string;
    name?: string;
    required?: boolean;
    changeOnSelect?: boolean;
    defaultValue?: readonly string[];
    separator?: string;
}>();
const emit = defineEmits<{
    valueChange: [value: readonly string[]];
    openChange: [open: boolean, reason: string];
}>();
const DEPTHS = [0, 1, 2];
</script>

<template>
    <CascadeSelect.Root
        :items="LOCATION_ITEMS"
        :name="name"
        :required="required"
        :change-on-select="changeOnSelect"
        :default-value="defaultValue"
        @value-change="(next: readonly string[], _details: ChangeDetails) => emit('valueChange', next)"
        @open-change="(open: boolean, details: OpenChangeDetails) => emit('openChange', open, details.reason)"
    >
        <CascadeSelect.Trigger v-bind="id === undefined ? {} : { id }"><CascadeSelect.Value placeholder="Choose a place" :separator="separator" /></CascadeSelect.Trigger>
        <CascadeSelect.Portal>
            <CascadeSelect.Positioner>
                <CascadeSelect.Popup>
                    <CascadeSelect.Level v-for="depth in DEPTHS" :key="depth" :depth="depth" v-slot="{ items }">
                        <CascadeSelect.Item v-for="item in (items as readonly CascadeItem[])" :key="item.value" :value="item.value">{{ item.label }}<CascadeSelect.ItemIndicator>✓</CascadeSelect.ItemIndicator></CascadeSelect.Item>
                    </CascadeSelect.Level>
                </CascadeSelect.Popup>
            </CascadeSelect.Positioner>
        </CascadeSelect.Portal>
    </CascadeSelect.Root>
</template>
