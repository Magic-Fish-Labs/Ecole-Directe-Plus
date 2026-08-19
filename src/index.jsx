import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import DOMNotification from "./components/generic/PopUps/Notification";
import App from "./App";
import IframeRequestLinker from "./utils/iframeRequest/iframeRequestLinker";
import { ACCENT_THEMES, loadStudentToolsState, restoreAccentTheme, setAccentTheme } from "./utils/studentTools";

const splashScreen = document.getElementById("loading-start");
const iframeRequest = new IframeRequestLinker();

restoreAccentTheme();

function installAccentThemeSettings() {
    const renderPicker = () => {
        const host = document.querySelector("#display-theme");
        if (!host || host.querySelector(".accent-theme-settings")) return;

        const wrapper = document.createElement("div");
        wrapper.className = "accent-theme-settings";
        wrapper.style.cssText = "display:flex;gap:.6rem;flex-wrap:wrap;align-items:center;margin-top:.8rem;width:100%";

        const label = document.createElement("span");
        label.textContent = "Couleur ED+";
        label.style.cssText = "width:100%;opacity:.8";
        wrapper.appendChild(label);

        const currentTheme = loadStudentToolsState().theme;
        Object.entries(ACCENT_THEMES).forEach(([name, theme]) => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = name === "default" ? "Classique" : theme.label;
            button.dataset.theme = name;
            button.style.cssText = "border:1px solid rgba(var(--border-color-0),.5);border-radius:.8rem;padding:.7rem 1rem;color:rgb(var(--text-color-main));background:rgba(var(--background-color-2),.65);cursor:pointer";
            if (name === currentTheme) button.style.outline = "2px solid rgb(var(--text-color-alt))";
            button.addEventListener("click", () => {
                setAccentTheme(name);
                wrapper.querySelectorAll("button").forEach(item => item.style.outline = "none");
                button.style.outline = "2px solid rgb(var(--text-color-alt))";
            });
            wrapper.appendChild(button);
        });

        host.appendChild(wrapper);
    };

    const observer = new MutationObserver(renderPicker);
    observer.observe(document.body, { childList: true, subtree: true });
    renderPicker();
}

installAccentThemeSettings();

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
