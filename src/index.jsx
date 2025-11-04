import { StrictMode } from "react";
import { createRoot } from "react-dom/client"
import DOMEdpNotification from "./components/generic/PopUps/Notification";
import App from "./App";
import { OverlayProvider } from "./contexts/OverlayContext";
// import reportWebVitals from './reportWebVitals';

// import { HelmetProvider } from 'react-helmet';

const splashScreen = document.getElementById("loading-start");

splashScreen?.classList.add("fade-out");
setTimeout(() => splashScreen?.remove(), 500);

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <DOMEdpNotification>
            <OverlayProvider>
                {/* <HelmetProvider> */}
                <App />
                {/* </HelmetProvider> */}
            </OverlayProvider>
        </DOMEdpNotification>
    </StrictMode>
);

// reportWebVitals(console.log);