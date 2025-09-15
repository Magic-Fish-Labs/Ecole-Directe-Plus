
import { createContext, useContext, useState, useRef } from "react";

import './Notification.css'
import NotificationItem from "./NotificationItem";

const DEFAULT_TIME_TO_LIVE = 3000 // ms

const notificationContext = createContext(() => {});

/**
 * @returns {(content: import('react').ReactNode, options?: {className: string, timeToLive: number | "infinite"}) => void}
 */
export function useCreateNotification() {
    return useContext(notificationContext);
}

class EdpNotification {
    constructor(id, content, className, timeToLive, onClose) {
        this.id = id;
        this.content = content;
        this.className = className; // customClass defined at the creation of the notification to apply special styles
        this.timeToLive = timeToLive;
        this.createdAt = Date.now();
    }

    get currentLifeTime() {
        return this.timeToLive - (Date.now() - this.createdAt);
    }
}

export default function DOMEdpNotification({ children }) {
    /** @type {[EdpNotification[], import('react').Dispatch<import('react').SetStateAction<EdpNotification[]>>]} */
    const [notificationList, setNotificationList] = useState([]);

    const currentNotificationId = useRef(0);

    function addNotification(content, {className = "", timeToLive = DEFAULT_TIME_TO_LIVE} = {}) {
        const newNotification = new EdpNotification(currentNotificationId.current, content, className, timeToLive);

        setNotificationList([newNotification, ...notificationList]);

        currentNotificationId.current++;
        return newNotification.id;
    }

    function removeNotification(id) {
        setNotificationList(list => list.filter(x => x.id !== id));
    }

    return (
        <notificationContext.Provider value={addNotification} >
            <div id="notifications-container">
                {notificationList.map((n) => <NotificationItem key={n.id} notification={n} onRemove={removeNotification}/>)}
            </div>
            {children}
        </notificationContext.Provider>
    )
}