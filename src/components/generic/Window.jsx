
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { disableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock";
import { AppContext } from "../../App";
import { applyZoom, getZoomedBoudingClientRect } from "../../utils/zoom";
import { currentPeriodEvent } from "./events/setPeriodEvent";
import SnowCap from "../graphics/snowCap";

import "./Window.css";
import "./events/christmas/snow.css";


function useWindowsContainer(options) {
    /** 
    * available options:
    * animateWindows (bool)
    * allowWindowsManagement (bool)
    */
    const animateWindows = options?.animateWindows ?? true;
    const allowWindowsManagement = options?.allowWindowsManagement ?? true;
    const windows = [];
    const fullscreenInfo = []
    const windowsLayouts = [];
    const moveableContainers = [];

    return ({
        animateWindows,
        allowWindowsManagement,
        windows,
        fullscreenInfo,
        windowsLayouts,
        moveableContainers
    })
}


const WindowsContainerContext = createContext(null);

function useWindowsContainerContext() {
    // Fonction pour sécuriser la récupération du context
    const context = useContext(WindowsContainerContext);

    if (context === null) {
        throw new Error("WindowsLayout, MoveableContainer, Window, WindowHeader or WindowContent components must be wrapped in <WindowsContainer />");
    }

    return context;
};


export function WindowsContainer({ children, name = "", className = "", id = "", animateWindows = true, allowWindowsManagement = true, ...props }) {
    const { activeAccount, useUserSettings, isTabletLayout } = useContext(AppContext);

    const windowArrangementSetting = useUserSettings("windowArrangement");
    const displayMode = useUserSettings("displayMode");
    const allowWindowsArrangement = useUserSettings("allowWindowsArrangement");

    name = (isTabletLayout ? "tablet-" : "") + name;
    const windowsContainer = useRef({
        animateWindows,
        windows: [],
        fullscreenInfo: [],
        windowsLayouts: [],
        moveableContainers: []
    });

    const windowsContainerRef = useRef(null);
    const floatingPortalRef = useRef(null);
    const latestClick = useRef(null);
    const isGrabbing = useRef(false);

    function getWindowArrangement() {
        /**
         * This function returns the current windowArrangement
         */
        const windowArrangement = [];
        for (let window of windowsContainer.current.windows) {
            windowArrangement.push({ name: window.current.name, order: window.current.style.order });
        }

        for (let windowLayout of windowsContainer.current.windowsLayouts) {
            windowArrangement.push({ name: windowLayout.current.name, order: windowLayout.current.style.order });
        }

        for (let moveableContainer of windowsContainer.current.moveableContainers) {
            windowArrangement.push({ name: moveableContainer.current.name, order: moveableContainer.current.style.order });
        }

        return windowArrangement;
    }


    function setWindowArrangement(windowArrangement) {
        /**
         * This function apply the given windowArrangement
         * @param windowArrangement Array of objects which follow this pattern: { name: moveableElementName, order: moveableElementOrder }
         * (the name attribute allow to precisely target the element)
         */

        if (windowArrangement !== undefined && windowArrangement.length > 0) {
            for (let item of windowArrangement) {
                for (let window of windowsContainer.current.windows) {
                    if (item.name === window.current.name) {
                        window.current.style.order = item.order;
                        break;
                    }
                }

                for (let windowLayout of windowsContainer.current.windowsLayouts) {
                    if (item.name === windowLayout.current.name) {
                        windowLayout.current.style.order = item.order;
                        break;
                    }
                }

                for (let moveableContainer of windowsContainer.current.moveableContainers) {
                    if (item.name === moveableContainer.current.name) {
                        moveableContainer.current.style.order = item.order;
                        break;
                    }
                }
            }
        } else {
            // reset the CSS "order" of the flex containers
            digChildren(windowsContainerRef.current,
                (el) => {
                    // action
                    if (el.classList.contains("windows-layout") || el.classList.contains("moveable-container")) {
                        orderChildrenInDOM(el, true); // reset
                    }
                },
                (el) => {
                    // condition
                    return el.classList.contains("windows-layout") || el.classList.contains("window") || el.classList.contains("moveable-container") ? true : false
                });
        }
    }


    function saveWindowArrangement(windowArrangement) {
        /**
         * This function save the given windowArrangement in the userSettings and then in the localStorage
         * @param windowArrangement Array of objects which follow this pattern: { name: moveableElementName, order: moveableElementOrder }
         */
        if (name) {
            // windowArrangementSetting.set((oldWindowArrangement) => [...oldWindowArrangement.filter((windowArrangement) => windowArrangement.name !== name), { name, windowArrangement }]);
            windowArrangementSetting.set([...windowArrangementSetting.get().filter((windowArrangement) => windowArrangement.name !== name), { name, windowArrangement }]);
        }
    }


    function digChildren(element, action = (() => 0), condition = (() => true), children = []) {
        /**
         * This recursive function maps all the children elements of the element given in parameter
         * @param element Element around which it looks for children
         * @param action A function that take the element in parameter and which is executed on each child
         * @param condition A function that take the element in parameter and return a boolean used to consider or not an element as a child
         */
        if (element.children.length) {
            for (let child of element.children) {
                if (condition(child)) {
                    children.push(child);
                }
                children.concat(digChildren(child, action, condition, children));
            }
        }
        action(element);

        return children
    }


    function mapSiblings(element, condition = (() => true), siblings = [], knownSiblings = []) {
        /**
         * This function maps all the sibling elements of the given element
         * @param element Element around which it looks for siblings
         * @param condition a function that take the element in parameter and return a boolean used to consider or not an element as a sibling
         * @param siblings The already registered siblings
         * @param knownSiblings The already known siblings, here to ensure an ascendant order
         */
        knownSiblings.push(element)

        // previous sibling element
        const previousElementSibling = element.previousElementSibling;
        if (previousElementSibling !== null && !knownSiblings.includes(previousElementSibling)) {
            siblings.concat(mapSiblings(previousElementSibling, condition, siblings, knownSiblings));
        }

        // current element
        if (condition(element)) {
            siblings.push(element)
        }

        // next sibling element
        const nextElementSibling = element.nextElementSibling;
        if (nextElementSibling !== null && !knownSiblings.includes(nextElementSibling)) {
            siblings.concat(mapSiblings(nextElementSibling, condition, siblings, knownSiblings));
        }

        return siblings;
    }


    function mapMoveableElements(targetElement) {
        /**
         * This function maps all the moveable elements around and above the targeted element (siblings & parents)
         * @param targetElement Element around which it looks for moveable elements
        */

        const moveableElements = [];
        let currentElement = targetElement;

        const isMoveableElement = (element) => {
            // check if the element is moveable and is not the targetElement
            if ((element.classList.contains("window") ||
                element.classList.contains("windows-layout") ||
                element.classList.contains("moveable-container")) &&
                element !== currentElement) {
                return true;
            } else {
                return false;
            }
        }

        while (currentElement && currentElement.id !== "windows-container") {
            // data structure: array of couple moveableElement - moveableElement's siblings
            // this way, we only change the CSS "order" of the moveableElements according to the position of the moveableElement's siblings
            moveableElements.push([currentElement, mapSiblings(currentElement, isMoveableElement)]);
            currentElement = currentElement.parentElement;
        }

        return moveableElements;
    }


    function sortByCSSOrder(elements) {
        const elementsCopy = [...elements];
        return elementsCopy.sort((elA, elB) => parseInt(elA?.style.order) - parseInt(elB?.style.order));
    }


    function sortMoveableElementsByCSSOrder(moveableElements) {
        /**
         * Sort the list by the "order" css property of the elements
         * @param moveableElements Structured data which contains all the relevant moveable elements
         */
        let elementsCopy = [...moveableElements];
        moveableElements.map((item, index) => {
            let array = sortByCSSOrder(item[1]);
            elementsCopy[index][1] = array;
        })

        return elementsCopy;
    }


    function orderChildrenInDOM(flexContainer, reset = false) {
        /**
         * Add an "order" css property to each child of the flexContainer
         * @param flexContainer Parent element with a display flex
         * @param reset a boolean which control weather it resets the "order" css property of the elements according to their order in the DOM
         */
        let index = 1;
        for (let element of flexContainer.children) {
            // order only if the element is a moveable element
            if (element.classList.contains("window") || element.classList.contains("windows-layout") || element.classList.contains("moveable-container")) {
                if (reset || element.style.order === "") {
                    element.style.order = index;
                }
                index += 1;
            }
        }
    }


    function orderMoveableElementsInDOM(moveableElements) {
        /**
         * Add an "order" css property to each moveable element
         * @param moveableElements Structured data which contains all the relevant moveable elements
         */
        for (let item of moveableElements.toSpliced(0, 1)) {
            orderChildrenInDOM(item[0]);
        }
    }


    function swapElementsCSSOrder(elementA, elementB) {
        /**
         * Swap the "order" css property of the given elements
         */
        const buffer = elementA.style.order;
        elementA.style.order = elementB.style.order;
        elementB.style.order = buffer;
    }


    function rearrangeWindows(mouse, moveableElements) {
        /**
         * Rearrange the windows by changing the css "order" property according to mouse position and moveableElements position and bounds
         * @param mouse Object that contains x and y position of the mouse in the viewport
         * @param moveableElements Structured data which contains all the relevant moveable elements
         */
        for (let item of moveableElements) {
            const movingElement = item[0];
            const siblingElements = item[1];
            siblingElements.map((element, index) => {
                const direction = parseInt(movingElement.style.order) - parseInt(element.style.order);
                const rect = getZoomedBoudingClientRect(element.getBoundingClientRect());
                const movingRect = getZoomedBoudingClientRect(movingElement.getBoundingClientRect());
                let conditionX = false, conditionY = false;
                if (direction > 0) {
                    // movingElement after element
                    // setup the conditions according to the movingElement's width and the targetElement's width
                    if (movingRect.width > rect.width) {
                        conditionX = mouse.x < (rect.x + rect.width);
                    } else {
                        conditionX = mouse.x < (rect.x + movingRect.width);
                    }

                    if (movingRect.height > rect.height) {
                        conditionY = mouse.y < (rect.y + rect.height);
                    } else {
                        conditionY = mouse.y < (rect.y + movingRect.height);
                    }
                } else {
                    // movingElement before element
                    // setup the conditions according to the movingElement's height and the targetElement's height
                    if (movingRect.width > rect.width) {
                        conditionX = mouse.x > rect.x;
                    } else {
                        conditionX = mouse.x > (rect.x + rect.width - movingRect.width);
                    }

                    if (movingRect.height > rect.height) {
                        conditionY = mouse.y > rect.y;
                    } else {
                        conditionY = mouse.y > (rect.y + rect.height - movingRect.height);
                    }
                    // evaluate the conditions
                }
                if (conditionX && conditionY) {
                    swapElementsCSSOrder(movingElement, element);
                }
            });
        }
    }


    function moveFloatingWindow(mouse, mouseOrigin, windowOrigin, floatingWindow) {
        floatingWindow.style.left = windowOrigin.x + mouse.x - mouseOrigin.x + "px";
        floatingWindow.style.top = windowOrigin.y + mouse.y - mouseOrigin.y + "px";
    }


    function scrollViewport(mouse, scrollableParentElement) {
        if (scrollableParentElement === null) {
            return 0;
        }

        scrollableParentElement.style.scrollBehavior = "auto";

        const bounds = getZoomedBoudingClientRect(scrollableParentElement.getBoundingClientRect());

        const SCROLLING_EDGE_SHIFT = 100; // px
        const SCROLLING_SPEED = 3; // px/frame

        if (mouse.y < bounds.y + SCROLLING_EDGE_SHIFT) {
            scrollableParentElement.scrollBy(0, -SCROLLING_SPEED);
        } else if (mouse.y > (bounds.y + bounds.height) - SCROLLING_EDGE_SHIFT) {
            scrollableParentElement.scrollBy(0, SCROLLING_SPEED);
        }
        if (mouse.x < bounds.x + SCROLLING_EDGE_SHIFT) {
            scrollableParentElement.scrollBy(-SCROLLING_SPEED, 0);
        } else if (mouse.x > (bounds.x + bounds.width) - SCROLLING_EDGE_SHIFT) {
            scrollableParentElement.scrollBy(SCROLLING_SPEED, 0);
        }

        scrollableParentElement.style.scrollBehavior = "";

        return 0;
    }


    function preventDraggingIssues(scrollTarget) {
        document.body.style.overflow = "hidden";
        disableBodyScroll(scrollTarget);
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            element.style.userSelect = "none";
            element.style.webkitUserSelect = "none";
            element.style.overscrollBehavior = "contain";
        });
    }

    function unpreventDraggingIssues() {
        document.body.style.overflow = "";
        clearAllBodyScrollLocks();
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            element.style.userSelect = "";
            element.style.webkitUserSelect = "";
            element.style.overscrollBehavior = "";
        });
    }


    const unfloatWindow = (floatingWindow, targetWindow) => {
        const boundingClientRect = getZoomedBoudingClientRect(targetWindow.getBoundingClientRect());
        const computedStyle = getComputedStyle(targetWindow);
        const scale = computedStyle.getPropertyValue("scale") === "none" ? 1 : computedStyle.getPropertyValue("scale");

        floatingWindow.style.transition = "all 0.4s ease, scale 0.2s ease";
        setTimeout(() => (floatingWindow.style.scale = 1), 0);

        floatingWindow.style.height = boundingClientRect.height / scale + "px";
        floatingWindow.style.width = boundingClientRect.width / scale + "px";

        floatingWindow.style.left = boundingClientRect.x - (((1 - scale) * boundingClientRect.width) / 2) + "px";
        floatingWindow.style.top = boundingClientRect.y - (((1 - scale) * boundingClientRect.height) / 2) + "px";
        // floatingWindow.style.left = boundingClientRect.x + "px";
        // floatingWindow.style.top = boundingClientRect.y + "px";

        floatingWindow.classList.add("unfloating");

        setTimeout(() => {
            unpreventDraggingIssues();

            targetWindow.classList.remove("moving")
            floatingWindow.remove()
        }, displayMode.get() === "quality" ? 400 : 0);
    }

    const handleFullscreen = (targetWindow) => {
        if (document.webkitIsFullScreen ?? document.mozFullScreen) {
            document.exitFullscreen();
        }

        let idx;
        for (idx = 0; idx < windowsContainer.current.windows.length; idx++) {
            if (windowsContainer.current.windows[idx].current === targetWindow) {
                break;
            }
        }
        if (windowsContainer.current.fullscreenInfo[idx].allowFullscreen) {
            let targetElement;
            if (windowsContainer.current.fullscreenInfo[idx].fullscreenTargetName === "self") {
                targetElement = targetWindow;
            } else {
                targetElement = document.getElementsByName(windowsContainer.current.fullscreenInfo[idx].fullscreenTargetName)[0];
            }
            // console.log("windowsContainer.current.fullscreenInfo[idx].fullscreenTargetName:", windowsContainer.current.fullscreenInfo[idx].fullscreenTargetName)
            // console.log("targetElements:", targetElement)
            const handleFullscreenChange = () => {
                // prevent from selecting
                if (window.getSelection) {
                    var selection = window.getSelection();
                    selection.removeAllRanges();
                }
            }

            targetElement.onfullscreenchange = handleFullscreenChange;
            if ("requestFullscreen" in targetElement) {
                targetElement.requestFullscreen(handleFullscreenChange);
            } else if ("webkitRequestFullScreen" in targetElement) {
                targetElement.webkitRequestFullScreen(handleFullscreenChange);
            } else {
                return false;
            }


            return true;
        }

        return false;
    }

    function handleMouseDown(event) {
        if (isGrabbing.current) {
            return 0;
        }
        isGrabbing.current = true
        // prevent from selecting
        if (window.getSelection) {
            var selection = window.getSelection();
            selection.removeAllRanges();
        }
        // Check double click
        let doubleClicked = false;
        if (latestClick.current !== null && (Date.now() - latestClick.current) < 400) {
            console.log("DOUBLE CLICKED!");
            doubleClicked = true;
        }
        latestClick.current = Date.now();

        let reorderStarted = false;
        let oldWindowArrangement;
        let floatingWindow;
        let scrollableParentElement;
        const windowOrigin = {};
        let moveableElements;

        function constantDeltaScale(element, delta, reference = "height") {
            // console.log("constantDeltaScale ~ reference:", reference)
            const scale = parseFloat(getComputedStyle(element).getPropertyValue("scale") === "none" ? 1 : getComputedStyle(element).getPropertyValue("scale"));
            const bounds = getZoomedBoudingClientRect(element.getBoundingClientRect());
            const scaledReference = bounds[reference] / scale;
            let scaleFactor = (scaledReference + delta) / scaledReference;
            const MIN_SCALE = .9;
            if (scaleFactor < MIN_SCALE) {
                scaleFactor = MIN_SCALE;
            }
            element.style.scale = scaleFactor;
        }

        function lookForClosestScrollableParentElement(element) {
            /**
             * Return the closest scrollable parent element.
             * A scrollable element has overflowing content and has the css overflow property set to "auto" or "scroll"
             */
            let currentElement = element.parentElement;
            let currentElementComputedStyle = getComputedStyle(currentElement);
            while (currentElement !== null) {

                let contentHeight = currentElement.scrollHeight;
                let divHeight = currentElement.offsetHeight;
                let scrollTop = currentElement.scrollTop;
                let scrollBottom = (contentHeight - divHeight) - scrollTop;

                let contentWidth = currentElement.scrollWidth;
                let divWidth = currentElement.offsetWidth;
                let scrollLeft = currentElement.scrollLeft;
                let scrollRight = (contentWidth - divWidth) - scrollLeft;

                if ((scrollTop > 0 || scrollBottom > 0 || scrollLeft > 0 || scrollRight > 0) && (currentElementComputedStyle.overflow === "auto" || currentElementComputedStyle.overflow === "scroll")) {
                    // found a scrollable element
                    break;
                }
                currentElement = currentElement.parentElement;
                currentElementComputedStyle = (currentElement !== null) ? getComputedStyle(currentElement) : undefined;
            }

            if (currentElement === null) {
                // the element doesn't have a scrollable element as its parent
                return null;
            }

            return currentElement;
        }

        function lookForClosestWindowParent(element) {
            /**
             * Return the closest window parent
             * A window is basically an element with a "window" class (check out the Window component)
             */
            let currentElement = element.parentElement;
            while (!currentElement.classList.contains("window") && currentElement !== null) {
                currentElement = currentElement.parentElement;
            }

            if (currentElement === null) {
                throw new Error("This element: " + element + " doesn't have a window as its parent, although it's supposed to have one.")
            }

            return currentElement;
        }

        const startReorder = (targetWindow) => {
            if (document.webkitIsFullScreen ?? document.mozFullScreen) {
                return 0;
            }
            reorderStarted = true;
            // prevent from selecting
            if (window.getSelection) {
                var selection = window.getSelection();
                selection.removeAllRanges();
            }
            preventDraggingIssues(targetWindow);

            // vibrate (android only)
            if ("vibrate" in navigator) {
                navigator.vibrate(50);
            }

            // save current window arrangement
            oldWindowArrangement = getWindowArrangement();
            // console.log("oldWindowArrangement", oldWindowArrangement);

            scrollableParentElement = lookForClosestScrollableParentElement(targetWindow);
            // disable scrolling on mobile (when the manipulation to grab and move a window is the same as scrolling)
            if (scrollableParentElement && event.touches) {
                scrollableParentElement.style.overflow = "hidden";
            }
            // console.log("scrollableParentElement", scrollableParentElement);

            
            floatingWindow = targetWindow.cloneNode(true);
            // console.log("floatingWindow:", floatingWindow)
            
            // reapply scroll levels of each scrollable container to the new cloned floatingWindow
            const scrollableChildren = digChildren(targetWindow, (() => 0), ((el) => (el.scrollTop > 0)));
            setTimeout(() => scrollableChildren.forEach(element => {
                floatingWindow.getElementsByClassName(element.classList.value)[0].style.scrollBehavior = "auto";
                floatingWindow.getElementsByClassName(element.classList.value)[0].scrollBy(element.scrollLeft, element.scrollTop);

                // floatingWindow.getElementsByClassName(element.classList.value)[0].scrollTop = element.scrollTop;
                // floatingWindow.getElementsByClassName(element.classList.value)[0].scrollLeft = element.scrollLeft;
            }), 0);

            // mirror the bounds of targetWindow on floatingWindow
            const boundingClientRect = getZoomedBoudingClientRect(targetWindow.getBoundingClientRect());
            // const computedStyle = getComputedStyle(targetWindow);
            // const scale = computedStyle.scale === "none" ? 1 : computedStyle.scale;
            const scale = parseFloat(targetWindow.style.scale) || 1;
            floatingWindow.style.position = "fixed";
            const newSize = {
                width: boundingClientRect.width / scale,
                height: boundingClientRect.height / scale
            }
            floatingWindow.style.width = newSize.width + "px";
            floatingWindow.style.height = newSize.height + "px";
            const target = {
                x: boundingClientRect.x - (((1 - scale) * (newSize.width)) / 2),
                y: boundingClientRect.y - (((1 - scale) * (newSize.height)) / 2)
            }
            floatingWindow.style.left = target.x + "px";
            floatingWindow.style.top = target.y + "px";
            floatingWindow.style.scale = scale;
            const FLOATING_SCALE_DELTA = 30;
            const floatingWindowBounds = getZoomedBoudingClientRect(targetWindow.getBoundingClientRect());
            setTimeout(() => (constantDeltaScale(floatingWindow, FLOATING_SCALE_DELTA, floatingWindowBounds.width > floatingWindowBounds.height ? "width" : "height")), 0);

            windowOrigin.x = target.x;
            windowOrigin.y = target.y;

            // add the floatingWindow to the DOM and change targetWindow style with the "moving" class
            /* targetWindow.classList.remove("grabbing"); */
            targetWindow.style.scale = "";
            targetWindow.classList.add("moving");
            floatingPortalRef.current.appendChild(floatingWindow);


            // setup dependencies for window reorganization
            moveableElements = sortMoveableElementsByCSSOrder(mapMoveableElements(targetWindow));
            orderMoveableElementsInDOM(moveableElements);
            // console.log("moveableElements:", moveableElements);
        }


        // setup
        const targetWindow = lookForClosestWindowParent(event.target);
        let requestFullscreen = false;
        if (doubleClicked) {
            requestFullscreen = handleFullscreen(targetWindow);
        }
        if (event.touches) {
            const allElements = document.querySelectorAll('*');
            allElements.forEach(element => {
                element.style.userSelect = "none";
                element.style.webkitUserSelect = "none";
            });
            // preventDraggingIssues(targetWindow);
        }
        // console.log("target:", targetWindow, "| mousedown");

        /* targetWindow.classList.add("grabbing"); */
        const GRABBING_SCALE_DELTA = -30;
        const targetWindowBounds = getZoomedBoudingClientRect(targetWindow.getBoundingClientRect());
        constantDeltaScale(targetWindow, GRABBING_SCALE_DELTA, targetWindowBounds.width > targetWindowBounds.height ? "width" : "height");

        const mouseOrigin = {
            x: applyZoom(event.clientX ?? event.touches[0].clientX),
            y: applyZoom(event.clientY ?? event.touches[0].clientY)
        }


        const GRABBING_DURATION = 400;
        let timeoutId = setTimeout(() => startReorder(targetWindow), GRABBING_DURATION);
        let intervalId;
        const handleMouseMove = (event) => {
            const mouse = {
                x: applyZoom(event.clientX ?? event.touches[0].clientX),
                y: applyZoom(event.clientY ?? event.touches[0].clientY)
            }
            const TRIGGER_SHIFT = 13;
            const mouseOriginDist = Math.sqrt((mouseOrigin.x - mouse.x) ** 2 + (mouseOrigin.y - mouse.y) ** 2);
            if (timeoutId && mouseOriginDist >= TRIGGER_SHIFT) {
                clearTimeout(timeoutId);
            }

            if (!reorderStarted && mouseOriginDist >= TRIGGER_SHIFT && !event.touches) {
                startReorder(targetWindow);
                mouseOrigin.x = mouse.x;
                mouseOrigin.y = mouse.y;
            }
            if (reorderStarted) {
                rearrangeWindows(mouse, moveableElements);
                moveFloatingWindow(mouse, mouseOrigin, windowOrigin, floatingWindow);
                if (intervalId) {
                    clearInterval(intervalId);
                }
                intervalId = setInterval(() => scrollViewport(mouse, scrollableParentElement), 0);
            }
        }


        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                // restore old window arrangement
                setWindowArrangement(oldWindowArrangement);
                handleMouseUp();
            }
        }


        const handleMouseUp = () => {
            isGrabbing.current = false
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            if (intervalId) {
                clearInterval(intervalId);
            }
            if (reorderStarted) {
                if (scrollableParentElement) {
                    scrollableParentElement.style.overflow = "";
                }

                saveWindowArrangement(getWindowArrangement());
                unfloatWindow(floatingWindow, targetWindow);
            } else {
                unpreventDraggingIssues();
                // targetWindow.classList.remove("grabbing");
                targetWindow.style.scale = "";
            }
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("touchmove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("touchend", handleMouseUp);
            document.removeEventListener("keydown", handleKeyDown);
        }

        if (requestFullscreen) {
            handleMouseUp();
            return 0;
        }


        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("touchmove", handleMouseMove);
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("touchend", handleMouseUp);
    }


    useEffect(() => {
        // windows management
        function getWindowsHeader(windows) {
            const headers = [];
            for (let windowRef of windows) {
                const windowChildren = windowRef.current.children;
                for (let child of windowChildren) {
                    if (child.classList.contains("window-header")) {
                        headers.push(child);
                    }
                }
            }
            return headers;
        }

        const stopEventPropagation = (event) => {
            event.stopPropagation();
        };

        const headers = getWindowsHeader(windowsContainer.current.windows);

        function cleanup() {
            for (let header of headers) {
                header.removeEventListener("pointerdown", handleMouseDown);
                for (let child of header.children) {
                    child.removeEventListener("pointerdown", stopEventPropagation);
                }
            }
        }

        for (let header of headers) {
            if (allowWindowsManagement) {
                header.addEventListener("pointerdown", handleMouseDown);
                for (let child of header.children) {
                    child.addEventListener("pointerdown", stopEventPropagation);
                }
            }
        }

        return () => {
            cleanup();
        };
    }, [isTabletLayout, allowWindowsManagement]);

    useEffect(() => {
        // load and apply old windowArrangement
        if (name) {
            const buffer = windowArrangementSetting.get();
            let windowArrangement;
            for (let item of buffer) {
                if (item.name === name) {
                    windowArrangement = item.windowArrangement;
                    break;
                }
            }
            setWindowArrangement(windowArrangement);
        } else {
            if (allowWindowsManagement) {
                console.error("windowsContainer has no \"name\" attribute but you have allowed window management: window rearrangements will not be saved");
            }
        }
    }, [windowArrangementSetting.get(), activeAccount, isTabletLayout, allowWindowsManagement]);


    useEffect(() => {
        // windows popping animation

        function reflectDOMHierarchy(elements) {
            /**
             * build and return the hierarchy tree
             * the tree is composed of objects that follow this pattern {element: HTMLElement, children: [HTMLElements]}
             */
            let DOMTree = []
            let elementsCopy = [...elements];
            let i = -1;
            // iterate through the array until there is no longer items to place in the tree
            while (elementsCopy.length > 0) {
                i += 1;
                // loop to the start if at the end of the array
                if (i > elementsCopy.length - 1) {
                    i = 0;
                }
                let elementA = elementsCopy[i]

                let isContained = false;
                // check if the elementA is contained by another element of the array
                for (let elementB of elementsCopy) {
                    if (elementA !== elementB && elementB.contains(elementA)) {
                        isContained = true;
                    }
                }
                if (!isContained) {
                    // elementA is not contained by any other element of the array: it's a parent element
                    elementsCopy.splice(elementsCopy.indexOf(elementA), 1);

                    // figure out where to place the new parent element
                    let branch = DOMTree;
                    let foundExit = false;
                    while (branch.length > 0 && !foundExit) {
                        foundExit = true;
                        for (let i = 0; i < branch.length; i++) {
                            if (branch[i].element?.contains(elementA)) {
                                branch = branch[i].children;
                                foundExit = false;
                                break;
                            }
                        }
                    }
                    if (branch.length < 1 || foundExit) {
                        branch.push({ element: elementA, children: [] });
                    }
                }
            }

            return DOMTree;
        }


        function sortDOMTreeByCSSOrder(DOMTree) {
            if (DOMTree.length > 0) {
                DOMTree.sort((elA, elB) => parseInt(elA?.element.style.order) - parseInt(elB?.element.style.order));
                for (let i = 0; i < DOMTree.length; i++) {
                    sortDOMTreeByCSSOrder(DOMTree[i].children);
                }
            }
        }


        function applyAnimationDelayToWindows(DOMTree, idx = 0) {
            const ANIMATION_DELAY_SHIFT = 50; // ms
            const ANIMATION_DURATION = 500;
            DOMTree.map((branch) => {
                if (branch.element.classList.contains("window")) {
                    branch.element.style.animationDelay = (idx) * ANIMATION_DELAY_SHIFT + "ms";
                    setTimeout(() => branch.element.classList.add("appeared"), (idx) * ANIMATION_DELAY_SHIFT + ANIMATION_DURATION)
                    idx += 1;
                } else {
                    idx = applyAnimationDelayToWindows(branch.children, idx);
                }
            });

            return idx
        }



        let children = digChildren(windowsContainerRef.current,
            (el) => {
                // action
                if (el.classList.contains("windows-layout") || el.classList.contains("moveable-container")) {
                    orderChildrenInDOM(el)
                }
            },
            (el) => {
                // condition
                return el.classList.contains("windows-layout") || el.classList.contains("window") || el.classList.contains("moveable-container") ? true : false
            });

        let DOMTree = reflectDOMHierarchy(children);
        // console.log("DOMTree", DOMTree)
        sortDOMTreeByCSSOrder(DOMTree);
        applyAnimationDelayToWindows(DOMTree)

    }, [isTabletLayout]);


    return (
        <div ref={windowsContainerRef} name={name} id={`windows-container${id && " " + id}`} className={className} {...props}>
            <WindowsContainerContext.Provider value={windowsContainer.current}>
                {children}
                <div id="floating-portal" ref={floatingPortalRef}></div>
            </WindowsContainerContext.Provider>
        </div>
    );
}

