import React, { useMemo } from 'react';
import { useTime, useHijriDate, useWakeLock } from './hooks/useTime';
import { useMasjidData } from './hooks/useMasjidData';
import { MessageMarquee } from './components/MessageMarquee';
import { PhoneOverlay } from './components/PhoneOverlay';
import { pad, format12NoSuffix, hmToMinutes, minutesToHM, cn } from './lib/utils';
import { format } from 'date-fns';

export default function App() {
  useWakeLock();
  
  const currentTime = useTime();
  const hijriDate = useHijriDate(currentTime);
  const { jamaatToday, prayerCalendar, messageText } = useMasjidData(currentTime);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.warn(err));
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const h12 = currentTime.getHours() % 12 || 12;
  const timeString = `${h12}:${pad(currentTime.getMinutes())}:${pad(currentTime.getSeconds())}`;
  
  const gregorianStr = format(currentTime, 'EEEE, d MMMM yyyy');

  const { activeRow, showSunriseCard, showZawwalCard, showSunsetCard, showPhoneOverlay } = useMemo(() => {
    if (!prayerCalendar || Object.keys(prayerCalendar).length === 0) {
      return { 
        activeRow: '', showSunriseCard: false, showZawwalCard: false, 
        showSunsetCard: false, showPhoneOverlay: false 
      };
    }

    const nowMin = currentTime.getHours() * 60 + currentTime.getMinutes();
    const isFriday = currentTime.getDay() === 5;

    const fajrStart = hmToMinutes(prayerCalendar.Fajr);
    const sunrise = hmToMinutes(prayerCalendar.Sunrise);
    const zuhrStart = hmToMinutes(prayerCalendar.Zuhr);
    const asrStart = hmToMinutes(prayerCalendar.Asr);
    const maghribStart = hmToMinutes(prayerCalendar.Maghrib);
    const ishaStart = hmToMinutes(prayerCalendar.Isha);

    let active = '';
    if (ishaStart !== null && (nowMin >= ishaStart || nowMin < (fajrStart ?? 1440))) active = 'Isha';
    else if (maghribStart !== null && ishaStart !== null && nowMin >= maghribStart && nowMin < ishaStart - 1) active = 'Maghrib';
    else if (asrStart !== null && maghribStart !== null && nowMin >= asrStart && nowMin < maghribStart - 15) active = 'Asr';
    else if (zuhrStart !== null && asrStart !== null && nowMin >= zuhrStart && nowMin < asrStart - 1) active = isFriday ? 'Jummah' : 'Zuhr';
    else if (fajrStart !== null && sunrise !== null && nowMin >= fajrStart && nowMin < sunrise) active = 'Fajr';

    const sunriseMins = sunrise !== null && nowMin >= sunrise && nowMin < sunrise + 15;
    const zawwalMins = zuhrStart !== null && nowMin >= zuhrStart - 15 && nowMin < zuhrStart;
    const sunsetMins = maghribStart !== null && nowMin >= maghribStart - 15 && nowMin < maghribStart;

    let phoneOverlay = false;
    if (Object.keys(jamaatToday).length > 0) {
      const maghribJamaat = maghribStart !== null ? maghribStart + 1 : null;
      let jMins: (number | null)[] = [
        hmToMinutes(jamaatToday.Fajr), hmToMinutes(jamaatToday.Asr),
        maghribJamaat, hmToMinutes(jamaatToday.Isha)
      ];
      if (isFriday) {
        jMins.push(hmToMinutes(jamaatToday.Jumma));
        jMins.push(hmToMinutes(jamaatToday.Jumma2));
      } else {
        jMins.push(hmToMinutes(jamaatToday.Zuhr));
      }
      phoneOverlay = jMins.some(t => t !== null && nowMin >= t - 1 && nowMin <= t + 5);
    }

    return { 
      activeRow: active, showSunriseCard: sunriseMins, 
      showZawwalCard: zawwalMins, showSunsetCard: sunsetMins, 
      showPhoneOverlay: phoneOverlay 
    };
  }, [currentTime, prayerCalendar, jamaatToday]);


  // Helper component for rendering rows
  const PrayerRow = ({ name, startLabel = "Start", startTime, jamaatLabel = "Jama'at", jamaatTime, isActive }: any) => {
    return (
      <div className={cn(
        "flex flex-row items-center justify-between p-[2vmin] rounded-[1.5vmin] border-l-[6px] border-transparent transition-all duration-300",
        isActive && "bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500 animate-breathe"
      )}>
        <div className={cn(
          "font-teko fluid-text-lg font-semibold w-2/5",
          isActive ? "text-amber-500" : "text-white"
        )}>
          {name}
        </div>
        <div className="flex justify-around w-3/5 text-center px-4">
          <div className="flex flex-col items-center">
            <span className="text-zinc-400 fluid-text-xs lowercase">{startLabel}</span>
            <span className={cn(
              "font-teko fluid-text-lg font-medium",
              isActive ? "text-zinc-300" : "text-zinc-500"
            )}>{format12NoSuffix(startTime)}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={cn("fluid-text-xs lowercase", isActive ? "text-amber-400" : "text-zinc-400")}>{jamaatLabel}</span>
            <span className={cn(
              "font-teko fluid-text-xl font-semibold leading-none",
              isActive ? "text-amber-500" : "text-white"
            )}>{jamaatTime ? format12NoSuffix(jamaatTime) : '--:--'}</span>
          </div>
        </div>
      </div>
    );
  };

  const zawwalCalc = minutesToHM(hmToMinutes(prayerCalendar?.Zuhr) ? hmToMinutes(prayerCalendar.Zuhr)! - 15 : null);
  const maghribJamaatCalc = minutesToHM(hmToMinutes(prayerCalendar?.Maghrib) ? hmToMinutes(prayerCalendar.Maghrib)! + 1 : null);

  const isFriday = currentTime.getDay() === 5;

  return (
    <>
      <PhoneOverlay show={showPhoneOverlay} timeString={timeString} />
      
      <main className="flex portrait:flex-col landscape:flex-row h-[100dvh] w-full p-[3vmin] gap-[3vmin] select-none">
        {/* Left Panel */}
        <section className="flex flex-col portrait:h-[40vh] landscape:w-[42%] justify-between bg-zinc-900/60 backdrop-blur-md rounded-[3vmin] p-[4vmin] border border-white/5 shadow-2xl relative overflow-hidden">
          
          <div className="flex w-full justify-center cursor-pointer transition-transform duration-300 hover:scale-[1.02] shrink-0" onClick={toggleFullscreen}>
             <img src="https://www.wakefieldcentralmosque.co.uk/assets/img/img/logo-mosque.svg" alt="Masjid logo" className="w-[clamp(180px,25vw,400px)] invert brightness-90 sepia" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative z-10 w-full shrink my-[4vmin]">
            <div className="font-teko fluid-text-giant font-semibold leading-[0.85] text-white tabular-nums drop-shadow-[0_0_40px_rgba(212,175,55,0.2)]">
              {timeString || "--:--:--"}
            </div>
            <div className="flex flex-col items-center gap-[1vmin] mt-[2vmin]">
              <div className="fluid-text-base text-zinc-100 font-medium tracking-wide">
                {gregorianStr || "---"}
              </div>
              <div className="fluid-text-sm text-amber-500 font-semibold tracking-wide bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
                {hijriDate || "---"}
              </div>
            </div>
          </div>

          <div className="shrink-0 w-full mt-auto flex flex-col gap-[2vmin]">
            <MessageMarquee text={messageText} />
          </div>
        </section>

        {/* Right Panel */}
        <section className="flex flex-col portrait:flex-1 landscape:w-[58%] bg-zinc-900/60 backdrop-blur-md rounded-[3vmin] p-[3vmin] border border-white/5 shadow-2xl justify-between">
          <div className="flex flex-col justify-around flex-1 mb-[2vmin]">
             <PrayerRow name="Fajr" startTime={prayerCalendar?.Fajr} jamaatTime={jamaatToday?.Fajr} isActive={activeRow === 'Fajr'} />
             
             {isFriday ? (
                <PrayerRow name="Jummah" startLabel="1st Jama'at" startTime={jamaatToday?.Jumma} jamaatLabel="2nd Jama'at" jamaatTime={jamaatToday?.Jumma2} isActive={activeRow === 'Jummah'} />
             ) : (
                <PrayerRow name="Zuhr" startTime={prayerCalendar?.Zuhr} jamaatTime={jamaatToday?.Zuhr} isActive={activeRow === 'Zuhr'} />
             )}

             <PrayerRow name="Asr" startTime={prayerCalendar?.Asr} jamaatTime={jamaatToday?.Asr} isActive={activeRow === 'Asr'} />
             <PrayerRow name="Maghrib" startTime={prayerCalendar?.Maghrib} jamaatTime={maghribJamaatCalc} isActive={activeRow === 'Maghrib'} />
             <PrayerRow name="Isha" startTime={prayerCalendar?.Isha} jamaatTime={jamaatToday?.Isha} isActive={activeRow === 'Isha'} />
          </div>

          <div className="flex flex-row justify-center items-center gap-[2vmin] shrink-0 pt-[1vmin] border-t border-white/5">
             <div className={cn("flex flex-1 flex-col items-center justify-center bg-black/20 rounded-[2vmin] p-[2vmin] border border-transparent transition-all duration-300", showSunriseCard && "animate-breathe")}>
                <span className="fluid-text-xs font-semibold text-zinc-400 capitalize tracking-wider">Sunrise</span>
                <span className="font-teko fluid-text-lg font-semibold text-amber-500">{format12NoSuffix(prayerCalendar?.Sunrise)}</span>
             </div>
             <div className={cn("flex flex-1 flex-col items-center justify-center bg-black/20 rounded-[2vmin] p-[2vmin] border border-transparent transition-all duration-300", showZawwalCard && "animate-breathe")}>
                <span className="fluid-text-xs font-semibold text-zinc-400 capitalize tracking-wider">Zawwal</span>
                <span className="font-teko fluid-text-lg font-semibold text-amber-500">{format12NoSuffix(zawwalCalc)}</span>
             </div>
             <div className={cn("flex flex-1 flex-col items-center justify-center bg-black/20 rounded-[2vmin] p-[2vmin] border border-transparent transition-all duration-300", showSunsetCard && "animate-breathe")}>
                <span className="fluid-text-xs font-semibold text-zinc-400 capitalize tracking-wider">Sunset</span>
                <span className="font-teko fluid-text-lg font-semibold text-amber-500">{format12NoSuffix(prayerCalendar?.Maghrib)}</span>
             </div>
          </div>
        </section>
      </main>
    </>
  );
}
