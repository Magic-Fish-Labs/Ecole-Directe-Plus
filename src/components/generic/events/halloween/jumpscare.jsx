import "./css/jumpscare.css";

export default function Jumpscare({activate, ...props}) {
  return (
    <div className={`jumpscare ${activate ? "active" : ""}`} {...props}>
      <img src="../../public/events/halloween/jumpscare.jpeg" alt="jumpscare" className="jumpscare-image" />
    </div>
  )
}