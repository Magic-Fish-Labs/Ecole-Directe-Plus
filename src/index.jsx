import { StrictMode } from "react";
import { createRoot } from "react-dom/client"
import DOMEdpNotification from "./components/generic/PopUps/Notification";
import App from "./App";
import { OverlayProvider } from "./contexts/overlay/OverlayContext";

const splashScreen = document.getElementById("loading-start");

splashScreen?.classList.add("fade-out");
setTimeout(() => splashScreen?.remove(), 500);

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <DOMEdpNotification>
            <OverlayProvider>
                <App />
            </OverlayProvider>
        </DOMEdpNotification>
    </StrictMode>
);
