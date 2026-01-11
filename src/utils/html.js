
import { decodeBase64 } from "./utils";
import DOMPurify from "dompurify";

// HTML Escape
function decodeHtmlEscaped(html) {
    /**
     * Clear HTML Escaped content
     * @param html The HTML content you want to clear
     */
    let textarea = document.createElement("textarea");
    textarea.innerHTML = html;
    return textarea.value;
}

// sanitizer
function sanitizeHTML(htmlContent) {
    // prevent XSS breaches
    return DOMPurify.sanitize(htmlContent);
}


// contrasts management
function hexToRgb(hex) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}

function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

function linearize(c) {
    let c_lin = c / 255.0;
    return c_lin <= 0.03928 ? c_lin / 12.92 : Math.pow((c_lin + 0.055) / 1.055, 2.4);
}

function luminance(r, g, b) {
    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function contrast(rgb1, rgb2) {
    let lum1 = luminance(...rgb1);
    let lum2 = luminance(...rgb2);
    let brightest = Math.max(lum1, lum2);
    let darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

function adjustColor(originalHex, backgroundHex, minContrast) {
    let originalRgb = hexToRgb(originalHex);
    let backgroundRgb = hexToRgb(backgroundHex);
    let currentContrast = contrast(originalRgb, backgroundRgb);

    if (currentContrast >= minContrast) {
        return originalHex; // Already meets the contrast requirement
    }

    const STEP = 1;
    const originalLuminance = luminance(...originalRgb);
    const backgroundLuminance = luminance(...backgroundRgb);
    let increment = originalLuminance < backgroundLuminance ? -STEP : STEP;

    // Adjusting luminance by changing each color component equally
    while (currentContrast < minContrast) {
        originalRgb = originalRgb.map(component => {
            let newComponent = component + increment * (1 + component / 255);
            return Math.max(0, Math.min(255, newComponent)); // Clamp between 0 and 255
        });

        if ((originalRgb[0] >= 255 && originalRgb[1] >= 255 && originalRgb[2] >= 255) || (originalRgb[0] <= 0 && originalRgb[1] <= 0 && originalRgb[2] <= 0)) {
            increment = -increment;
        }

        currentContrast = contrast(originalRgb, backgroundRgb);
    }

    return rgbToHex(...originalRgb);
}

function hasParentWithInlineBackground(element) {
    if (!element || element.tagName === "HTML") {
        return false;
    }

    if (element.style && (element.style.background || element.style.backgroundColor)) {
        return true;
    }

    return hasParentWithInlineBackground(element.parentElement);
}

export function clearHTML(html, backgroundColor, asString=true) {
    /**
     * Decodes, makes readable, sanitizes and improve contrasts of html content with optional inline style
     * @param html HTML content to clear
     * @param backgroundColor The color of the background on which the text will be displayed. Allow the function to improve constrasts. (RGB format: list)
    */

    let decodedHTML = decodeBase64(html);
    let readableOutput = decodeHtmlEscaped(decodedHTML);
    let safeHTML = sanitizeHTML(readableOutput);
    const parser = new DOMParser();
    let parsedHTML = parser.parseFromString(safeHTML, "text/html").body;

    // improving contrasts
    if (backgroundColor) {
        const REQUIRED_CONTRAST = 4.5; // WCAG minimum for normal text
        const hexBackgroundColor = rgbToHex(...backgroundColor);

        // get all elements that contain inline style and define a text color
        const allElements = parsedHTML.querySelectorAll("*");
        allElements.forEach(el => {
            const style = el.getAttribute("style");
            const WHITES = ["white", "#FFFFFF", "#FFF", "#ffffff", "#fff", "rgb(255, 255, 255)"];
            if (el?.style && (WHITES.includes(el.style.backgroundColor) || WHITES.includes(el.style.background))) {
                el.style.background = "";
                el.style.backgroundColor = "";
            }
            if (hasParentWithInlineBackground(el)) {
                if (!style || !style.includes("color:")) {
                    el.style.color = "black";
                }
            }
        });
        const elementsWithColor = Array.from(allElements).filter(el => {
            const style = el.getAttribute("style");
            return style && style.includes("color:") && !hasParentWithInlineBackground(el); // selects color and unselects those with parents that has background-color (or highlighting)
        });

        const tempContainer = document.createElement("div");
        tempContainer.style.display = "none";
        document.body.appendChild(tempContainer); // will be used to trigger style computing

        elementsWithColor.forEach((el) => {
            const elCopy = el.cloneNode(true);
            tempContainer.appendChild(elCopy); // append a copy to avoid removing the initial element from parsedHTML
            let textColor = getComputedStyle(elCopy).getPropertyValue("color");
            let match = textColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*\d+)?\)$/); // getComputedStyle always return a color in rgb format

            if (match) {
                let red = parseInt(match[1]);
                let green = parseInt(match[2]);
                let blue = parseInt(match[3]);
                if ((red + green + blue) === 0) {
                    el.style.color = "";
                    return
                }

                let hexColor = rgbToHex(red, green, blue);

                let contrastedTextColor = adjustColor(hexColor, hexBackgroundColor, REQUIRED_CONTRAST);
                el.style.color = contrastedTextColor;

                // apply color to all children (bypass the *{color: var(--text-color-main)} in App.css)
                const children = el.querySelectorAll('*');
                children.forEach(child => {
                    child.style.color = contrastedTextColor;
                });
            }
            tempContainer.removeChild(elCopy);
        });
        document.body.removeChild(tempContainer);
    }

    // improve UX
    const allLinks = parsedHTML.querySelectorAll("a");
    allLinks.forEach((link) => {
        link.target = "_blank";
    })

    return asString ? parsedHTML.innerHTML : parsedHTML;
}
