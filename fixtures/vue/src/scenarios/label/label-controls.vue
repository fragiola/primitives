<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Checkbox } from "../../kit/ui/checkbox.ts";
import { Label } from "../../kit/ui/label.ts";
import { NumberField } from "../../kit/ui/number-field.ts";
import { Slider } from "../../kit/ui/slider.ts";
import { Switch } from "../../kit/ui/switch.ts";

// spec/label.md, `/label/controls`
const subscribe = ref<boolean>();
const notifications = ref<boolean>();
const onSubscribe = (checked: boolean) => {
    subscribe.value = checked;
};
const onNotifications = (checked: boolean) => {
    notifications.value = checked;
};
</script>

<template>
    <div class="flex flex-col items-start gap-4">
        <div class="flex items-center gap-2">
            <Label for="email">Email</Label>
            <input id="email" type="text" class="rounded-md border px-2" />
        </div>
        <Label><Checkbox.Root @checked-change="onSubscribe" />Subscribe</Label>
        <div class="flex items-center gap-2">
            <Label for="notifications">Notifications</Label>
            <Switch.Root id="notifications" @checked-change="onNotifications" />
        </div>
        <div class="flex items-center gap-2">
            <Label for="quantity">Quantity</Label>
            <NumberField.Root id="quantity" :default-value="1" locale="en-US">
                <NumberField.Group>
                    <NumberField.Input />
                </NumberField.Group>
            </NumberField.Root>
        </div>
        <div class="flex items-center gap-2">
            <Label id="volume-label" for="volume">Volume</Label>
            <Slider.Root :default-value="40">
                <Slider.Control>
                    <Slider.Track>
                        <Slider.Indicator />
                    </Slider.Track>
                    <Slider.Thumb id="volume" aria-labelledby="volume-label" />
                </Slider.Control>
            </Slider.Root>
        </div>
    </div>
    <Output :values="{ subscribe, notifications }" />
</template>
