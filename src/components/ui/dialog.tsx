import * as React from "react";

/**
 * Minimal, dependency-free Dialog exports.
 *
 * This project previously used shadcn/radix dialogs, but those dependencies
 * are not installed. Our current flow uses a custom modal in
 * `src/components/TemplateDropZone.tsx`.
 *
 * We keep these exports so any legacy imports don't break the build.
 */

export const Dialog = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const DialogPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const DialogOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={className} {...props} />
  )
);
DialogOverlay.displayName = "DialogOverlay";

export const DialogClose = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const DialogTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
);
DialogContent.displayName = "DialogContent";

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={className} {...props} />
);
export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={className} {...props} />
);

export const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h2 ref={ref} className={className} {...props} />
);
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={className} {...props} />
);
DialogDescription.displayName = "DialogDescription";
