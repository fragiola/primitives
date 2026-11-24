import { Command } from "../../kit/ui/command.tsx";

// The items of the Command scenarios (spec/command.md, "Scenarios"): two groups and a separator.
export function CommandItems({ onRun }: { onRun: (value: string) => void }) {
    return (
        <>
            <Command.Group>
                <Command.GroupLabel>Suggestions</Command.GroupLabel>
                <Command.Item value="Calendar" onSelect={onRun}>
                    Calendar
                </Command.Item>
                <Command.Item value="Search Emoji" onSelect={onRun}>
                    Search Emoji
                </Command.Item>
                <Command.Item value="Calculator" disabled onSelect={onRun}>
                    Calculator
                </Command.Item>
            </Command.Group>
            <Command.Separator />
            <Command.Group>
                <Command.GroupLabel>Settings</Command.GroupLabel>
                <Command.Item
                    value="Profile"
                    keywords={["account"]}
                    onSelect={onRun}
                >
                    Profile
                </Command.Item>
                <Command.Item value="Billing" onSelect={onRun}>
                    Billing
                </Command.Item>
                <Command.Item value="Archive" onSelect={onRun}>
                    Archive
                </Command.Item>
            </Command.Group>
        </>
    );
}
