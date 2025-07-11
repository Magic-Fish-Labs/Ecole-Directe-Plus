import { useRef, useContext } from "react";
import { UserDataContext } from "../../../App";
import Interrogation from "./Interrogation";
import CanardmanSleeping from "../../graphics/CanardmanSleeping";

const PLACEHOLDERS = [
    <span>Vous n'avez n'as pas de contrôles prochainement, profitez-en pour regarder Canardman dormir.</span>,
    <span>Aucun contrôle de prévu.<br />Tiens, voilà Canardman qui dort.</span>,
    <span>C'est calme...<br />Canardman en profite pour faire dodo.</span>,
    <span>C'est trop calme...<br />Canardman n'aime pas trop beaucoup ça.</span>,
    <span>Les contrôles se font discrets, Canardman peut dormir tranquille.</span>,
    <span>Aucun contrôle à venir, Canardman l'a bien compris.</span>,
]

export default function UpcomingAssignments() {
    const userData = useContext(UserDataContext);
    const {
        upcomingAssignments: { value: upcomingAssignments }
    } = userData;

    const choosenPlaceholder = useRef(PLACEHOLDERS[parseInt(Math.random() * PLACEHOLDERS.length)]);
    return upcomingAssignments?.length
        ? Array.from({length: 3}, (_, i) => {
            let task;
            if (i < upcomingAssignments.length)
                task = upcomingAssignments[i];
            else
                task = {id: "dummy-" + i};
            return <Interrogation key={`${task.id}`} task={task} />
        })
        : <div className="loading">
            {choosenPlaceholder.current}
            <CanardmanSleeping />
        </div>
}