export function WindowsLayout({ children, direction = "row", growthFactor = 1, ultimateContainer = false, className = "", ...props }) {
    // available directions: row, column

    const { activeAccount, useUserSettings, isTabletLayout } = useContext(AppContext);

    const windowArrangementSetting = useUserSettings("windowArrangement")

    const context = useWindowsContainerContext();

    const windowsLayoutRef = useRef(null);

    useEffect(() => {
        if (windowsLayoutRef.current && !context.windowsLayouts.includes(windowsLayoutRef)) {
            windowsLayoutRef.current.name = "windowsLayout" + context.windowsLayouts.length;
            context.windowsLayouts.push(windowsLayoutRef);
        }

        return () => {
            const index = context.windowsLayouts.indexOf(windowsLayoutRef);
            if (index > -1) { // only splice array when item found
                context.windowsLayouts.splice(index, 1);
            }
        }
    }, [windowArrangementSetting.get(), activeAccount, isTabletLayout]);

    if (isTabletLayout && !ultimateContainer) {
        return children;
    } else {
        return (
            <div ref={windowsLayoutRef} className={`windows-layout ${direction === "row" ? "d-row" : "d-column"} ${className}`} style={{ flexGrow: growthFactor }} {...props}>
                {children}
            </div>
        )
    }

}

