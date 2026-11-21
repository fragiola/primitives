import { examplesE2eConfig } from "examples-shared/e2e/config";

// The shared suite (examples/shared/e2e) against this app's embed: a production build under
// /primitives/embed/angular/, served with a host page that embeds it in an iframe. The build uses
// the packages' `dist`: build them first (`pnpm --filter "./packages/*" build`).
export default examplesE2eConfig("angular");
