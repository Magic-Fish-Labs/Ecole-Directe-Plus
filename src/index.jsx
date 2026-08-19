import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import DOMNotification from "./components/generic/PopUps/Notification";
import App from "./App";
import IframeRequestLinker from "./utils/iframeRequest/iframeRequestLinker";

const splashScreen = document.getElementById("loading-start");
const iframeRequest = new IframeRequestLinker();

const STUDENT_SUITE_THEMES = {
    green: ["0, 132, 88", "7, 35, 22", "18, 79, 37", "44, 112, 61", "72, 167, 111", "177, 235, 196"],
    red: ["187, 0, 0", "30, 0, 0", "68, 18, 18", "91, 49, 49", "156, 79, 79", "242, 187, 187"],
    orange: ["255, 87, 34", "12, 12, 12", "31, 31, 31", "65, 65, 65", "143, 102, 67", "255, 174, 0"],
    blue: ["21, 101, 192", "10, 20, 38", "24, 49, 83", "45, 79, 120", "70, 130, 180", "174, 214, 255"],
    purple: ["103, 58, 183", "27, 18, 43", "55, 38, 82", "83, 59, 117", "139, 105, 190", "221, 195, 255"],
    oled: ["12, 12, 12", "0, 0, 0", "12, 12, 12", "28, 28, 28", "88, 88, 88", "225, 225, 225"]
};

function restoreStudentSuiteTheme() {
    try {
        const suite = JSON.parse(localStorage.getItem("edpStudentSuiteV1") || "{}");
        const palette = STUDENT_SUITE_THEMES[suite.theme];
        if (!palette) return;
        const [header, bg0, bg1, bg2, border, alt] = palette;
        const root = document.documentElement;
        root.dataset.edpAccent = suite.theme;
        root.style.setProperty("--background-color-header", header);
        root.style.setProperty("--background-color-0", bg0);
        root.style.setProperty("--background-color-1", bg1);
        root.style.setProperty("--background-color-2", bg2);
        root.style.setProperty("--border-color-0", border);
        root.style.setProperty("--text-color-alt", alt);
    } catch {
        // Invalid local preference: ignore it and keep the standard ED+ theme.
    }
}

restoreStudentSuiteTheme();

const handleIframeLoad = (event) => {
    iframeRequest.setIframe(event.target);
};

async function edpFetch(url, fetchParams, dataType) {
    const response = await fetch(url, fetchParams);
    return response[dataType]();
}

splashScreen?.classList.add("fade-out");
setTimeout(() => splashScreen?.remove(), 500);

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <DOMNotification>
            <App edpFetch={edpFetch} />
            <iframe onLoad={handleIframeLoad} sandbox="allow-scripts" style={{ display: "none" }} srcDoc='data:text/html, <!DOCTYPE HTML><html><head></head><body><script>IFRAME_JS_PLACEHOLDER</script></body></html>' />
        </DOMNotification>
    </StrictMode>
);
