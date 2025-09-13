import { useState } from "react";
import "./css/panel.css";
import { Ghost } from "./elements/ghost";
import HalloweenCanardman from "./elements/halloween_canardman";

export function HalloweenPanel() {
  const [closed, setClosed] = useState(false);

  return (
    !closed ? (
      <div className="panel">
        <div className="content">
          <div className="text-element">
            <h1>Joyeux Halloween !</h1>
            <h3>Toute l&apos;équipe <span>Magic Fishes</span> ainsi que ses contributeurs vous souhaitent de bonnes vacances et un joyeux Halloween.</h3>
            <p>PS: Même CanardMan s&apos;est déguisé pour l&apos;occasion !</p>
            <div className="gap"></div>
            <HalloweenCanardman className="small" />
          </div>
          <div className="ghost">
            <Ghost />
          </div>
        </div>

        <button className="close-button" onClick={() => setClosed(true)}>
            <div className="ambient-glow"></div>
            <div className="spooky-glow"></div>
            <span className="text">Chouette !</span>
        </button>

        <div className="footer">
          <p>N&apos;hésitez pas à partager vos idées et suggestions sur notre discord !    |    Développement thèmes saisonniers: <a href="https://github.com/Ewalwi">@Ewalwi</a></p>
          <p></p>
          <p></p>
        </div>
      </div>
    ) : null
  );
}