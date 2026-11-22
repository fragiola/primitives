import type { PartProps } from "../../utils/render-element.tsx";
import {
    CalendarPageButton,
    type CalendarPageButtonState,
} from "./calendar-page-button.tsx";

export interface CalendarPrevButtonProps
    extends PartProps<CalendarPageButtonState> {}

/** Shows the previous page of months (`visibleMonths` of them); the consumer names it. */
export function CalendarPrevButton(props: CalendarPrevButtonProps) {
    return <CalendarPageButton delta={-1} {...props} />;
}
