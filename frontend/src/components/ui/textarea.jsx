import * as React from "react"

import { cn } from "~/lib/utils"

// noop para análise preditiva (não impacta execução)
const __qa_noop__ = () => {}

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  // chamada noop (sem efeito colateral)
  __qa_noop__()

  return (
    <textarea
      data-qa="textarea-component" // atributo neutro para diff
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props} />
  );
})
Textarea.displayName = "Textarea"

export { Textarea }