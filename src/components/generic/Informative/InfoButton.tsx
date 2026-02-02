
import { PropsWithChildren, ReactNode, useState } from "react";

import { Tooltip, TooltipTrigger, TooltipContent, TooltipOptions } from "../PopUps/Tooltip";
import "./InfoButton.css";

export default function InfoButton({
    children,
    additionalSVG,
    options = {},
    className = "",
    id = ""
}: PropsWithChildren<{
    additionalSVG?: ReactNode,
    options: TooltipOptions,
    className?: string,
    id?: string
}>) {
    return <Tooltip className={`info-button ${className}`} id={id} options={options}>
        <TooltipTrigger>
            <svg aria-label="Bouton d'information tooltip" className="info-icon" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg" role="img">
                <rect className="stroke" x="2.5" y="2.5" width="30" height="30" rx="16.5" stroke="#4B48D9" strokeWidth="4" />
                <circle className="fill" cx="17.5" cy="11" r="2.5" fill="#4B48D9" id="circle-point" />
                <rect className="fill" x="15" y="15" width="5" height="12" rx="2.625" fill="#4B48D9" />

                {additionalSVG}
            </svg>
        </TooltipTrigger>
        <TooltipContent className={className}>
            {children}
        </TooltipContent>
    </Tooltip>
}
