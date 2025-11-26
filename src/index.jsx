import { StrictMode } from "react";
import { createRoot } from "react-dom/client"
import DOMNotification from "./components/generic/PopUps/Notification";
import App from "./App";
import IframeRequestLinker from "./utils/iframeRequest/iframeRequestLinker";
import { getOS } from "./utils/utils";
// import reportWebVitals from './reportWebVitals';

// import { HelmetProvider } from 'react-helmet';


const splashScreen = document.getElementById("loading-start");
const iframeRequest = new IframeRequestLinker()

const handleIframeLoad = (event) => {
    iframeRequest.setIframe(event.target);
}

async function edpFetch(url, fetchParams, dataType) {
    return fetch(url, fetchParams).then((response) => response[dataType]())
}

splashScreen?.classList.add("fade-out");
setTimeout(() => splashScreen?.remove(), 500);

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <DOMNotification>
            {/* <HelmetProvider> */}
                <App edpFetch={edpFetch} />
                <iframe onLoad={handleIframeLoad} sandbox="allow-scripts" style={{display: "none"}} srcDoc='data:text/html, <!DOCTYPE HTML><html><head></head><body><script>IFRAME_JS_PLACEHOLDER</script></body></html>'></iframe> {/* The IFRAME_JS_PLACEHOLDER placeholder will be replace by the content of the file src/utils/iframeRequest/iframe.js when npm run dev or npn run build is launched*/}
            {/* </HelmetProvider> */}
        </DOMNotification>
    </StrictMode>
);

// reportWebVitals(console.log);