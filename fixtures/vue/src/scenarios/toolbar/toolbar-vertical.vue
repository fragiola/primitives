<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Toggle } from "../../kit/ui/toggle.ts";
import { ToggleGroup } from "../../kit/ui/toggle-group.ts";
import { Toolbar } from "../../kit/ui/toolbar.ts";

// spec/toolbar.md, `/toolbar/vertical`
const snap = ref<boolean>();
const zoom = ref<string[]>();
</script>

<template>
    <div class="flex items-start gap-2">
        <Toolbar.Root aria-label="Tools" orientation="vertical" :loop-focus="false">
            <Toolbar.Button>Select</Toolbar.Button>
            <Toolbar.Button>Draw</Toolbar.Button>
            <Toolbar.Separator />
            <Toggle @pressed-change="(next: boolean) => (snap = next)">Snap</Toggle>
            <ToggleGroup aria-label="Zoom" @value-change="(next: string[]) => (zoom = next)">
                <Toggle value="fit">Fit</Toggle>
                <Toggle value="fill">Fill</Toggle>
            </ToggleGroup>
        </Toolbar.Root>
        <button type="button">After</button>
    </div>
    <Output :values="{ snap, zoom: zoom?.join(',') }" />
</template>
