import React, { useState } from 'react';
import TITLE_LOGO_SRC from '../assets/images/connect_dots_title_logo.png';

interface GameTitleLogoProps {
  className?: string;
}

export const GameTitleLogo: React.FC<GameTitleLogoProps> = ({
  className = 'w-[270px] sm:w-[360px] md:w-[375px] lg:w-[415px] xl:w-[445px] 2xl:w-[485px]',
}) => {
  const [shineCycle, setShineCycle] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);

  const handleMouseEnter = () => {
    setShineCycle(prev => prev + 1);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      className={`relative inline-flex items-center justify-center aspect-[1060/556] select-none ${className}`}
    >
      {!imgFailed ? (
        <>
          <img
            src={TITLE_LOGO_SRC}
            alt="Connect the Dots Word Game"
            decoding="async"
            draggable={false}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-contain drop-shadow-[0_10px_18px_rgba(15,23,42,0.28)]"
          />

          {/* Glossy diagonal shine reflection masked strictly to the title silhouette — triggers only on hover */}
          {shineCycle > 0 && (
            <div
              key={shineCycle}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
              style={{
                WebkitMaskImage: `url(${TITLE_LOGO_SRC})`,
                maskImage: `url(${TITLE_LOGO_SRC})`,
                WebkitMaskSize: '100% 100%',
                maskSize: '100% 100%',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
              }}
            >
              <div className="animate-title-shine absolute inset-y-0 left-0 w-[34%] flex items-stretch gap-2">
                <div className="w-[70%] h-full bg-gradient-to-r from-transparent via-white/85 to-transparent" />
                <div className="w-[22%] h-full bg-gradient-to-r from-transparent via-white/75 to-transparent" />
              </div>
            </div>
          )}
        </>
      ) : (
        <span
          style={{
            WebkitTextStroke: '4px #FFFFFF',
            paintOrder: 'stroke fill',
            textShadow: '0 6px 0 rgba(74, 18, 10, 0.3)',
          }}
          className="font-display font-bold text-3xl sm:text-5xl text-amber-400 text-center leading-tight"
        >
          Connect the Dots Word Game
        </span>
      )}
    </div>
  );
};
