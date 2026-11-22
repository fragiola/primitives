<script setup lang="ts">
import { DirectionProvider } from "@fragiola/primitives-vue/direction";
import { TextRuns } from "../../kit/text-runs.ts";
import { Calendar } from "../../kit/ui/calendar.ts";
import { Menu } from "../../kit/ui/menu.ts";
import MonthView from "../../kit/ui/month-view.vue";
import { Slider } from "../../kit/ui/slider.ts";
import { Tabs } from "../../kit/ui/tabs.ts";
import DirectionOutput from "./direction-output.vue";

// the page passes its locale; the scenario sets its own
defineProps<{ locale?: string }>();
const TABS = [
    { value: "account", label: "Account" },
    { value: "password", label: "Password" },
    { value: "billing", label: "Billing", disabled: true },
    { value: "team", label: "Team" },
];
</script>

<template>
    <DirectionProvider direction="rtl">
        <div class="flex flex-col items-start gap-6">
            <Tabs.Root default-value="account">
                <Tabs.List>
                    <Tabs.Tab v-for="tab in TABS" :key="tab.value" :value="tab.value" :disabled="tab.disabled">{{ tab.label }}</Tabs.Tab>
                    <Tabs.Indicator render-before-hydration />
                </Tabs.List>
                <Tabs.Panel v-for="tab in TABS" :key="tab.value" :value="tab.value">
                    <p><TextRuns :runs="[tab.label, ' settings']" /></p>
                </Tabs.Panel>
            </Tabs.Root>
            <Slider.Root :default-value="50">
                <Slider.Control>
                    <Slider.Track>
                        <Slider.Indicator />
                        <Slider.Thumb aria-label="Volume" />
                    </Slider.Track>
                </Slider.Control>
            </Slider.Root>
            <div class="ms-96">
            <Menu.Root>
                <Menu.Trigger>File</Menu.Trigger>
                <Menu.Portal>
                    <Menu.Positioner :side-offset="4">
                        <Menu.Popup>
                            <Menu.Item>New file</Menu.Item>
                            <Menu.SubmenuRoot>
                                <Menu.SubmenuTrigger>Share</Menu.SubmenuTrigger>
                                <Menu.Portal>
                                    <Menu.Positioner>
                                        <Menu.Popup>
                                            <Menu.Item>Email</Menu.Item>
                                            <Menu.Item>Link</Menu.Item>
                                        </Menu.Popup>
                                    </Menu.Positioner>
                                </Menu.Portal>
                            </Menu.SubmenuRoot>
                        </Menu.Popup>
                    </Menu.Positioner>
                </Menu.Portal>
            </Menu.Root>
            </div>
            <Calendar.Root locale="en-US">
                <MonthView />
            </Calendar.Root>
        </div>
        <DirectionOutput />
    </DirectionProvider>
</template>
