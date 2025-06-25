
import { useEffect, useRef, useContext } from "react";
import { AppContext } from "../../App";

import "./StoreCallToAction.css"

export default function StoreCallToAction({ companyLogoSrc, companyLogoAlt="Logo d'une entreprise high tech", targetURL="#", ...props }) {

    const { promptInstallPWA } = useContext(AppContext);

    return (
        <button className="install-as-application" target="_blank" href={targetURL} onClick={() => promptInstallPWA()} {...props}>
            <img className="company-logo" src={companyLogoSrc} alt={companyLogoAlt} />
            <div className="text">
                <span className="install-as">Installer en tant qu'</span>
                <span className="application">Application</span>
            </div>
        </button>
    )
}