export function MoveableContainer({ children, className = "", ...props }) {

    const { activeAccount, useUserSettings, isTabletLayout } = useContext(AppContext);

    const windowArrangementSetting = useUserSettings("windowArrangement")

    const context = useWindowsContainerContext();

    const moveableContainerRef = useRef(null);

    useEffect(() => {
        // console.log("context.moveableContainers", context.moveableContainers)
        if (!context.moveableContainers.includes(moveableContainerRef)) {
            moveableContainerRef.current.name = "moveableContainer" + context.moveableContainers.length;
            context.moveableContainers.push(moveableContainerRef);
        }

        return () => {
            const index = context.moveableContainers.indexOf(moveableContainerRef);
            if (index > -1) { // only splice array when item found
                context.moveableContainers.splice(index, 1);
            }
        }
    }, [windowArrangementSetting.get(), activeAccount, isTabletLayout]);


    return (
        <div className={`moveable-container ${className}`} ref={moveableContainerRef} {...props}>
            {children}
        </div>
    )
}


export function Window({ children, growthFactor = 1, allowFullscreen = false, fullscreenTargetName="self", WIP = false, className = "", ...props }) {

    const { activeAccount, useUserSettings, isTabletLayout } = useContext(AppContext);

    const windowArrangementSetting = useUserSettings("windowArrangement");

    const context = useWindowsContainerContext();

    const windowRef = useRef(null);

    const settings = useUserSettings();

    const isPartyModeEnabled = settings.get("isPartyModeEnabled");

    const isPeriodEventEnabled = settings.get("isPeriodEventEnabled");

    useEffect(() => {
        // console.log("context.windows", context.windows)
        // console.log("context.fullscreenInfo", context.fullscreenInfo)
        if (!context.windows.includes(windowRef)) {
            windowRef.current.name = "window" + context.windows.length;
            context.windows.push(windowRef);
            context.fullscreenInfo.push({ allowFullscreen, fullscreenTargetName });
        }

        return () => {
            const index = context.windows.indexOf(windowRef);
            if (index > -1) { // only splice array when item found
                context.windows.splice(index, 1);
                context.fullscreenInfo.splice(index, 1);
            }
        }
    }, [windowArrangementSetting.get(), activeAccount, isTabletLayout]);


    return (
        <section className={`window ${className} ${WIP ? "work-in-progress" : ""} ${isPartyModeEnabled && isPeriodEventEnabled && currentPeriodEvent === "christmas" ? "allow-overflow-event" : ""} ${isPartyModeEnabled && isPeriodEventEnabled && currentPeriodEvent === "halloween" ? "halloween-window" : ""}`}
            style={{ flexGrow: growthFactor }} ref={windowRef} {...props}>
            {WIP ? <p className="wip-info">Fonctionnalité en cours de développement...<br/>Rejoignez le <a href="https://discord.gg/AKAqXfTgvE" target="_blank">serveur Discord d'EDP</a> pour en suivre l'avancée !</p> : children}
            {/* <span style={{ color: "lime", fontWeight: "600", position: "relative", zIndex: "999" }}>{windowRef?.current?.name}</span> */}
        </section>
    )
}

export function WindowHeader({ children, className = "", ...props }) {
    const { useUserSettings } = useContext(AppContext);
    const settings = useUserSettings();

    const isPartyModeEnabled = settings.get("isPartyModeEnabled");

    const isPeriodEventEnabled = settings.get("isPeriodEventEnabled");


    return (
        <div className={`window-header ${className} ${isPartyModeEnabled && isPeriodEventEnabled && currentPeriodEvent === "christmas" ? "snowy-element-window" : ""} ${isPartyModeEnabled && isPeriodEventEnabled && currentPeriodEvent === "halloween" ? "halloween-window-header" : ""}`} {...props}>
            {isPeriodEventEnabled !== false && currentPeriodEvent === "christmas" && (
                <SnowCap className="snow-cap"/>
            )}
            {children}
        </div>
    )
}


export function WindowContent({ children, className = "", ...props }) {

    return (
        <div className={`window-content ${className}`} {...props}>
            {children}
        </div>
    )
}
