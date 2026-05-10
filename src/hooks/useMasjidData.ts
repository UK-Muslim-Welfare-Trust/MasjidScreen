import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { pad } from "../lib/utils";

const PATH = `artifacts/masjid-connect-app/public/data`;

export interface PrayerData {
  [key: string]: string; // E.g., 'Fajr': '04:30'
}

export function useMasjidData(currentTime: Date) {
  const [jamaatToday, setJamaatToday] = useState<PrayerData>({});
  const [prayerCalendar, setPrayerCalendar] = useState<PrayerData>({});
  const [messageText, setMessageText] = useState("");

  const currentDateString = `${pad(currentTime.getDate())}-${pad(currentTime.getMonth() + 1)}`;

  useEffect(() => {
    // Attempt local load first
    try {
      const cal = localStorage.getItem('masjid_prayerCalendar');
      const jam = localStorage.getItem('masjid_jamaatToday');
      const msg = localStorage.getItem('masjid_messageText');
      if (cal) setPrayerCalendar(JSON.parse(cal));
      if (jam) setJamaatToday(JSON.parse(jam));
      if (msg) setMessageText(msg);
    } catch {}

    const unsubJamaat = onSnapshot(doc(db, `${PATH}/prayerTimes/today`), (s) => {
      if (s.exists()) {
        const data = s.data() as PrayerData;
        setJamaatToday(data);
        localStorage.setItem('masjid_jamaatToday', JSON.stringify(data));
      }
    });

    const unsubCal = onSnapshot(doc(db, `${PATH}/prayerCalendar/${currentDateString}`), (s) => {
      if (s.exists()) {
        const data = s.data() as PrayerData;
        setPrayerCalendar(data);
        localStorage.setItem('masjid_prayerCalendar', JSON.stringify(data));
      }
    });

    const unsubMsg = onSnapshot(doc(db, `${PATH}/message/message`), (s) => {
      const text = s.exists() && s.data().text ? String(s.data().text).trim() : '';
      setMessageText(text);
      localStorage.setItem('masjid_messageText', text);
    });

    return () => {
      unsubJamaat();
      unsubCal();
      unsubMsg();
    };
  }, [currentDateString]);

  return { jamaatToday, prayerCalendar, messageText };
}
