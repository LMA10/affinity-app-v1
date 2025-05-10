import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm font-['Helvetica','Arial',sans-serif] [&_button:disabled]:bg-[#0C2027] [&_button:disabled]:border [&_button:disabled]:border-[#506C77]",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-[0.375rem] p-6 pb-0 font-['Helvetica','Arial',sans-serif] [&_button:disabled]:bg-[#0C2027] [&_button:disabled]:border [&_button:disabled]:border-[#506C77]", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-[16px] font-semibold leading-none tracking-tight font-['Helvetica','Arial',sans-serif] text-white [&_button:disabled]:bg-[#0C2027] [&_button:disabled]:border [&_button:disabled]:border-[#506C77]",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-[12px] font-['Helvetica','Arial',sans-serif] text-[#3F6978] [&_button:disabled]:bg-[#0C2027] [&_button:disabled]:border [&_button:disabled]:border-[#506C77]", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const children = React.Children.map(props.children, child => {
    if (
      React.isValidElement(child) &&
      typeof child.type === 'string' &&
      child.type === 'p'
    ) {
      // Check if the text content matches any of the specified labels
      const text = (child.props as any)?.children;
      const whiteLabels = ['Status', 'Owner', 'Alert Name', 'Client'];
      const shouldBeWhite = whiteLabels.includes(text);

      return React.cloneElement(child as React.ReactElement<any>, {
        className: cn(
          (child.props as any)?.className,
          "text-[12px] font-['Helvetica','Arial',sans-serif]",
          shouldBeWhite ? "text-white" : "text-[#3F6978]"
        )
      })
    }
    return child
  })

  return (
    <div 
      ref={ref} 
      className={cn(
        "p-6 pt-2 font-['Helvetica','Arial',sans-serif] text-white [&_button:disabled]:bg-[#0C2027] [&_button:disabled]:border [&_button:disabled]:border-[#506C77]",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
})
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 font-['Helvetica','Arial',sans-serif] [&_button:disabled]:bg-[#0C2027] [&_button:disabled]:border [&_button:disabled]:border-[#506C77]", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
