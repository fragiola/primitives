// The entry of @fragiola/primitives/command: a command palette's scorer, its matching and best
// entry, and its keys over the shown items (spec/command.md), pure functions.

export { commandKeyTarget } from "./command-key-target.ts";
export {
    bestMatch,
    type CommandEntry,
    type CommandFilter,
    type CommandMatches,
    commandItemScore,
    commandMatches,
    commandScore,
} from "./command-score.ts";
