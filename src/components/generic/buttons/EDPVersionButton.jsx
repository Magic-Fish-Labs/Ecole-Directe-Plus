
import { useState } from "react";
import PatchNotes from "../PatchNotes";
import { EDPVersion } from "../../../utils/constants/configs";
import "./EDPVersionButton.css"

export default function EDPVersionButton({ version = EDPVersion }) {
    const [isPatchNotesOpened, setIsPatchNotesOpened] = useState(false);

    const handleClick = () => {
        // ouvre et ferme la pop-up patch notes
        setIsPatchNotesOpened(!isPatchNotesOpened);
    }

    // Pour accessibilité et conformité à WCAG : ça permet de cliquer sur une div avec la touche entrée parce que c'est pas auto avec un onClick
    const handleKeyDown = (event) => {
        // Si touche pressée est "entrer" ou "espace"
        if (event.keyCode === 13 || event.keyCode === 32) {
            handleClick();
        }
    }

    return <>
        {isPatchNotesOpened && <PatchNotes version={version} onClose={handleClick} />}
        <button id="edp-version" onClick={handleClick}>
            v{version}
        </button>
    </>
}