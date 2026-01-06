import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

interface PopoverProps extends React.ComponentProps<typeof PopoverPrimitive.Root> {
  openOnHover?: boolean;
  closeDelay?: number;
}

function Popover({
  openOnHover = false,
  closeDelay = 200,
  ...props
}: PopoverProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  React.useEffect(() => {
    if (openOnHover) {
      clearTimeout(timeoutRef.current);
      if (isHovered) {
        setIsOpen(true);
      } else {
        timeoutRef.current = setTimeout(() => {
          setIsOpen(false);
        }, closeDelay);
      }
    }

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [isHovered, openOnHover, closeDelay]);

  const handleOpenChange = (open: boolean) => {
    if (!openOnHover) {
      props.onOpenChange?.(open);
    }
  };

  const handleMouseEnter = () => {
    if (openOnHover) {
      clearTimeout(timeoutRef.current);
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (openOnHover) {
      setIsHovered(false);
    }
  };

  return (
    <PopoverPrimitive.Root
      data-slot="popover"
      open={openOnHover ? isOpen : props.open}
      onOpenChange={handleOpenChange}
      {...props}
    >
      {React.Children.map(props.children, (child) => {
        if (React.isValidElement<React.HTMLAttributes<HTMLElement>>(child) && child.type === PopoverTrigger) {
          const childProps: React.HTMLAttributes<HTMLElement> = {
            ...child.props,
            onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
              child.props.onMouseEnter?.(e);
              handleMouseEnter();
            },
            onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
              child.props.onMouseLeave?.(e);
              handleMouseLeave();
            },
          };
          return React.cloneElement(child, childProps);
        }
        return child;
      })}
    </PopoverPrimitive.Root>
  );
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

interface PopoverContentProps extends React.ComponentProps<typeof PopoverPrimitive.Content> {
  onMouseEnter?: (event: React.MouseEvent) => void;
  onMouseLeave?: (event: React.MouseEvent) => void;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  onMouseEnter,
  onMouseLeave,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <div
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <PopoverPrimitive.Content
          data-slot="popover-content"
          align={align}
          sideOffset={sideOffset}
          className={cn(
            "bg-popover bg-background text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
            className
          )}
          {...props}
        />
      </div>
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
