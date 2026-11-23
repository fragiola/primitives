<script setup lang="ts">
import { useId } from "vue";
import { useLifecycle } from "../../kit/lifecycle.ts";
import Output from "../../kit/output.vue";
import { Autocomplete } from "../../kit/ui/autocomplete.ts";
import FruitPopup from "./fruit-popup.vue";
import { FRUITS } from "./suggestions.ts";

// spec/README.md, "The lifecycle scenarios".
const props = defineProps<{ cancel?: boolean }>();
const lifecycle = useLifecycle(props.cancel);
const id = useId();
</script>

<template>
    <Autocomplete.Root :items="FRUITS" @open-change="lifecycle.onOpenChange" @open-change-complete="lifecycle.onOpenChangeComplete">
        <div class="flex flex-col gap-1">
            <label :for="id" class="text-sm font-medium">Fruit</label>
            <Autocomplete.InputGroup>
                <Autocomplete.Input :id="id" />
                <Autocomplete.Trigger aria-label="Show suggestions">▾</Autocomplete.Trigger>
            </Autocomplete.InputGroup>
        </div>
        <FruitPopup keep-mounted />
    </Autocomplete.Root>
    <Output :values="lifecycle.values" />
</template>
