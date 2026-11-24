import type { ChangeDetails } from "@fragiola/primitives-react/command";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Command } from "../../kit/ui/command.tsx";

/** spec/command.md, `/command/pages` */
export function CommandPages() {
    const [pages, setPages] = useState<string[]>([]);
    const [ran, setRan] = useState<string>();
    const [reason, setReason] = useState<string>();
    const page = pages[pages.length - 1];
    const push = (next: string) => setPages([...pages, next]);
    return (
        <>
            <Command.Root
                pages={pages}
                onPagesChange={(next: string[], details: ChangeDetails) => {
                    setPages(next);
                    setReason(details.reason);
                }}
            >
                <Command.Input aria-label="Command" />
                <Command.Empty>No results.</Command.Empty>
                <Command.List>
                    {page === undefined && (
                        <>
                            <Command.Item
                                value="Search projects…"
                                onSelect={() => push("projects")}
                            >
                                Search projects…
                            </Command.Item>
                            <Command.Item
                                value="Change theme…"
                                onSelect={() => push("theme")}
                            >
                                Change theme…
                            </Command.Item>
                        </>
                    )}
                    {page === "projects" &&
                        ["Primitives", "Tree", "Splitter"].map((project) => (
                            <Command.Item
                                key={project}
                                value={project}
                                onSelect={setRan}
                            >
                                {project}
                            </Command.Item>
                        ))}
                    {page === "theme" &&
                        ["Light", "Dark"].map((theme) => (
                            <Command.Item
                                key={theme}
                                value={theme}
                                onSelect={setRan}
                            >
                                {theme}
                            </Command.Item>
                        ))}
                </Command.List>
            </Command.Root>
            <Output values={{ pages: pages.join("/"), ran, reason }} />
        </>
    );
}
