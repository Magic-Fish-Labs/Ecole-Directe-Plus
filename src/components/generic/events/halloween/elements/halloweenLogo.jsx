const HalloweenLogo = ({ className = "", id = "", alt = "Halloween logo", ...props }) => {
  return (
    <svg
      className={`edp-logo halloween ${className}`}
      id={id}
      viewBox="0 0 140 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      {...props}
    >
      <title>{alt}</title>

      {/* Lune scintillante */}
      <g>
        <circle cx="110" cy="18" r="12" fill="#f4d03f">
          <animate attributeName="opacity" values="0.9;0.6;0.9" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="114" cy="15" r="12" fill="#000" opacity="0.5" />
      </g>

      {/* Brume mouvante */}
      <g opacity="0.25">
        <rect x="0" y="70" width="140" height="20" fill="url(#fogGradient)">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; -40,0; 0,0"
            dur="8s"
            repeatCount="indefinite"
          />
        </rect>
      </g>

      {/* Chauves-souris animées */}
      <g>
        <path d="M15 25 q5 -5 10 0 q-3 -2 -5 -1 q-2 -1 -5 1z" fill="#000">
          <animateTransform attributeName="transform" type="translate" values="0,0; 0,2; 0,0" dur="1s" repeatCount="indefinite" />
        </path>
        <path d="M45 12 q4 -4 8 0 q-2 -1 -4 0 q-2 -1 -4 0z" fill="#000">
          <animateTransform attributeName="transform" type="translate" values="0,0; 0,1.5; 0,0" dur="0.9s" repeatCount="indefinite" />
        </path>
        <path d="M70 30 q5 -5 10 0 q-3 -2 -5 -1 q-2 -1 -5 1z" fill="#000">
          <animateTransform attributeName="transform" type="translate" values="0,0; 0,3; 0,0" dur="1.1s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Logo principal */}
      <g>
        <path
          fill={`url(#gradient-${id})`}
          className="paths"
          d="M89.9985 24V0H31.9985C21.3319 0.833333 0 7.3 0 38.5C5.50049 26.5 17.499 24 21.4985 24H89.9985Z"
        />
        <path
          fill={`url(#gradient-${id})`}
          className="paths"
          d="M90.0017 55V31.5H27.0016C-9.00047 31.5 -9.00055 86 27.0016 86H90.0017V62.5H27.0016C22.0011 62.5 22.0013 55 27.0016 55H90.0017Z"
        />
      </g>

      {/* Dégradés */}
      <defs>
        <linearGradient id={`gradient-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffffff" />
          <stop offset="100%" stopColor="#2b2800ff" />
        </linearGradient>

        <linearGradient id="fogGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="50%" stopColor="white" stopOpacity="0.1" />
          <stop offset="100%" stopColor="white" stopOpacity="0.4" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default HalloweenLogo;
