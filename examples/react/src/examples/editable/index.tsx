import { Editable } from "@fragiola/primitives-react/editable";
import { useState } from "react";
import { styles } from "./styles.ts";

function Icon({ d }: { d: string }) {
    return (
        <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
        >
            <path d={d} />
        </svg>
    );
}

// An inline-editable title (spec/editable.md): focusing the title or pressing the pencil turns it
// into a field with the text selected; Enter or the check saves it, Escape or the cross puts it
// back, and the focus returns to the pencil.
export default function InlineEditableTitle() {
    const [status, setStatus] = useState("");
    return (
        <div className={styles.stack}>
            <label htmlFor="document-title" className={styles.label}>
                Document title
            </label>
            <Editable.Root
                id="document-title"
                defaultValue="Quarterly report"
                placeholder="Untitled document"
                onValueCommit={(value) => setStatus(`Saved “${value}”.`)}
                onValueRevert={() => setStatus("Edit cancelled.")}
                className={styles.root}
            >
                <Editable.Area className={styles.area}>
                    <Editable.Preview className={styles.preview} />
                    <Editable.Input className={styles.input} />
                </Editable.Area>
                <Editable.EditTrigger
                    aria-label="Rename"
                    className={styles.editTrigger}
                >
                    <Icon d="M4 20h4L19 9l-4-4L4 16v4z" />
                </Editable.EditTrigger>
                <Editable.SubmitTrigger
                    aria-label="Save"
                    className={styles.submitTrigger}
                >
                    <Icon d="M5 12l5 5L20 7" />
                </Editable.SubmitTrigger>
                <Editable.CancelTrigger
                    aria-label="Cancel"
                    className={styles.cancelTrigger}
                >
                    <Icon d="M6 6l12 12M18 6L6 18" />
                </Editable.CancelTrigger>
            </Editable.Root>
            <p role="status" className={styles.status}>
                {status}
            </p>
        </div>
    );
}
