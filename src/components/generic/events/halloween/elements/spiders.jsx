import "../css/spiders.css";

export function Spiders() {
  const spiders = ["spider_0", "spider_1", "spider_2", "spider_3", "spider_4", "spider_5"];

  return (
    spiders.map((spider, index) => (
      <div className={spider} key={index}>
        <div className='eye left'></div>
        <div className='eye right'></div>
        <span className='leg left'></span>
        <span className='leg left'></span>
        <span className='leg left'></span>
        <span className='leg left'></span>
        <span className='leg right'></span>
        <span className='leg right'></span>
        <span className='leg right'></span>
        <span className='leg right'></span>
      </div>
    ))
  )
}