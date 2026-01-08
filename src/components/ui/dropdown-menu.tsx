'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const DropdownMenuContext = React.createContext<{
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({ open: false, setOpen: () => { } });

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('[data-dropdown]')) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => document.removeEventListener('click', handleClickOutside);
    }, [open]);

    return (
        <DropdownMenuContext.Provider value={{ open, setOpen }}>
            <div className="relative" data-dropdown>{children}</div>
        </DropdownMenuContext.Provider>
    );
};

const DropdownMenuTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, children, asChild, onClick, ...props }, ref) => {
    const { setOpen } = React.useContext(DropdownMenuContext);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setOpen(prev => !prev);
        onClick?.(e);
    };

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            ref,
            onClick: handleClick,
            ...props,
        });
    }
    return (
        <button ref={ref} className={className} onClick={handleClick} {...props}>
            {children}
        </button>
    );
});
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { align?: 'start' | 'end' }
>(({ className, align = 'start', children, ...props }, ref) => {
    const { open } = React.useContext(DropdownMenuContext);

    if (!open) return null;

    return (
        <div
            ref={ref}
            className={cn(
                'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-slate-950 shadow-md',
                'animate-in fade-in-0 zoom-in-95',
                align === 'end' ? 'right-0' : 'left-0',
                'top-full mt-2',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, onClick, ...props }, ref) => {
    const { setOpen } = React.useContext(DropdownMenuContext);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        onClick?.(e);
        setOpen(false);
    };

    return (
        <div
            ref={ref}
            className={cn(
                'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
                'hover:bg-slate-100 focus:bg-slate-100',
                'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                className
            )}
            onClick={handleClick}
            {...props}
        />
    );
});
DropdownMenuItem.displayName = 'DropdownMenuItem';

const DropdownMenuLabel = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn('px-2 py-1.5 text-sm font-semibold', className)}
            {...props}
        />
    );
});
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

const DropdownMenuSeparator = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn('-mx-1 my-1 h-px bg-slate-200', className)}
            {...props}
        />
    );
});
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
};
