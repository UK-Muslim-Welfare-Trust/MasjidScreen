import { useState, useEffect, useRef } from "react";
import { pad } from "../lib/utils";

// Time Hook handling offset and world time.
export function useTime() {
  const [timeOffset, setTimeOffset] = useState(0);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  const fetchTime = async () => {
    const urls = [
      'https://worldtimeapi.org/api/timezone/Europe/London',
      'https://www.timeapi.io/api/Time/current/zone?timeZone=Europe/London'
    ];
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        const timeString = data.datetime || data.dateTime;
        if (timeString) {
          const serverTime = new Date(timeString).getTime();
          const localTime = Date.now();
          setTimeOffset(serverTime - localTime);
          return;
        }
      } catch (e) {
        // Continue to the next fallback url
      }
    }
  };

  useEffect(() => {
    fetchTime();
    const intervalId = setInterval(fetchTime, 1000 * 60 * 60); // Refresh every hour
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date(Date.now() + timeOffset));
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeOffset]);

  return currentTime;
}

export function useHijriDate(currentTime: Date) {
  const [hijriDate, setHijriDate] = useState<string>("---");
  const dateStr = `${pad(currentTime.getDate())}-${pad(currentTime.getMonth() + 1)}-${currentTime.getFullYear()}`;
  
  useEffect(() => {
    const fetchHijri = async () => {
      try {
        const res = await fetch(`https://api.aladhan.com/v1/gToH?date=${dateStr}`);
        if (!res.ok) return;
        const json = await res.json();
        if (json?.data?.hijri) {
          setHijriDate(`${json.data.hijri.day} ${json.data.hijri.month.en} ${json.data.hijri.year}H`);
        }
      } catch (e) {
        console.warn('Hijri fetch failed', e);
      }
    };
    fetchHijri();
  }, [dateStr]);

  return hijriDate;
}

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const requestWakeLock = async () => {
    if ('wakeLock' in navigator && !wakeLockRef.current) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        wakeLockRef.current.addEventListener('release', () => {
          wakeLockRef.current = null;
        });
      } catch (err) {
        console.error('Wake Lock failed:', err);
      }
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') requestWakeLock();
    };
    
    document.addEventListener('visibilitychange', handleVisibility);
    requestWakeLock();
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      releaseWakeLock();
    };
  }, []);
}
