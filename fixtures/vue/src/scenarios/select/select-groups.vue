<script setup lang="ts">
import type { OpenChangeDetails } from "@fragiola/primitives-vue/select";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Select } from "../../kit/ui/select.ts";

// spec/select.md: groups, a separator and item texts, with no `items` (the list kept mounted).
interface Food {
    value: string;
    label: string;
    disabled?: boolean;
}

const FRUITS: Food[] = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
];
const VEGETABLES: Food[] = [
    { value: "carrot", label: "Carrot" },
    { value: "leek", label: "Leek", disabled: true },
    { value: "potato", label: "Potato" },
];
const value = ref<string | null>("carrot");
const open = ref(false);
const reason = ref<string>();
const onOpenChange = (next: boolean, details: OpenChangeDetails) => {
    open.value = next;
    reason.value = details.reason;
};
</script>

<template>
    <div class="flex flex-col items-start gap-2">
        <label for="food" class="text-sm font-medium">Food</label>
        <Select.Root
            default-value="carrot"
            @value-change="(next: string | null) => (value = next)"
            @open-change="onOpenChange"
        >
            <Select.Trigger id="food">
                <Select.Value placeholder="Choose a food" />
            </Select.Trigger>
            <Select.Portal keep-mounted>
                <Select.Positioner>
                    <Select.Popup>
                        <Select.List>
                            <Select.Group>
                                <Select.GroupLabel>Fruits</Select.GroupLabel>
                                <Select.Item v-for="item in FRUITS" :key="item.value" :value="item.value" :disabled="item.disabled">
                                    <Select.ItemText>{{ item.label }}</Select.ItemText>
                                    <Select.ItemIndicator>✓</Select.ItemIndicator>
                                </Select.Item>
                            </Select.Group>
                            <Select.Separator />
                            <Select.Group>
                                <Select.GroupLabel>Vegetables</Select.GroupLabel>
                                <Select.Item v-for="item in VEGETABLES" :key="item.value" :value="item.value" :disabled="item.disabled">
                                    <Select.ItemText>{{ item.label }}</Select.ItemText>
                                    <Select.ItemIndicator>✓</Select.ItemIndicator>
                                </Select.Item>
                            </Select.Group>
                        </Select.List>
                    </Select.Popup>
                </Select.Positioner>
            </Select.Portal>
        </Select.Root>
    </div>
    <Output :values="{ value, open, reason }" />
</template>
