import { Autocomplete as Primitive } from "@fragiola/primitives-vue/autocomplete";
import { autocomplete } from "examples-shared/recipes/autocomplete";
import { styled } from "../styled.ts";

export const Autocomplete = {
    Root: Primitive.Root,
    Portal: Primitive.Portal,
    Value: Primitive.Value,
    InputGroup: styled(Primitive.InputGroup, autocomplete["input-group"]),
    Input: styled(Primitive.Input, autocomplete.input),
    Trigger: styled(Primitive.Trigger, autocomplete.trigger),
    Clear: styled(Primitive.Clear, autocomplete.clear),
    Status: styled(Primitive.Status, autocomplete.status),
    Positioner: styled(Primitive.Positioner, autocomplete.positioner),
    Popup: styled(Primitive.Popup, autocomplete.popup),
    Empty: styled(Primitive.Empty, autocomplete.empty),
    List: styled(Primitive.List, autocomplete.list),
    Group: styled(Primitive.Group, autocomplete.group),
    GroupLabel: styled(Primitive.GroupLabel, autocomplete["group-label"]),
    Separator: styled(Primitive.Separator, autocomplete.separator),
    Item: styled(Primitive.Item, autocomplete.item),
};
