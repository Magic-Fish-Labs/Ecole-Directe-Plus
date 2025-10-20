
import React, { useState, useRef, useEffect, ReactNode } from "react";
import { disableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock";
import { applyZoom, getZoomedBoudingClientRect } from "../../../utils/zoom";

import ScrollShadedDiv from "../CustomDivs/ScrollShadedDiv";

import "./BottomSheet.css";
import classBuilder from "../../../utils/classBuilder";

const CLOSING_COOLDOWN = 500; // ms
const DEFAULT_BREAKPOINTS = [0, 60, 95] ;

/**
 * @typedef {Object} ResizeOptions
 * @property {any} [resizingBreakpoints]
 * @property {number} [selectedBreakpoint]
 */

/**
 * @typedef {Object} BottomSheetProps
 * @property {string} className
 * @property {string} heading
 * @property {ResizeOptions} [resizeOptions]
 * @property {boolean} [forceClose]
 * @property {() => void} [onClose]
 * @property {(timer: number) => void} [onClosing]
 * @property {ReactNode} [children]
 */

/**
 * @param {BottomSheetProps} props
 * @returns {JSX.Element}
 */
export default function BottomSheet({ children, heading, onClose = () => { }, onClosing = () => { }, resizeOptions, forceClose = false, className = "" }) {
    const initialBreakpoints = (resizeOptions && resizeOptions.resizingBreakpoints) ?? DEFAULT_BREAKPOINTS;
    const initialSelectedBreakpoint = (resizeOptions && resizeOptions.selectedBreakpoint) ?? initialBreakpoints[initialBreakpoints.length - 1];

    const resizingBreakpoints = initialBreakpoints;
    const [targetSheetHeight, setTargetSheetHeight] = useState(initialSelectedBreakpoint);
    const [isResizing, setIsResizing] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    const [oldHeight, setOldHeight] = useState(targetSheetHeight);
    const [currentHeight, setCurrentHeight] = useState(targetSheetHeight);

    const targetSheetHeightVar = useRef(false);
    const openingTime = useRef(Date.now());

    const bottomSheetRef = useRef(null);
    const resizeHandlerRef = useRef(null);
    const contentRef = useRef(null);

    const grabPosition = useRef(null);
    const oldClosestResizingBreakpointIdx = useRef(0);
    const clickedInsideBottomSheet = useRef(false);
    const firstYPosition = useRef(0);
    const maxDistanceFromPointer = useRef(999);
    const oldEventClientY = useRef(null);

    useEffect(() => {
        targetSheetHeightVar.current = targetSheetHeight;
    }, [targetSheetHeight]);

    useEffect(() => {
        if (forceClose) {
            handleClose();
        }
    }, [forceClose])

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                handleClose();
            } else {
                if (event.target !== contentRef.current && !contentRef.current.contains(event.target)) {
                    // event.preventDefault();
                    if (event.key === "Home") {
                        resizeBottomSheetHeight(resizingBreakpoints[resizingBreakpoints.length - 1]);
                    } else if (event.key === "End") {
                        resizeBottomSheetHeight(resizingBreakpoints[1]);
                    } else {
                        let nextResizingBreakpointIdx = resizingBreakpoints.indexOf(targetSheetHeightVar.current);
                        if (nextResizingBreakpointIdx > 0) {
                            // si targetSheetHeight est à une valeur existante (= n'est pas en train d'être redimensionnée)
                            nextResizingBreakpointIdx += (event.key === "ArrowUp") * 1 + (event.key === "ArrowDown") * -1 + (event.key === "PageUp") * 2 + (event.key === "PageDown") * -2;
                            if (nextResizingBreakpointIdx <= 0) {
                                nextResizingBreakpointIdx = 1;
                            } else if (nextResizingBreakpointIdx >= resizingBreakpoints.length) {
                                nextResizingBreakpointIdx = resizingBreakpoints.length - 1;
                            }
                            resizeBottomSheetHeight(resizingBreakpoints[nextResizingBreakpointIdx]);
                        }
                    }
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = "";
        }
    }, []);


    useEffect(() => {
        const FAST_RESIZE_TRIGGERING_SHIFT = 8; // décalage avec la souris pour que ce soit considéré comme un clic et donc déclencher un fast resize
        if (!isResizing && !isClosing) {
            if (maxDistanceFromPointer.current < FAST_RESIZE_TRIGGERING_SHIFT) {
                fastResize();
            } else {
                fitToClosestResizingBreakpoint();
            }
            maxDistanceFromPointer.current = 999;
        }
    }, [isResizing])

    // closing
    const handleClose = () => {
        setIsClosing(true);
        onClosing();
        setTimeout(onClose, CLOSING_COOLDOWN);
        setTimeout(setIsOpen, CLOSING_COOLDOWN, false);
    }

    // enlève le tabIndex des éléments hors de la BottomSheet pour empêcher la navigation clavier
    useEffect(() => {
        const elements = document.body.querySelectorAll("*");
        const defaultTabIndex = [];
        elements.forEach((element) => {
            if (element !== bottomSheetRef.current && !bottomSheetRef.current?.contains(element) && element.tabIndex !== -1) {
                defaultTabIndex.push(element.tabIndex);
                // tout tabIndex négatif empêche le focus, on utilise le -2 pour reconnaître les items dont le focus est désactivé
                element.tabIndex = -2;
            }
        });

        return () => {
            // rétablit le focus
            elements.forEach((element, index) => {
                if (element.tabIndex === -2) {
                    element.tabIndex = defaultTabIndex[index];
                }
            });
        }
    }, []);

    // resizing
    function fitToClosestResizingBreakpoint() {
        let closestResizingBreakpointIdx = 0;
        const speed = (oldHeight - targetSheetHeight) * -10;
        const SPEED_FLOOR = 10;
        if (Math.abs(speed) >= SPEED_FLOOR) {
            // Ajuste selon la vitesse
            closestResizingBreakpointIdx = oldClosestResizingBreakpointIdx.current;
            const speedSign = speed / Math.abs(speed);
            if (closestResizingBreakpointIdx > 0) {
                if (speedSign < 0) {
                    closestResizingBreakpointIdx -= 1;
                } else {
                    if (closestResizingBreakpointIdx < resizingBreakpoints.length - 1) {
                        closestResizingBreakpointIdx += 1;
                    }
                }
            } else {
                if (speedSign > 0) {
                    closestResizingBreakpointIdx += 1;
                }
            }

            const TRIGGERING_SHIFT = 5;
            const diff = oldClosestResizingBreakpointIdx.current - closestResizingBreakpointIdx;
            if (diff > 0 && targetSheetHeight < resizingBreakpoints[closestResizingBreakpointIdx] + TRIGGERING_SHIFT && closestResizingBreakpointIdx > 0) {
                closestResizingBreakpointIdx -= 1;
            } else if (diff < 0 && targetSheetHeight > resizingBreakpoints[closestResizingBreakpointIdx] - TRIGGERING_SHIFT && closestResizingBreakpointIdx < resizingBreakpoints.length - 1) {
                closestResizingBreakpointIdx += 1;
            }
        } else {
            // Ajuste selon la distance
            closestResizingBreakpointIdx = 0;
            let minDistance = Math.abs(targetSheetHeight - resizingBreakpoints[0]);

            for (let i = 1; i < resizingBreakpoints.length; i++) {
                let dist = Math.abs(targetSheetHeight - resizingBreakpoints[i]);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestResizingBreakpointIdx = i;
                }
            }
        }


        const height = resizingBreakpoints[closestResizingBreakpointIdx];
        // ferme si pas assez haut
        if (height === 0) {
            handleClose();
        }
        setCurrentHeight(height);
        setOldHeight(height);
        resizeBottomSheetHeight(height);
    }

    function resizeBottomSheetHeight(newHeight) {
        setTargetSheetHeight(newHeight);
    }

    const handleMouseResize = (event) => {
        const clientY = applyZoom(event.clientY);
        const newHeight = (applyZoom(window.innerHeight) - clientY + grabPosition.current) / applyZoom(window.innerHeight) * 100;
        let distance = Math.abs(firstYPosition.current - clientY);
        if (distance > maxDistanceFromPointer.current) {
            maxDistanceFromPointer.current = distance;
        }
        resizeBottomSheetHeight(newHeight);
    }

    const handleTouchResize = (event) => {
        const clientY = applyZoom(event.touches[0].clientY);
        const newHeight = (applyZoom(window.innerHeight) - clientY + grabPosition.current) / applyZoom(window.innerHeight) * 100;
        let distance = Math.abs(firstYPosition.current - clientY);
        if (distance > maxDistanceFromPointer.current) {
            maxDistanceFromPointer.current = distance;
        }
        resizeBottomSheetHeight(newHeight);
    }

    useEffect(() => {
        setOldHeight(currentHeight);
        setCurrentHeight(targetSheetHeight);
    }, [targetSheetHeight]);

    const handleMouseUp = () => {
        clearAllBodyScrollLocks();
        window.removeEventListener('mousemove', handleMouseResize);
        setTimeout(setIsResizing, 0, false); // timeout pour éviter fermeture si le curseur est hors de la bottomSheet après resize
        if (bottomSheetRef.current) {
            bottomSheetRef.current.style.transition = ""; // réactive l'animation pour atteindre le cran le plus proche            
        }
        window.removeEventListener('mouseup', handleMouseUp);
    }

    const handleTouchEnd = () => {
        clearAllBodyScrollLocks();
        window.removeEventListener('touchmove', handleTouchResize);
        setTimeout(setIsResizing, 0, false); // timeout pour éviter fermeture si le curseur est hors de la bottomSheet après resize
        if (bottomSheetRef.current) {
            bottomSheetRef.current.style.transition = ""; // réactive l'animation pour atteindre le cran le plus proche            
        }
        oldEventClientY.current = undefined;
        contentRef.current.style.overflow = "";
        window.removeEventListener('touchend', handleTouchEnd);
    }

    const handleGrab = (event) => {
        if (!bottomSheetRef.current) {
            return 0;
        }
        disableBodyScroll(bottomSheetRef.current);
        const topPosition = getZoomedBoudingClientRect(bottomSheetRef.current?.getBoundingClientRect()).top;
        grabPosition.current = (event.touches ? (applyZoom(window.innerHeight) - topPosition - (applyZoom(window.innerHeight) - applyZoom(event.touches[0].clientY))) : (applyZoom(window.innerHeight) - topPosition - (applyZoom(window.innerHeight) - applyZoom(event.clientY))));
        firstYPosition.current = applyZoom(event.touches ? event.touches[0].clientY : event.clientY);
        maxDistanceFromPointer.current = 0;

        // Calcul du resizing breakpoint actuel
        let minDistance = Math.abs(targetSheetHeight - resizingBreakpoints[0]);

        for (let i = 1; i < resizingBreakpoints.length; i++) {
            let dist = Math.abs(targetSheetHeight - resizingBreakpoints[i]);
            if (dist < minDistance) {
                minDistance = dist;
                oldClosestResizingBreakpointIdx.current = i;
            }
        }

        setIsResizing(true);
        bottomSheetRef.current.style.transition = "0s"; // supprime l'animation pour le resizing libre
        // mouse
        window.addEventListener("mousemove", handleMouseResize);
        window.addEventListener('mouseup', handleMouseUp);
        // touchscreen
        window.addEventListener("touchmove", handleTouchResize);
        window.addEventListener('touchend', handleTouchEnd);
    }

    const fastResize = () => {
        return;
        let i;
        const length = resizingBreakpoints.length;
        // détermine l'extrême bas différent de 0
        for (i = 0; i < length; i++) {
            if (resizingBreakpoints[i] > 0) {
                break;
            }
        }
        if (oldClosestResizingBreakpointIdx.current === i) {
            resizeBottomSheetHeight(resizingBreakpoints[length - 1]);
        } else {
            resizeBottomSheetHeight(resizingBreakpoints[i]);
        }
    }

    // resizing avec le scroll
    const handleContentGrab = (event) => {
        oldEventClientY.current = applyZoom(event.touches[0].clientY);
        document.addEventListener("touchmove", handleTouchMove);
    }

    const handleTouchMove = (event) => {
        const scrollHeight = contentRef.current.scrollHeight; // hauteur du contenu réel
        const bottomSheetMaxHeight = resizingBreakpoints[resizingBreakpoints.length - 1] * applyZoom(window.innerHeight) * 0.01;
        const contentMaxHeight = bottomSheetMaxHeight - getZoomedBoudingClientRect(resizeHandlerRef.current.getBoundingClientRect()).height; // hauteur de la div de contenu

        const divHeight = contentRef.current.offsetHeight;
        const scrollTop = contentRef.current.scrollTop;
        const scrollBottom = (scrollHeight - divHeight) - scrollTop;

        const clientY = applyZoom(event.touches[0].clientY)
        const canResizeTop = (oldEventClientY.current < clientY && scrollTop === 0);
        const canResizeBottom = (oldEventClientY.current > clientY && scrollBottom === 0);
        if ((scrollHeight <= contentMaxHeight) || canResizeTop || canResizeBottom) {
            contentRef.current.style.overflow = "hidden"; // désactive le scrolling pendant le resizing
            handleGrab(event);
        }
        document.removeEventListener("touchmove", handleTouchMove);
    }

    return (isOpen &&
        <div className={classBuilder(`bottom-sheet ${className}`, { "closing": isClosing })} onPointerDown={(event) => !isResizing && !clickedInsideBottomSheet.current && (Date.now() - openingTime.current > CLOSING_COOLDOWN) ? handleClose() : null}>
            <div ref={bottomSheetRef} style={{ height: targetSheetHeight.toString() + "%" }} className={classBuilder("bottom-sheet-box", {"closing": isClosing})} onPointerDown={() => clickedInsideBottomSheet.current = true} onPointerUp={() => setTimeout(() => clickedInsideBottomSheet.current = false, 0)} >
                <div className="bottom-sheet-container">
                    <div className="resize-handle" tabIndex="0" ref={resizeHandlerRef} onMouseDown={handleGrab} onTouchStart={handleGrab}>
                        <div className="inner-resize-handle" ></div>
                        <button className="bottom-sheet-close-button" onClick={handleClose}>✕</button>
                        {heading && <h1 className="bottom-sheet-heading">{heading}</h1>}
                    </div>
                    <ScrollShadedDiv setRef={(ref) => { contentRef.current = ref.current }} id="bottom-sheet-content" onTouchStart={handleContentGrab} onTouchEnd={document.removeEventListener("touchmove", handleTouchMove)}>
                        {children}
                    </ScrollShadedDiv>
                </div>
            </div>
        </div>
    );
}