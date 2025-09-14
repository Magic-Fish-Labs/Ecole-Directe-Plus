import React, { useState, useRef, useCallback, useEffect } from 'react';

export const useSeasonalAnimation = () => {
  const [particles, setParticles] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const styles = `
      @keyframes wave-expand {
        0% {
          width: 20px;
          height: 20px;
          opacity: 1;
          transform: translate(-50%, -50%) rotate(0deg);
        }
        50% {
          width: 200px;
          height: 200px;
          opacity: 0.6;
          transform: translate(-50%, -50%) rotate(180deg);
        }
        100% {
          width: 400px;
          height: 400px;
          opacity: 0;
          transform: translate(-50%, -50%) rotate(360deg);
        }
      }

      @keyframes orbital-motion {
        0% {
          transform: translate(-50%, -50%) rotate(0deg) translateX(0px) rotate(0deg) scale(0);
          opacity: 0;
        }
        20% {
          transform: translate(-50%, -50%) rotate(72deg) translateX(60px) rotate(-72deg) scale(1.2);
          opacity: 1;
        }
        40% {
          transform: translate(-50%, -50%) rotate(144deg) translateX(120px) rotate(-144deg) scale(1);
          opacity: 0.9;
        }
        60% {
          transform: translate(-50%, -50%) rotate(216deg) translateX(180px) rotate(-216deg) scale(0.8);
          opacity: 0.7;
        }
        80% {
          transform: translate(-50%, -50%) rotate(288deg) translateX(240px) rotate(-288deg) scale(0.6);
          opacity: 0.4;
        }
        100% {
          transform: translate(-50%, -50%) rotate(360deg) translateX(300px) rotate(-360deg) scale(0);
          opacity: 0;
        }
      }

      @keyframes burst-out {
        0% {
          transform: translate(-50%, -50%) scale(0) rotate(0deg);
          opacity: 1;
          filter: blur(0px) hue-rotate(0deg);
        }
        30% {
          transform: translate(-50%, -50%) scale(1.5) rotate(120deg);
          opacity: 1;
          filter: blur(2px) hue-rotate(60deg);
        }
        60% {
          transform: translate(-50%, -50%) scale(1.2) rotate(240deg);
          opacity: 0.8;
          filter: blur(1px) hue-rotate(120deg);
        }
        100% {
          transform: translate(-50%, -50%) scale(0.3) rotate(360deg);
          opacity: 0;
          filter: blur(3px) hue-rotate(180deg);
        }
      }

      @keyframes spiral-ascent {
        0% {
          transform: translate(-50%, -50%) rotate(0deg) translateX(10px) rotate(0deg) translateY(0px) scale(0.5);
          opacity: 0;
        }
        25% {
          transform: translate(-50%, -50%) rotate(180deg) translateX(40px) rotate(-180deg) translateY(-50px) scale(1);
          opacity: 1;
        }
        50% {
          transform: translate(-50%, -50%) rotate(360deg) translateX(70px) rotate(-360deg) translateY(-100px) scale(1.1);
          opacity: 0.9;
        }
        75% {
          transform: translate(-50%, -50%) rotate(540deg) translateX(100px) rotate(-540deg) translateY(-150px) scale(0.8);
          opacity: 0.6;
        }
        100% {
          transform: translate(-50%, -50%) rotate(720deg) translateX(130px) rotate(-720deg) translateY(-200px) scale(0.3);
          opacity: 0;
        }
      }

      @keyframes weather-dance {
        0% {
          transform: translate(-50%, -50%) scale(0);
          opacity: 0;
        }
        15% {
          transform: translate(-30%, -40%) scale(1.2);
          opacity: 1;
        }
        30% {
          transform: translate(-70%, -60%) scale(0.9);
          opacity: 0.9;
        }
        45% {
          transform: translate(-20%, -80%) scale(1.1);
          opacity: 0.8;
        }
        60% {
          transform: translate(-80%, -100%) scale(0.8);
          opacity: 0.6;
        }
        75% {
          transform: translate(-40%, -120%) scale(0.7);
          opacity: 0.4;
        }
        90% {
          transform: translate(-60%, -140%) scale(0.5);
          opacity: 0.2;
        }
        100% {
          transform: translate(-50%, -160%) scale(0.2);
          opacity: 0;
        }
      }

      @keyframes magic-morph {
        0% {
          transform: translate(-50%, -50%) scale(1) rotate(0deg);
          opacity: 1;
          filter: hue-rotate(0deg) brightness(1);
        }
        25% {
          transform: translate(-50%, -50%) scale(1.5) rotate(90deg);
          opacity: 0.9;
          filter: hue-rotate(90deg) brightness(1.3);
        }
        50% {
          transform: translate(-50%, -50%) scale(0.8) rotate(180deg);
          opacity: 0.7;
          filter: hue-rotate(180deg) brightness(0.8);
        }
        75% {
          transform: translate(-50%, -50%) scale(1.3) rotate(270deg);
          opacity: 0.5;
          filter: hue-rotate(270deg) brightness(1.5);
        }
        100% {
          transform: translate(-50%, -50%) scale(0) rotate(360deg);
          opacity: 0;
          filter: hue-rotate(360deg) brightness(2);
        }
      }

      .animate-wave-expand { animation: wave-expand 2s ease-out forwards; }
      .animate-orbital-motion { animation: orbital-motion 3s ease-out forwards; }
      .animate-burst-out { animation: burst-out 2.5s ease-out forwards; }
      .animate-spiral-ascent { animation: spiral-ascent 3.5s ease-out forwards; }
      .animate-weather-dance { animation: weather-dance 2.8s ease-out forwards; }
      .animate-magic-morph { animation: magic-morph 2s ease-in-out forwards; }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const getElementPosition = (element) => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  };

  const createParticle = (type, emoji, position, delay = 0, extraProps = {}) => ({
    id: Math.random() + Date.now(),
    type,
    emoji,
    position,
    delay,
    ...extraProps
  });

  const getAnimationDuration = (type) => {
    switch (type) {
      case 'wave': return 2000;
      case 'orbital': return 3000;
      case 'burst': return 2500;
      case 'spiral': return 3500;
      case 'weather': return 2800;
      case 'magic': return 2000;
      default: return 2000;
    }
  };

  const addParticle = useCallback((particle) => {
    setParticles(prev => [...prev, particle]);
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== particle.id));
    }, getAnimationDuration(particle.type));
  }, []);

  const triggerAnimation = useCallback((event) => {
    const position = getElementPosition(event.target);

    const waveTypes = ['autumn', 'winter', 'spring', 'summer'];
    waveTypes.forEach((season, index) => {
      setTimeout(() => {
        addParticle(createParticle('wave', '', position, 0, { season }));
      }, index * 200);
    });

    const seasonalEmojis = ['🍂', '❄️', '🌸', '☀️', '🌙', '⭐', '🌿', '🌺'];
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        addParticle(createParticle('orbital', seasonalEmojis[i % seasonalEmojis.length], position, i * 0.1));
      }, i * 50);
    }

    const burstEmojis = ['🍁', '🎃', '❄️', '🎄', '🌷', '🦋', '🌻', '🏖️'];
    burstEmojis.forEach((emoji, index) => {
      setTimeout(() => {
        const angle = (index / burstEmojis.length) * 2 * Math.PI;
        const offset = 30;
        const burstPosition = {
          x: position.x + Math.cos(angle) * offset,
          y: position.y + Math.sin(angle) * offset
        };
        addParticle(createParticle('burst', emoji, burstPosition, index * 0.08));
      }, index * 80);
    });

    const weatherEmojis = ['🌪️', '🌈', '⛅', '🌊', '🔥', '💨', '⛈️', '🌫️'];
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const randomOffset = (Math.random() - 0.5) * 100;
        const weatherPosition = {
          x: position.x + randomOffset,
          y: position.y + randomOffset
        };
        addParticle(createParticle('weather', weatherEmojis[i % weatherEmojis.length], weatherPosition));
      }, i * 60);
    }
  }, [addParticle]);

  const AnimationLayer = () => (
    <div className="fixed inset-0 pointer-events-none z-50" ref={containerRef}>
      {particles.map(particle => (
        <AnimatedParticle key={particle.id} particle={particle} />
      ))}
    </div>
  );

  return {
    triggerAnimation,
    AnimationLayer,
    particles
  };
};

const AnimatedParticle = ({ particle }) => {
  const getAnimationClass = () => {
    switch (particle.type) {
      case 'wave':
        return `animate-wave-expand`;
      case 'orbital':
        return 'animate-orbital-motion';
      case 'burst':
        return 'animate-burst-out';
      case 'spiral':
        return 'animate-spiral-ascent';
      case 'weather':
        return 'animate-weather-dance';
      case 'magic':
        return 'animate-magic-morph';
      default:
        return '';
    }
  };

  const getWaveColor = (season) => {
    switch (season) {
      case 'autumn': return 'rgba(255, 107, 53, 0.8)';
      case 'winter': return 'rgba(0, 188, 212, 0.8)';
      case 'spring': return 'rgba(76, 175, 80, 0.8)';
      case 'summer': return 'rgba(255, 193, 7, 0.8)';
      default: return 'rgba(255, 255, 255, 0.8)';
    }
  };

  const getParticleSize = (type) => {
    switch (type) {
      case 'orbital': return '22px';
      case 'burst': return '28px';
      case 'spiral': return '18px';
      case 'weather': return '16px';
      case 'magic': return '24px';
      default: return '20px';
    }
  };

  const getParticleStyles = () => {
    const baseStyles = {
      position: 'absolute',
      left: particle.position.x,
      top: particle.position.y,
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      userSelect: 'none',
      animationDelay: `${particle.delay}s`,
      animationFillMode: 'forwards'
    };

    if (particle.type === 'wave') {
      return {
        ...baseStyles,
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        border: '3px solid',
        borderColor: getWaveColor(particle.season)
      };
    }

    return {
      ...baseStyles,
      fontSize: getParticleSize(particle.type)
    };
  };

  if (particle.type === 'wave') {
    return (
      <div
        className={getAnimationClass()}
        style={getParticleStyles()}
      />
    );
  }

  return (
    <div
      className={`${getAnimationClass()} font-bold`}
      style={getParticleStyles()}
    >
      {particle.emoji}
    </div>
  );
};