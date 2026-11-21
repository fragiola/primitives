// The bundle guard's app (scripts/check-bundle.ts): it imports two components, Dialog and Tabs,
// from the package's built entries, and its bundle must hold nothing else.
import { Dialog } from "@fragiola/primitives-react/dialog";
import { Tabs } from "@fragiola/primitives-react/tabs";
import { createRoot } from "react-dom/client";

function App() {
    return (
        <>
            <Dialog.Root>
                <Dialog.Trigger>Open</Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Backdrop />
                    <Dialog.Popup>
                        <Dialog.Title>Title</Dialog.Title>
                        <Dialog.Description>Description</Dialog.Description>
                        <Dialog.Close>Close</Dialog.Close>
                    </Dialog.Popup>
                </Dialog.Portal>
            </Dialog.Root>
            <Tabs.Root defaultValue="a">
                <Tabs.List aria-label="Tabs">
                    <Tabs.Tab value="a">A</Tabs.Tab>
                    <Tabs.Tab value="b">B</Tabs.Tab>
                    <Tabs.Indicator />
                </Tabs.List>
                <Tabs.Panel value="a">A</Tabs.Panel>
                <Tabs.Panel value="b">B</Tabs.Panel>
            </Tabs.Root>
        </>
    );
}

const root = document.getElementById("root");
if (root !== null) {
    createRoot(root).render(<App />);
}
