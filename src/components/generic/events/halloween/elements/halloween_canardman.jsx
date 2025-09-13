import '../css/canardman.css';

const HalloweenCanardman = ({className}) => {
  return (
    <div className="container">
      <img src="../../public/events/halloween/disguised_canardman.png" alt="halloween_canardman" className={`canardman ${className}`} id={`canardman`} />
    </div>
  )
};

export default HalloweenCanardman;