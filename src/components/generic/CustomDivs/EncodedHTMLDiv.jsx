
import { useState, useRef, useEffect } from "react";
import { clearHTML } from "../../../utils/html";

import "./EncodedHTMLDiv.css"
import { decodeBase64 } from "../../../utils/utils";

export default function EncodedHTMLDiv({ children, nonEncodedChildren=null, backgroundColor, className="", ...props }) {
    const [backgroundColorState, setBackgroundColorState] = useState(null);
    const divRef = useRef(null);

    useEffect(() => {
        // dynamically change the background color parameter of `clearHTML` to ensure nice contrasts
        let backgroundColor = getComputedStyle(divRef.current).getPropertyValue("background-color");
        let condition = backgroundColor.split(",").length > 3 && backgroundColor.slice(-2, -1) === "0";
        if (!condition) {
            let match = backgroundColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*\d+)?\)$/);

            if (match) {
                let red = parseInt(match[1]);
                let green = parseInt(match[2]);
                let blue = parseInt(match[3]);
                setBackgroundColorState([red, green, blue]);
            }
        } else {
            setBackgroundColorState(null);
        }
    }, []);

    return (
        <div ref={divRef} className={"html-encoded-div " + (className ? className : "")} {...props}>
            <div dangerouslySetInnerHTML={{ __html: children ? clearHTML(children, backgroundColor ?? backgroundColorState) : "" }}></div>
            {nonEncodedChildren && <div>{nonEncodedChildren}</div>}
        </div>
    )
}
