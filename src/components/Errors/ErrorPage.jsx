
import { useState, useContext, useRef } from "react";
import { useRouteError } from "react-router-dom";
import { AppContext } from "../../App";

import { generateUUID, sendToWebhook, sendJsonToWebhook } from "../../utils/utils";

import Error404 from "./Error404";
import "./ErrorPage.css";
import Button from "../generic/UserInputs/Button";

export default function ErrorPage({ sardineInsolente }) {
    const { accountsListState, activeAccount, isDevChannel, globalSettings, useUserSettings, useUserData } = useContext(AppContext);
    const error = useRouteError();
    const [reportSent, setReportSent] = useState(false);
    const [userDataSent, setUserDataSent] = useState([]);

    const sendingDelayRef = useRef(0);

    const userData = useUserData();

    const settings = useUserSettings();

    function safetyFunction() {
        console.log("safety function | reset")
        localStorage.clear()
    }


    if (error.status === 404) {
        return (
            <Error404 />
        );
    }
    else {
        if (process.env.NODE_ENV !== "development") {
            safetyFunction();
            if (isDevChannel) {
                globalSettings.isDevChannel.set(true);
            }
            if (settings.get("allowAnonymousReports")) {
                const report = {
                    uuid: generateUUID(accountsListState[activeAccount].firstName + accountsListState[activeAccount].lastName),
                    error_name: error.name,
                    error_message: error.message,
                    error_code: error.error_code,
                    location: (location.hostname + location.pathname),
                    stack_trace: error.stack?.replace(new RegExp("https://", 'g'), ""),
                    add_data: error.additional_data,
                }
                if (!reportSent) {
                    sendToWebhook(sardineInsolente, report)
                        .then(() => setReportSent(true))
                        .catch((error) => setReportSent(error.toString()));
                }
            }
        }

        function handleDataSend(data) {
            const report = userData.get(data)
            console.log(sendingDelayRef.current - new Date().getTime())
            console.log(Math.max(sendingDelayRef.current - new Date().getTime(), 0))
            sendJsonToWebhook(
                "https://discord.com/api/webhooks/1191719781347369023/3-M7JS4i0XyWifa8yUWEPz8-Nm04eWmT3bIz-qGkNGnt-AIb8evoSN7SrNBejoXyjIBC",
                generateUUID(accountsListState[activeAccount].firstName + accountsListState[activeAccount].lastName) + "(" + data + ")",
                report,
                Math.max(sendingDelayRef.current - new Date().getTime(), 0)
            )
            .then((cooldown) => {
                sendingDelayRef.current = cooldown + new Date().getTime()
            })
            setUserDataSent(old => [...old, data])
        }

        return (
            <div id="error-page">
                <h1>Oops!</h1>
                <p>Sorry, an unexpected error has occurred.</p>
                <p>
                    <i>{error.toString()}</i>
                </p>
                {typeof (reportSent) === "boolean"
                    ? (reportSent ? <p>Error report sent successfully.</p> : <p>Sending error report to support...</p>)
                    : <p>Failed to send error report: {reportSent}</p>
                }
                <div className="data-sender">
                    <h2>Pour nous aider vous pouvez :</h2>
                    <div className="button-wrapper">
                        <Button onClick={() => handleDataSend("grades")} disabled={!userData.get("grades") || userDataSent.includes("grades")} >
                            {userDataSent.includes("grades") ? "Merci pour votre retour !" : "Envoyer vos notes"}
                        </Button>
                        <Button onClick={() => handleDataSend("sortedHomeworks")} disabled={!userData.get("sortedHomeworks") || userDataSent.includes("sortedHomeworks")} >
                            {userDataSent.includes("sortedHomeworks") ? "Merci pour votre retour !" : "Envoyer vos devoirs"}
                        </Button>
                    </div>
                    
                    <p>IMPORTANT : Ces retours peuvent contenir des informations personnelles, c'est pourquoi nous avons besoin de votre consentement pour les effectuer, mais ils nous permettrons de mieux identifier le bug qui vous a touché.</p>
                </div>
            </div>
        );
    }
} 