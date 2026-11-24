import { CascadeSelect as Primitive } from "@fragiola/primitives-vue/cascade-select";
import { cascadeSelect } from "examples-shared/recipes/cascade-select";
import { styled } from "../styled.ts";

export const CascadeSelect = {
    Root: Primitive.Root,
    Portal: Primitive.Portal,
    Trigger: styled(Primitive.Trigger, cascadeSelect.trigger),
    Value: styled(Primitive.Value, cascadeSelect.value),
    Positioner: styled(Primitive.Positioner, cascadeSelect.positioner),
    Popup: styled(Primitive.Popup, cascadeSelect.popup),
    Level: styled(Primitive.Level, cascadeSelect.level),
    Item: styled(Primitive.Item, cascadeSelect.item),
    ItemIndicator: styled(
        Primitive.ItemIndicator,
        cascadeSelect["item-indicator"],
    ),
};
