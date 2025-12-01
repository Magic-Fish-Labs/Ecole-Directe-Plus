import { useContext, useEffect } from "react";
import { UserDataContext } from "../../../../App";
import TaskComponent from "./TaskComponent";
import SessionContent from "./SessionContent";
import DetailedTask from "./DetailedTask";
import DetailedSessionContent from "./DetailedSessionContent";
import { capitalizeFirstLetter } from "../../../../utils/utils";
import { useCreateNotification } from "../../../generic/PopUps/Notification";

import HomeworkDay from "../../../../EcoleDirecteHandlerCore/class/HomeworkDay";
// import Task from "../../../../EcoleDirecteHandlerCore/class/Task";

export default function NotebookDay({ day, isNotebookGrabed }) {
	const createNotification = useCreateNotification();

	const userData = useContext(UserDataContext);
	const {
		homeworks: { value: homeworks, set: setHomeworks },
		activeHomeworkDate: { value: activeHomeworkDate, set: setActiveHomeworkDate },
		activeHomeworkId: { value: activeHomeworkId, set: setActiveHomeworkId }
	} = userData;

	const tasks = day.taskList;
	const sessionContents = day.sessionContentList;
	const progression = tasks.filter((task) => task.isDone).length / tasks.length;
	const selected = day.ISODate === activeHomeworkDate;

	useEffect(() => {

	}, [activeHomeworkDate, activeHomeworkId]);

	useEffect(() => {
		if (selected && !day.detailed) {
			day.detail()
				.then(() => setHomeworks(homeworks))
				.catch((err) => {
					console.error(err);
					createNotification("Une erreur inconnue s'est produite lors de la communication avec les serveurs de EcoleDirecte.", { className: "extension-warning" });
				});
		}
	}, [selected, day.detailed]);

	if (day.empty) return null;

	return <div
		key={day.ISODate}
		id={day.ISODate}
		onClick={() => {
			if (isNotebookGrabed.current) return;
			if (!selected) {
				setActiveHomeworkDate(day.ISODate);
			}
			if (!activeHomeworkId) {
				setActiveHomeworkId(tasks[0].id);
			}
		}}
		className={`notebook-day${selected ? " selected" : ""}`}
		style={{ "--day-progression": `${progression * 100}%` }}
	>
		<div className="notebook-day-header" style={{ "--after-opacity": (progression === 1 ? 1 : 0) }}>
			<span className="notebook-day-date">
				<time dateTime={day.date.toISOString()}>
					{capitalizeFirstLetter(day.date.toLocaleDateString("fr-FR", { weekday: "long", month: "long", day: "numeric" }))}
				</time>
			</span>
		</div>
		<hr />
		<div className="tasks-container" >
			{tasks.map((task, taskIndex) => {
				if (selected) {
					const result = [<DetailedTask key={"detailed-" + task.id} task={task} />];
					if (taskIndex < tasks.length - 1) {
						result.push(<hr key={`${task.id}-hr`} className="detailed-task-separator" />)
					}
					return result;
				}
				return <TaskComponent key={task.id} task={task} isNotebookGrabed={isNotebookGrabed} />;
			})}
			{sessionContents.length !== 0 && (selected
				? <div className="detailed-section-separator"><hr /><span>Contenus de Séances</span><hr /></div>
				: <hr className="section-separator" />)
			}
			{sessionContents.map((sessionContent, sessionContentIndex) => {
				if (selected) {
					console.log(day);
					console.log(sessionContent);
					result = [<DetailedSessionContent key={"detailed-" + sessionContent.id} day={day.date} sessionContent={sessionContent} sessionContentIndex={sessionContentIndex} />];
					if (sessionContentIndex < sessionContents.length - 1) {
						result.push(<hr key={`${sessionContent.id}-hr`} className="detailed-task-separator" />)
					}
					return result;
				}
				return <SessionContent key={sessionContent.id} day={day.date} sessionContent={sessionContent} sessionContentIndex={sessionContentIndex} />
			})}
		</div>
	</div>
}
