import { useState } from "react";
import "./css/panel.css";
import { Ghost } from "./elements/ghost";

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
          </div>
          <div className="ghost">
            <Ghost />
          </div>
        </div>

        <button class="close-button" onClick={() => setClosed(true)}>
            <div class="ambient-glow"></div>
            <div class="spooky-glow"></div>
            <span class="text">Chouette !</span>
        </button>

        <div className="footer">
          <p>N&apos;hésitez pas à partager vos idées et suggestions sur notre discord !    |    Développeur thèmes saisonniers: <a href="https://github.com/Ewalwi">@Ewalwi</a></p>
          <p></p>
          <p></p>
        </div>
      </div>
    ) : null
  );
}