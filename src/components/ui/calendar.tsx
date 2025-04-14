import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "space-y-4",
        month: "space-y-6",
        caption: "flex justify-start pb-4 text-2xl font-bold",
        caption_label: "text-left",
        nav: "hidden",
        table: "w-full border-collapse",
        head_row: "grid grid-cols-7 gap-1",
        head_cell: "text-sm font-medium text-gray-700",
        row: "grid grid-cols-7 gap-1 mt-1",
        cell: "relative p-0 text-center focus-within:relative focus-within:z-20",
        day: "h-10 w-10 p-0 text-sm font-normal aria-selected:opacity-100 rounded-none border border-transparent hover:bg-gray-100 mx-auto flex items-center justify-center",
        day_selected: "bg-white text-black border border-red-500",
        day_today: "bg-white text-black",
        day_outside: "bg-gray-300 text-gray-800 opacity-75",
        day_disabled: "text-gray-400 opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };