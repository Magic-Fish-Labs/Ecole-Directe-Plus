
import { useState, useEffect, useRef, useContext } from "react";
import ContentLoader from "react-content-loader";

import { AppContext, SettingsContext } from "../../../App";


import "./Tabs.css";

export default function Tabs({ tabs, displayedTabs = tabs, selected, fieldsetName, dir = "row", onChange, contentLoader = false, id = "", className = "", ...props }) {
    const { usedDisplayTheme } = useContext(AppContext);

    const settings = useContext(SettingsContext);
    const { displayMode } = settings.user;

    const firstContentState = useRef(contentLoader);

    /* sélectionne le 1er élément si rien n'est sélectionné */
    useEffect(() => {
        if (!tabs.includes(selected)) {
            onChange(tabs[0]);
        }
    }, [tabs]);

    const handleClick = (event) => {
        onChange(event.target.value);
    }

    return (!contentLoader && tabs.length > 0
        ? <fieldset name={fieldsetName} className={`tabs-container ${dir === "column" ? "d-col" : ""} ${className}`} id={id} {...props} >
            {tabs.map((option, index) =>
                <label htmlFor={option} key={option} title={displayedTabs[index]} style={{ "--order": (firstContentState.current ? 0 : index), "animationDuration": (firstContentState.current ? "0s" : "") }} className={"tab " + "selected ".repeat(selected === option)}>
                    <input name={fieldsetName} type="radio" id={option} value={option} onClick={handleClick} />
                    {displayedTabs[index]}
                </label>
            )}
        </fieldset>
        : <ContentLoader
            animate={displayMode.value === "quality"}
            speed={1}
            backgroundColor={usedDisplayTheme === "dark" ? "#2e2e4f" : "#d2d2ff"}
            foregroundColor={usedDisplayTheme === "dark" ? "#444475" : "#aaaabf"}
            style={{ width: (dir === "row" ? "100%" : "44px"), height: (dir === "row" ? "44px" : "100%"), "animationDuration": (!firstContentState.current ? "0s" : "") }}
            className="tabs-content-loader"
        >
            <rect x="0" y="0" rx="15" ry="15" style={{ width: "100%", height: "100%" }} />
        </ContentLoader>
    )
}
