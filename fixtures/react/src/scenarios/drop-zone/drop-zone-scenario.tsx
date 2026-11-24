import type { DropZoneDropDetails } from "@fragiola/primitives-react/drop-zone";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { DropZone } from "../../kit/ui/drop-zone.tsx";

const names = (files: File[]) =>
    files.length === 0 ? "none" : files.map((file) => file.name).join(", ");

/** The DropZone of every scenario, with its output (spec/drop-zone.md). */
export function DropZoneScenario({
    accept,
    multiple,
    disabled,
}: {
    accept?: string;
    multiple?: boolean;
    disabled?: boolean;
}) {
    const [drop, setDrop] = useState<DropZoneDropDetails>();
    const [dropTarget, setDropTarget] = useState(false);
    return (
        <>
            <DropZone.Root
                accept={accept}
                multiple={multiple}
                disabled={disabled}
                onFileDrop={setDrop}
                onDropTargetChange={setDropTarget}
                announcement={(details: DropZoneDropDetails) =>
                    `${details.acceptedFiles.length} accepted, ${details.rejectedFiles.length} rejected`
                }
            >
                <span>Drop images or PDFs here, or press to choose</span>
            </DropZone.Root>
            <Output
                values={{
                    accepted: drop && names(drop.acceptedFiles),
                    rejected: drop && names(drop.rejectedFiles),
                    reason: drop?.reason,
                    dropTarget,
                }}
            />
        </>
    );
}
