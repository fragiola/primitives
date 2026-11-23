import { AutocompleteClear } from "./autocomplete-clear.tsx";
import { AutocompleteEmpty } from "./autocomplete-empty.tsx";
import { AutocompleteGroup } from "./autocomplete-group.tsx";
import { AutocompleteGroupLabel } from "./autocomplete-group-label.tsx";
import { AutocompleteInput } from "./autocomplete-input.tsx";
import { AutocompleteInputGroup } from "./autocomplete-input-group.tsx";
import { AutocompleteItem } from "./autocomplete-item.tsx";
import { AutocompleteList } from "./autocomplete-list.tsx";
import { AutocompletePopup } from "./autocomplete-popup.tsx";
import { AutocompletePortal } from "./autocomplete-portal.tsx";
import { AutocompletePositioner } from "./autocomplete-positioner.tsx";
import { AutocompleteRoot } from "./autocomplete-root.tsx";
import { AutocompleteSeparator } from "./autocomplete-separator.tsx";
import { AutocompleteStatus } from "./autocomplete-status.tsx";
import { AutocompleteTrigger } from "./autocomplete-trigger.tsx";
import { AutocompleteValue } from "./autocomplete-value.tsx";

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
