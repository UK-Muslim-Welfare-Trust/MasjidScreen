import React, { useEffect, useState, useRef } from "react";

export function MessageMarquee({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [needsScroll, setNeedsScroll] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (containerRef.current && contentRef.current) {
        setNeedsScroll(contentRef.current.scrollHeight > containerRef.current.clientHeight);
      }
    };
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [text]);

  const defaultHadiths = [
    "The best of you are those who learn the Qur'an and teach it.",
    "The most beloved deed to Allah is that which is most consistent, even if it is little.",
    "Whoever builds a mosque for Allah, Allah will build for him a house in Paradise.",
    "Charity extinguishes sin as water extinguishes fire.",
    "He who is not grateful to people is not grateful to Allah."
  ];

  const displayMessage = text || defaultHadiths[0];

  return (
    <div 
      className="w-full relative overflow-hidden bg-zinc-900/50 rounded-2xl p-4 flex items-center justify-center flex-shrink-0 min-h-[12vh]"
      ref={containerRef}
    >
      <div 
        className="w-full relative overflow-hidden h-full flex flex-col justify-center"
      >
        {needsScroll ? (
          <div className="animate-marquee-y flex flex-col">
            <div className="text-zinc-400 italic text-center fluid-text-sm mb-[20vh] px-4" dangerouslySetInnerHTML={{ __html: displayMessage.replace(/\n/g, '<br/>') }} />
            <div className="text-zinc-400 italic text-center fluid-text-sm px-4" dangerouslySetInnerHTML={{ __html: displayMessage.replace(/\n/g, '<br/>') }} />
          </div>
        ) : (
          <div 
            ref={contentRef}
            className="text-zinc-400 italic text-center fluid-text-sm px-4"
            dangerouslySetInnerHTML={{ __html: displayMessage.replace(/\n/g, '<br/>') }}
          />
        )}
      </div>
    </div>
  );
}
