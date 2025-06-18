
import { createContext, useContext, useState, useRef } from "react";

import DropDownArrow from "../../graphics/DropDownArrow";

import './Notification.css'

const notificationContext = createContext();

export function useCreateNotification() {
    const addNotification = useContext(notificationContext)
    return addNotification
}

export default function DOMNotification({ children }) {
    const [notificationList, setNotificationList] = useState([])

    const currentNotificationId = useRef(0);

    function closeNotification(notification, fast = false, delay = 0) {
        setTimeout(() => {
            if (!notification.hovered || fast) {
                setNotificationList((oldNotififcationList) => {
                    const elementIndex = oldNotififcationList.indexOf(notification);
                    if (elementIndex === -1) {
                        return oldNotififcationList
                    }
                    const newNotificationList = [...oldNotififcationList]
                    newNotificationList[elementIndex].isClosing = fast + 1;
                    return newNotificationList
                });
                setTimeout(() => {
                    setNotificationList((oldNotififcationList) => {
                        const elementIndex = oldNotififcationList.indexOf(notification);
                        if (elementIndex === -1) {
                            return oldNotififcationList
                        }
                        return oldNotififcationList.toSpliced(elementIndex, 1)
                    });
                }, (fast ? 201 : 501));
            }
        }, delay)
    }

    function addNotification(newNotificationContent, {customClass = "", timer = 3000} = {}) {
        /** This function will summon a notification
         * @param newNotificationContent content (in jsx) of the notification
         * @param customClass class you can add to the notification pop-up to change the default style
         * @param timer time in ms before the notification start closing OR infinite to make the notification stay forever 
         * WARNING : the notification context being outside of the router, <Link/> component and hooks like useNavigate from react-router-dom will not work. (It would for useNavigate if the function called is declared in the router)
         */
        const newNotification = {
            key: currentNotificationId.current, // key for react list handling (should be different for each notification but sometime isn't for strange reasons)
            content: newNotificationContent, // content of the notification
            isClosing: 0, // 0 if the notification isn't closing, 1 is if it is a classic closing and 2 if it is a fat-closing (when the user manually clic on the arrow)
            creationTime: new Date().getTime(), // timer of creation of the notification, used to delete it at the right time
            customClass,
            timer,
            hoverred: false, // boolean indicating if the notification is hover or not
        }

        currentNotificationId.current++;
        setNotificationList(() => [newNotification].concat(...notificationList))
        if (timer !== "infinite") {
            setTimeout(() => {
                closeNotification(newNotification)
            }, timer);
        }
    }

    let notificationToRemove = []

    function removeNotificationList() {
        if (notificationToRemove.length) {
            setNotificationList((oldNotificationList) => {
                return oldNotificationList.filter((e, i) => !notificationToRemove.includes(i))
            })
        }
        return ""
    }

    function handleMouseLeave(notification) {
        notification.hovered = false;
        if (notification.timer !== "infinite" || notification.creationTime < new Date().getTime() - (notification.timer + 500)) {
            closeNotification(notification, false, 1000)
            notification.creationTime = new Date().getTime() - 1500
        }
    }

    function handleMouseEnter(notification) {
        notification.hovered = true;
    }

    return (
        <notificationContext.Provider value={addNotification} >
            <div id="notifications-container">
                {notificationList.map((el, i) => {
                    if (el.timer === "infinite" || el.creationTime > new Date().getTime() - (el.timer + 500) || el.hovered) {
                        return (
                            <div className={`pop-up-notification ${el.isClosing === 1 ? " closing" : (el.isClosing === 2 ? " fast-closing" : "")} ${el.customClass}`} key={el.key} onMouseEnter={() => handleMouseEnter(el)} onMouseLeave={() => handleMouseLeave(el)} >
                                <DropDownArrow className="notification-close-arrow" onClick={() => { closeNotification(el, true) }} />
                                {el.content}
                            </div>
                        )
                    } else {
                        notificationToRemove.push(i);
                    }
                })}
                {removeNotificationList()}
            </div>
            {children}
        </notificationContext.Provider>
    )
}