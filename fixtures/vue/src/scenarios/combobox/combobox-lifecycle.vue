<script setup lang="ts">
import { useId } from "vue";
import { useLifecycle } from "../../kit/lifecycle.ts";
import Output from "../../kit/output.vue";
import { Combobox } from "../../kit/ui/combobox.ts";
import { FRUITS } from "./fruits.ts";

// spec/README.md, "The lifecycle scenarios".
const props = defineProps<{ cancel?: boolean }>();
const lifecycle = useLifecycle(props.cancel);
const id = useId();
</script>

<template>
    <Combobox.Root :items="FRUITS" @open-change="lifecycle.onOpenChange" @open-change-complete="lifecycle.onOpenChangeComplete">
        <div class="flex flex-col gap-1">
            <label :for="id" class="text-sm font-medium">Fruit</label>
            <Combobox.InputGroup>
                <Combobox.Input :id="id" />
                <Combobox.Trigger aria-label="Show fruits">▾</Combobox.Trigger>
            </Combobox.InputGroup>
        </div>
        <Combobox.Portal keep-mounted>
            <Combobox.Positioner :side-offset="4">
                <Combobox.Popup>
                    <Combobox.Empty>No fruit found.</Combobox.Empty>
                    <Combobox.List v-slot="{ entry: fruit }">
                        <Combobox.Item :key="fruit.value" :value="fruit" :disabled="fruit.disabled">{{ fruit.label }}</Combobox.Item>
                    </Combobox.List>
                </Combobox.Popup>
            </Combobox.Positioner>
        </Combobox.Portal>
    </Combobox.Root>
    <Output :values="lifecycle.values" />
</template>
