import { DropZoneScenario } from "./drop-zone-scenario.tsx";

/** spec/drop-zone.md, `/drop-zone/basic` */
export function DropZoneBasic() {
    return <DropZoneScenario accept="image/*,.pdf" />;
}
