import { DropZoneScenario } from "./drop-zone-scenario.tsx";

/** spec/drop-zone.md, `/drop-zone/disabled` */
export function DropZoneDisabled() {
    return <DropZoneScenario accept="image/*,.pdf" disabled />;
}
