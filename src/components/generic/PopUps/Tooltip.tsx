
import { useState, useRef, createContext, useContext, forwardRef, cloneElement, type HTMLProps, ReactElement, ReactNode, Ref, isValidElement, Component, PureComponent, PropsWithChildren, HTMLAttributes, RefAttributes } from "react";
import {
    useFloating,
    useHover,
    useFocus,
    useClick,
    useDismiss,
    useRole,
    useInteractions,
    useTransitionStyles,
    autoUpdate,
    arrow,
    FloatingArrow,
    offset,
    flip,
    shift,
    safePolygon,
    useMergeRefs,
    FloatingPortal
} from "@floating-ui/react";
import type { Placement } from "@floating-ui/react";
// Check out the FloatingUI docs for more information : https://floating-ui.com/docs/react

import './Tooltip.css'
import { isFileServingAllowed } from "vite";

const ARROW_WIDTH = 16;
const ARROW_HEIGHT = 8;

export interface TooltipOptions {
    isOpen?: boolean,
    placement?: Placement,
    enableHover?: boolean,
    enableFocus?: boolean,
    enableClick?: boolean,
    enableDismiss?: boolean,
    animationDuration?: number,
    delay?: number,
    restDuration?: number,
    restFallbackDuration?: number,
    disableSafePolygon?: boolean,
    closeOnClickInside?: boolean,
}

function useTooltip({
    isOpen = false,
    placement = "top",
    enableHover = true,
    enableFocus = true,
    enableClick = false,
    enableDismiss = true,
    animationDuration = 250,
    delay = 0,
    restDuration = 0,
    restFallbackDuration = 0,
    disableSafePolygon = true,
}: TooltipOptions) {
    const [isOpenState, setIsOpen] = useState(isOpen);

    const arrowRef = useRef<SVGSVGElement>(null);

    // - - Floating properties - -
    const data = useFloating({
        open: isOpenState,
        onOpenChange: setIsOpen,
        // AutoUpdate position :
        // whileElementsMounted(...args) {
        //     const cleanup = autoUpdate(...args, { animationFrame: true });
        //     // Important! Always return the cleanup function.
        //     return cleanup;
        // },
        whileElementsMounted: autoUpdate,
        placement: placement,
        middleware: [offset(ARROW_HEIGHT + 2), flip(), shift({ padding: 10 }), arrow({ element: arrowRef })],
    });

    const context = data.context;
    const middlewareData = data.middlewareData;

    const arrowX = middlewareData.arrow?.x ?? 0;
    const arrowY = middlewareData.arrow?.y ?? 0;
    const transformX = arrowX + ARROW_WIDTH / 2;
    const transformY = arrowY + ARROW_HEIGHT;

    // - - Interactions - -
    const hover = useHover(context, {
        enabled: enableHover,
        restMs: restDuration,
        delay: { open: restDuration ? restFallbackDuration : delay },
        handleClose: disableSafePolygon ? safePolygon() : null
    });

    const focus = useFocus(context, {
        enabled: enableFocus
    });

    const click = useClick(context, {
        enabled: enableClick
    });

    const dismiss = useDismiss(context, {
        enabled: enableDismiss,
        outsidePressEvent: 'click'
    });

    const role = useRole(context, {
        role: "tooltip"
    });

    const interactions = useInteractions([
        hover,
        focus,
        click,
        dismiss,
        role
    ]);

    // - - Transitions - -
    const transition = useTransitionStyles(context, {
        duration: animationDuration,

        initial: ({ side }) => ({
            opacity: 0,
            // transform: "scale(0)",
            // scale: 0
            translate: side === 'top'
                ? "0px 8px"
                : "0px -8px",
            // scale: "0",
        }),

        common: ({ side }) => ({
            transformOrigin: {
                top: `${transformX}px calc(100% + ${ARROW_HEIGHT}px)`,
                bottom: `${transformX}px ${-ARROW_HEIGHT}px`,
                left: `calc(100% + ${ARROW_HEIGHT}px) ${transformY}px`,
                right: `${-ARROW_HEIGHT}px ${transformY}px`
            }[side]
        }),

        // open: {
        //     // opacity: 1,
        //     // transform: "scale(1)",
        //     // translate: "none",
        // },
    });

    return ({
        isOpen: isOpenState,
        setIsOpen,
        arrowRef,
        ...interactions,
        ...transition,
        ...data
    })
}

const TooltipContext = createContext<{ tooltip: ReturnType<typeof useTooltip>, options: TooltipOptions }>(null);

function useTooltipContext() {
    // Fonction pour sécuriser la récupération du context
    const context = useContext(TooltipContext);

    if (context === null) {
        throw new Error("TooltipTrigger or TooltipContent components must be wrapped in <Tooltip />");
    }

    return context;
};

export function Tooltip({ children, className = "", id = "", options = {} }: { children: ReactNode, className?: string, id?: string, options?: TooltipOptions }) {
    const tooltip = useTooltip(options);

    return <div className={`tooltip ${className}`} id={id}>
        <TooltipContext.Provider value={{ tooltip, options }}>
            {children}
        </TooltipContext.Provider>
    </div>;
}

export function TooltipTrigger({ children, ...props }: Record<string, any> & { children: ReactElement }) {
    const { tooltip } = useTooltipContext();

    const referenceProps = tooltip.getReferenceProps({
        ...props,
        ...(typeof children.props === "object" ? children.props : undefined),
        ...{ "data-state": tooltip.isOpen ? "open" : "closed" }, // typescript trix to allow data-* props
        ref: tooltip.refs.setReference,
        tabIndex: 0,
    })

    if (isValidElement(children)) {
        return cloneElement(children, referenceProps);
    } else {
        return <div {...referenceProps}>{children}</div>
    }
}

export function TooltipContent({ children, style, className = "", ...props }: PropsWithChildren<Record<string, any>>) {
    const { tooltip, options } = useTooltipContext();

    // Affiche / N'affiche pas la tooltip
    if (!tooltip.isMounted) return null;

    // Gestion du clic à l'intérieur pour fermer la tooltip
    const handleClickInside = () => {
        if (options.closeOnClickInside) {
            tooltip.setIsOpen(false);
        }
    };

    return (
        <FloatingPortal>
            <div
                ref={tooltip.refs.setFloating}
                className={`tooltip-content ${className}`}
                style={{
                    ...tooltip.floatingStyles,
                    ...tooltip.styles,
                    ...style
                }}
                {...tooltip.getFloatingProps(props)}
                onClick={handleClickInside}
            >
                <FloatingArrow className={`floating-arrow ${className}`} ref={tooltip.arrowRef} context={tooltip.context} tipRadius={2} width={ARROW_WIDTH} height={ARROW_HEIGHT} />
                {children}
            </div>
        </FloatingPortal>
    );
}
