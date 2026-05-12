import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownContext = React.createContext<DropdownContextType>({
  open: false,
  setOpen: () => {},
});

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (open) setOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({ 
  children, 
  className, 
  asChild 
}: { 
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}) {
  const { open, setOpen } = React.useContext(DropdownContext);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>
    return React.cloneElement(child, {
      onClick: handleClick,
      className: cn(child.props.className, className),
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <button
      type="button"
      className={cn("flex items-center justify-center", className)}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({ 
  children, 
  className,
  align = "end",
  sideOffset = 4
}: { 
  children: React.ReactNode;
  className?: string;
  align?: "start" | "end" | "center";
  sideOffset?: number;
}) {
  const { open } = React.useContext(DropdownContext);

  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md",
        {
          "right-0": align === "end",
          "left-0": align === "start",
          "left-1/2 -translate-x-1/2": align === "center"
        },
        className
      )}
      style={{ marginTop: sideOffset }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ 
  children,
  className,
  asChild,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { 
  asChild?: boolean;
  children: React.ReactNode;
}) {
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>
    return React.cloneElement(child, {
      className: cn("block w-full", child.props.className, className),
      ...props
    });
  }

  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuLabel({ 
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-2 py-1.5 text-sm font-semibold", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ 
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("-mx-1 my-1 h-px bg-gray-100", className)}
      {...props}
    />
  );
}

export function DropdownMenuRadioGroup({ 
  value,
  onValueChange,
  children,
  className,
  ...props
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        const radioChild = child as React.ReactElement<{ value?: string }>
        return React.cloneElement(radioChild, {
          checked: radioChild.props.value === value,
          onClick: () => onValueChange?.(radioChild.props.value),
        } as Record<string, unknown>);
      })}
    </div>
  );
}

export function DropdownMenuRadioItem({ 
  children,
  className,
  checked,
  value,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  checked?: boolean;
  value: string;
}) {
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100",
        checked && "bg-gray-100",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <span className="h-2 w-2 rounded-full bg-current" />}
      </span>
      {children}
    </div>
  );
}

export function DropdownMenuSub({ children }: { children: React.ReactNode }) {
  return <div className="relative">{children}</div>
}

export function DropdownMenuSubTrigger({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) {
  return (
    <div className={cn('flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm', className)} {...props}>
      {children}
    </div>
  )
}

export function DropdownMenuSubContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) {
  return (
    <div className={cn('min-w-[8rem] rounded-md border bg-white p-1 shadow-md', className)} {...props}>
      {children}
    </div>
  )
}
