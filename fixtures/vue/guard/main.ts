// The bundle guard's app (scripts/check-bundle.ts): it imports two components, Dialog and Tabs,
// from the package's built entries, and its bundle must hold nothing else.
import { Dialog } from "@fragiola/primitives-vue/dialog";
import { Tabs } from "@fragiola/primitives-vue/tabs";
import { createApp, defineComponent, h } from "vue";

const App = defineComponent({
    setup() {
        return () => [
            h(Dialog.Root, null, () => [
                h(Dialog.Trigger, null, () => "Open"),
                h(Dialog.Portal, null, () => [
                    h(Dialog.Backdrop),
                    h(Dialog.Popup, null, () => [
                        h(Dialog.Title, null, () => "Title"),
                        h(Dialog.Description, null, () => "Description"),
                        h(Dialog.Close, null, () => "Close"),
                    ]),
                ]),
            ]),
            h(Tabs.Root, { defaultValue: "a" }, () => [
                h(Tabs.List, { "aria-label": "Tabs" }, () => [
                    h(Tabs.Tab, { value: "a" }, () => "A"),
                    h(Tabs.Tab, { value: "b" }, () => "B"),
                    h(Tabs.Indicator),
                ]),
                h(Tabs.Panel, { value: "a" }, () => "A"),
                h(Tabs.Panel, { value: "b" }, () => "B"),
            ]),
        ];
    },
});

createApp(App).mount("#root");
