import "../css/spooky-btn.css"

export const SpookyBtn = ({text, onClick, ...props}) => {
  
  return (
    <button class="spooky-btn" onClick={onClick}>
        <div class="ambient-glow"></div>
        <div class="spooky-glow"></div>
        <span class="text">{text}</span>
    </button>
  )
}