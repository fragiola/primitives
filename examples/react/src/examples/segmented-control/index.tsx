import { SegmentedControl } from "@fragiola/primitives-react/segmented-control";
import { useState } from "react";
import { styles } from "./styles.ts";

const VIEWS = [
    { value: "list", label: "List" },
    { value: "grid", label: "Grid" },
    { value: "board", label: "Board" },
];

const PROJECTS = ["Atlas", "Beacon", "Comet", "Drift", "Ember", "Flint"];

// A view switcher: one of three layouts for the same projects (spec/segmented-control.md). The
// control is one tab stop; every arrow moves the focus to the next view and checks it, and the
// Indicator, placed from its variables, slides under the checked segment. The app holds the view
// and lays the projects out by it.
export default function ViewSwitcher() {
    const [view, setView] = useState<string | null>("list");
    return (
        <div className={styles.stack}>
            <span id="view-label" className={styles.label}>
                View
            </span>
            <SegmentedControl.Root
                aria-labelledby="view-label"
                value={view}
                onValueChange={setView}
                className={styles.root}
            >
                {VIEWS.map((entry) => (
                    <SegmentedControl.Item
                        key={entry.value}
                        value={entry.value}
                        className={styles.item}
                    >
                        <SegmentedControl.ItemText className={styles.itemText}>
                            {entry.label}
                        </SegmentedControl.ItemText>
                    </SegmentedControl.Item>
                ))}
                <SegmentedControl.Indicator className={styles.indicator} />
            </SegmentedControl.Root>
            <ul
                aria-label="Projects"
                data-view={view}
                className={styles.projects}
            >
                {PROJECTS.map((project) => (
                    <li key={project} className={styles.project}>
                        {project}
                    </li>
                ))}
            </ul>
        </div>
    );
}
