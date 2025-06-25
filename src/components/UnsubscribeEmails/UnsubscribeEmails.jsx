
import { useState, useEffect } from "react";

import "./UnsubscribeEmails.css";

// graphics
import LoadingAnimation from "../graphics/LoadingAnimation";
import { Link } from "react-router-dom";


export default function UnsubscribeEmails({ activeUser, thonFrustre }) {
    const [isUnsubscribed, setIsUnsubscribed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        document.title = "Se désabonner des emails • Ecole Directe Plus";
    }, []);


    useEffect(() => {
        const date = new Date();
        const options = { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: "numeric" }
        const readableDate = date.toLocaleDateString('fr-FR', options);
        fetch(
            thonFrustre,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    embeds: [
                        {
                            color: parseInt("0xB4B4F0"),
                            author: {
                                name: (activeUser ? activeUser.lastName + " " + activeUser.firstName : "Poisson-zèbre Augmenté") + " (" + (activeUser ? activeUser.email : "") + ")",
                                icon_url: (!activeUser ? "https://i.ibb.co/CKmD9z8/poisson-z-bre.jpg" : activeUser.picture)
                            },
                            title: "Désabonnement aux emails",
                            description: "Cet utilisateur ne souhaite plus recevoir d'email d'Ecole Directe Plus",
                            footer: {
                                text: readableDate,
                            },
                        }
                    ]
                }),
            }
        )
            .then(() => {
                setIsUnsubscribed(true);
            })
            .catch((error) => {
                setErrorMessage(error.message);
            })
    }, [])

    // JSX
    return (
        <div id="unsubscribe-emails">
            <h1>Ne plus recevoir les emails d'Ecole Directe Plus</h1>
            {!isUnsubscribed
                ? <div>
                    Désabonnement en cours...
                    <LoadingAnimation id="loading-animation" />
                </div>
                : <div>
                    <p>Désabonné avec succès !</p>
                    <Link to="/app/dashboard" id="call-to-action">Accéder à Ecole Directe Plus</Link>
                </div>
            }
            {errorMessage
                ? <div id="error-message">{errorMessage}</div>
                : null
            }
        </div>
    )
}
