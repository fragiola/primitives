import { AutocompleteClear } from "./autocomplete-clear.ts";
import { AutocompleteEmpty } from "./autocomplete-empty.ts";
import { AutocompleteGroup } from "./autocomplete-group.ts";
import { AutocompleteGroupLabel } from "./autocomplete-group-label.ts";
import { AutocompleteInput } from "./autocomplete-input.ts";
import { AutocompleteInputGroup } from "./autocomplete-input-group.ts";
import { AutocompleteItem } from "./autocomplete-item.ts";
import { AutocompleteList } from "./autocomplete-list.ts";
import { AutocompletePopup } from "./autocomplete-popup.ts";
import { AutocompletePortal } from "./autocomplete-portal.ts";
import { AutocompletePositioner } from "./autocomplete-positioner.ts";
import { AutocompleteRoot } from "./autocomplete-root.ts";
import { AutocompleteSeparator } from "./autocomplete-separator.ts";
import { AutocompleteStatus } from "./autocomplete-status.ts";
import { AutocompleteTrigger } from "./autocomplete-trigger.ts";
import { AutocompleteValue } from "./autocomplete-value.ts";

/** spec/autocomplete.md */
export const Autocomplete = {
    Root: AutocompleteRoot,
    InputGroup: AutocompleteInputGroup,
    Input: AutocompleteInput,
    Trigger: AutocompleteTrigger,
    Clear: AutocompleteClear,
    Value: AutocompleteValue,
    Status: AutocompleteStatus,
    Portal: AutocompletePortal,
    Positioner: AutocompletePositioner,
    Popup: AutocompletePopup,
    Empty: AutocompleteEmpty,
    List: AutocompleteList,
    Group: AutocompleteGroup,
    GroupLabel: AutocompleteGroupLabel,
    Separator: AutocompleteSeparator,
    Item: AutocompleteItem,
};
