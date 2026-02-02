import { useRef, useEffect } from "react";
import "./ScrollShadedDiv.css";

export default function ScrollShadedDiv({
    id = null,
    className = "",
    children,
    onScroll = null,
    setRef = null,
    enableSideShadows = false,
    ...props
}) {
    // Refs
    const bufferRef = useRef(null);
    const contentDivRef = useRef(null);
    const topShadowRef = useRef(null);
    const bottomShadowRef = useRef(null);
    const leftShadowRef = useRef(null);
    const rightShadowRef = useRef(null);

    useEffect(() => {
        // Merge refs if multiple
        contentDivRef.current = bufferRef.current;
        if (setRef !== undefined) {
            setRef(bufferRef);
        }
    }, [bufferRef.current]);

    useEffect(() => {
        // Initialize shadows based on scroll position
        handleScroll();
        const contentHeight = contentDivRef.current.scrollHeight;
        const divHeight = contentDivRef.current.offsetHeight;
        const contentWidth = contentDivRef.current.scrollWidth;
        const divWidth = contentDivRef.current.offsetWidth;

        const scrollTop = contentDivRef.current.scrollTop;
        const scrollLeft = contentDivRef.current.scrollLeft;
        const scrollBottom = contentHeight - divHeight - scrollTop;
        const scrollRight = contentWidth - divWidth - scrollLeft;

        if (
            scrollTop > 0 ||
            scrollBottom > 0 ||
            scrollLeft > 0 ||
            scrollRight > 0
        ) {
            contentDivRef.current.tabIndex = 0;
        }
    }, []);

    function handleScroll() {
        const contentHeight = contentDivRef.current.scrollHeight;
        const divHeight = contentDivRef.current.offsetHeight;
        const scrollTop = contentDivRef.current.scrollTop;
        const scrollBottom = contentHeight - divHeight - scrollTop;

        // Vertical scroll handling
        if (contentHeight > divHeight) {
            if (scrollTop > 0) {
                topShadowRef.current.style.opacity = 1;
                topShadowRef.current.style.transition = "0.3s";
            } else {
                topShadowRef.current.style.opacity = 0;
                topShadowRef.current.style.transition = "0.1s";
            }

            if (scrollBottom > 0) {
                bottomShadowRef.current.style.opacity = 1;
                bottomShadowRef.current.style.transition = "0.3s";
            } else {
                bottomShadowRef.current.style.opacity = 0;
                bottomShadowRef.current.style.transition = "0.1s";
            }
        } else {
            topShadowRef.current.style.opacity = 0;
            bottomShadowRef.current.style.opacity = 0;
        }

        // Horizontal scroll handling
        if (enableSideShadows) {
            const contentWidth = contentDivRef.current.scrollWidth;
            const divWidth = contentDivRef.current.offsetWidth;
            const scrollLeft = contentDivRef.current.scrollLeft;
            const scrollRight = contentWidth - divWidth - scrollLeft;

            if (contentWidth > divWidth) {
                if (scrollLeft > 0) {
                    leftShadowRef.current.style.opacity = 1;
                    leftShadowRef.current.style.transition = "0.3s";
                } else {
                    leftShadowRef.current.style.opacity = 0;
                    leftShadowRef.current.style.transition = "0.1s";
                }

                if (scrollRight > 0) {
                    rightShadowRef.current.style.opacity = 1;
                    rightShadowRef.current.style.transition = "0.3s";
                } else {
                    rightShadowRef.current.style.opacity = 0;
                    rightShadowRef.current.style.transition = "0.1s";
                }
            } else {
                leftShadowRef.current.style.opacity = 0;
                rightShadowRef.current.style.opacity = 0;
            }
        }
    }

    return (
        <div className={`scroll-shaded-div ${className}`} id={id}>
            <div className="top-shadow" ref={topShadowRef}></div>
            {enableSideShadows && (
                <div className="left-shadow" ref={leftShadowRef}></div>
            )}
            <div
                className="content"
                ref={bufferRef}
                onScroll={(event) => {
                    handleScroll();
                    if (onScroll) {
                        onScroll(event);
                    }
                }}
                {...props}
            >
                {children}
            </div>
            {enableSideShadows && (
                <div className="right-shadow" ref={rightShadowRef}></div>
            )}
            <div className="bottom-shadow" ref={bottomShadowRef}></div>
        </div>
    );
}
