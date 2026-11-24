import { DropZoneScenario } from "./drop-zone-scenario.tsx";

/** spec/drop-zone.md, `/drop-zone/single` */
export function DropZoneSingle() {
    return <DropZoneScenario multiple={false} />;
}
