import { useEffect, useRef, useState } from "react";
import classBuilder from "../../../utils/classBuilder";

import DropDownArrow from "../../graphics/DropDownArrow";

const POST_HOVER_TIME_TO_LIVE = 3000 // ms
const CLOSE_TIME = 500 // ms
const FORCE_CLOSE_TIME = 200 // ms
const closingStates = {
	OPEN: 0,
	CLOSING: 1,
	FORCE_CLOSING: 2
}

export default function NotificationItem({ notification, onRemove }) {
	const [isClosing, setIsClosing] = useState(0);
	const timeoutRef = useRef(-1);

	useEffect(() => {
		if (notification.timeToLive !== "infinite") {
			timeoutRef.current = setTimeout(() => {
				setIsClosing(closingStates.CLOSING);
				setTimeout(() => onRemove(notification.id), CLOSE_TIME);
			}, notification.timeToLive);
		}
		return () => clearTimeout(timeoutRef.current);

	},);

	function handleMouseLeave() {
		if (notification.timeToLive === "infinite") return;
		if (notification.currentLifeTime < POST_HOVER_TIME_TO_LIVE) {
			notification.creationTime = Date.now();
			notification.timeToLive = POST_HOVER_TIME_TO_LIVE;
		}
		timeoutRef.current = setTimeout(() => {
			setIsClosing(closingStates.CLOSING);
			setTimeout(() => {
				onRemove(notification.id);
			}, CLOSE_TIME);
		}, notification.timeToLive);
	}

	function handleMouseEnter() {
		clearTimeout(timeoutRef.current);
	}

	function onForceClose() {
		setIsClosing(closingStates.FORCE_CLOSING);
		setTimeout(() => {
			onRemove(notification.id);
		}, FORCE_CLOSE_TIME);
	}

	return <div className={classBuilder(`pop-up-notification ${notification.className}`, {
		"closing": isClosing === closingStates.CLOSING,
		"force-closing": notification.isClosing === closingStates.FORCE_CLOSING
	})} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} >
		<DropDownArrow className="notification-close-arrow" onClick={onForceClose} />
		{notification.content}
	</div>
}
