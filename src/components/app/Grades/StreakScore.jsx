import { useState, useEffect, useRef, useContext } from 'react'

import { AppContext } from "../../../App";
import {
    Window,
    WindowHeader,
    WindowContent
} from "../../generic/Window";
import ShiningDiv from "../../generic/CustomDivs/ShiningDiv";
import InfoButton from "../../generic/Informative/InfoButton";

// graphics
import Star from "../../graphics/Star";
import ArrowOutline from "../../graphics/ArrowOutline";


import "./StreakScore.css";


export default function StreakScore({ streakScore, streakHighScore=0, className="", ...props }) {
    const [displayedStreakScore, setDisplayedStreakScore] = useState(0);
    const [arrowsNumber, setArrowsNumber] = useState(0); // arrowsNumber on one side only

    const { useUserSettings } = useContext(AppContext);
    const displayMode = useUserSettings("displayMode");
    const showOldStreaks = !!useUserSettings("showOldStreaks").get();

    const containerRef = useRef(null);
    const scoreRef = useRef(null);
    
    const intervalId = useRef(0);
    const currentStep = useRef(0);

    useEffect(() => {
        // animation du score de streak
        currentStep.current = 0;
        
        function lerp(start, end, t) {
            // si on veut changer la "courbe" (t'as la ref) c'est ici, là c'est linéaire
            return start + t * (end - start);
        }

        const newStep = (max) => {
            if (currentStep.current < max) {
                setDisplayedStreakScore(Math.round(lerp(0, streakScore, (currentStep.current + 1) / max)));
                currentStep.current++;
            }
        }

        if (displayMode.get() === "quality" && streakScore) {
            const STEP_NUMBER = (streakScore < 15 ? streakScore : 12 + Math.floor(streakScore / 5)); // à ne pas confondre avec le sport qui consiste à monter et descendre des dizaines de fois par minutes
            const STEP_DURATION = 50;
            intervalId.current = setInterval(() => newStep(STEP_NUMBER), STEP_DURATION);
        } else {
            setDisplayedStreakScore(streakScore);
        }

        return () => {
            if (intervalId.current) {
                clearInterval(intervalId.current);
            }
        }
    }, [streakScore]);

    useEffect(() => {
        // flèches sur les côtés
        const arrowsNumberCalculation = () => {
            // assuming that content is evenly-spaced (flex-box)
            // consider only one side
            const MIN_GAP = 80;
            const ARROW_WIDTH = 25;
            const containerWidth = parseInt(getComputedStyle(containerRef.current).width);
            const scoreWidth = parseInt(getComputedStyle(scoreRef.current).width);
            const availableSpace = containerWidth - (scoreWidth + 2*MIN_GAP);
            const newArrowsNumber = Math.ceil(availableSpace / (ARROW_WIDTH + MIN_GAP));
            if (newArrowsNumber < 1) {
                setArrowsNumber(1);
            } else {
                setArrowsNumber(newArrowsNumber);
            }
        }
        window.addEventListener("resize", arrowsNumberCalculation);
        arrowsNumberCalculation();

        return () => {
            window.removeEventListener("resize", arrowsNumberCalculation);            
        }
    }, []);
    

    return (
        <Window className={`streak-score ${className}`} allowFullscreen={true} growthFactor={.8} {...props}>
            <WindowHeader>
                <InfoButton className="streak-info" options={{ placement: "bottom" }} additionalSVG={<defs>
                        <linearGradient id="streak-info-gradient" gradientTransform="rotate(90)">
                            <stop id="stop-color-start" offset="0%" />
                            <stop id="stop-color-end" offset="100%" />
                        </linearGradient>
                    </defs>}>
                    Nombre de notes consécutives augmentant votre moyenne générale
                </InfoButton>
                
                <h2>Score de Streak</h2>
            </WindowHeader>
            <WindowContent>
                <ShiningDiv className="score" shiningIconsList={[Star]} intensity={streakScore / 13} padding={[50, 80]} ref={containerRef} >
                    {
                        Array.from({ length: arrowsNumber }, (_, index) => <ArrowOutline className="arrow-outline" key={index} style={{ "--order": index }} />)
                    }
                    <span ref={scoreRef}>
                        {displayedStreakScore || 0}
                    </span>
                    {
                        Array.from({ length: arrowsNumber }, (_, index) => <ArrowOutline className="arrow-outline right" key={index} style={{ "--order": (arrowsNumber - index) }} />)
                    }
                </ShiningDiv>
                {showOldStreaks && <div className="score-high-score">
                    Record : <span>{streakHighScore || 0}</span>
                </div>}
            </WindowContent>
        </Window>
    )
}