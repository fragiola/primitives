<script setup lang="ts">
import { useLifecycle } from "../../kit/lifecycle.ts";
import Output from "../../kit/output.vue";
import { Select } from "../../kit/ui/select.ts";
import { FRUIT_ITEMS } from "./fruit-items.ts";

// spec/README.md, "The lifecycle scenarios".
const props = defineProps<{ cancel?: boolean }>();
const lifecycle = useLifecycle(props.cancel);
</script>

<template>
    <div class="flex flex-col items-start gap-2">
        <label for="fruit" class="text-sm font-medium">Fruit</label>
        <Select.Root :items="FRUIT_ITEMS" @open-change="lifecycle.onOpenChange" @open-change-complete="lifecycle.onOpenChangeComplete">
            <Select.Trigger id="fruit"><Select.Value placeholder="Choose a fruit" /></Select.Trigger>
            <Select.Portal keep-mounted>
                <Select.Positioner>
                    <Select.Popup>
                        <Select.List>
                            <Select.Item v-for="item in FRUIT_ITEMS" :key="item.value" :value="item.value">{{ item.label }}</Select.Item>
                        </Select.List>
                    </Select.Popup>
                </Select.Positioner>
            </Select.Portal>
        </Select.Root>
    </div>
    <Output :values="lifecycle.values" />
</template>
