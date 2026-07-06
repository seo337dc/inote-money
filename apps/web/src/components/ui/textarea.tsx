import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full min-w-0 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-green-200 dark:focus-visible:ring-green-800 focus-visible:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
