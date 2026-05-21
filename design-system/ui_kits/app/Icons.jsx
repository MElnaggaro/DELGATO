// Icons.jsx — minimal inline-SVG icon set, 2px stroke, currentColor.
// Substitute for Lucide; matches brand iconography spec exactly.

const stroke = (path, vb = '0 0 24 24') => ({ size = 22 }) => (
  <svg width={size} height={size} viewBox={vb} fill="none"
       stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round">{path}</svg>
);

const Icon = {
  home: stroke(<>
    <path d="M3 9l9-6 9 6v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <path d="M9 22V12h6v10"/>
  </>),
  search: stroke(<>
    <circle cx="11" cy="11" r="7"/>
    <path d="m21 21-4.3-4.3"/>
  </>),
  cart: stroke(<>
    <path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 7H6"/>
    <circle cx="9" cy="21" r="1"/>
    <circle cx="20" cy="21" r="1"/>
  </>),
  user: stroke(<>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </>),
  pin: stroke(<>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </>),
  bell: stroke(<>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
  </>),
  chevronRight: stroke(<path d="m9 18 6-6-6-6"/>),
  chevronLeft: stroke(<path d="m15 18-6-6 6-6"/>),
  clock: stroke(<>
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
  </>),
  bike: stroke(<>
    <circle cx="5.5" cy="17.5" r="3.5"/>
    <circle cx="18.5" cy="17.5" r="3.5"/>
    <path d="M15 6h2.5a1.5 1.5 0 0 1 1.4 1l1.6 4-2.5 6.5"/>
    <path d="m6 17 5-11h-2"/>
    <path d="M12 6h3l3 8"/>
  </>),
  star: stroke(<polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"/>),
  plus: stroke(<><path d="M5 12h14"/><path d="M12 5v14"/></>),
  minus: stroke(<path d="M5 12h14"/>),
  check: stroke(<path d="M20 6 9 17l-5-5"/>),
  x: stroke(<><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>),
  arrowRight: stroke(<><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>),
  arrowLeft: stroke(<><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></>),
  trash: stroke(<>
    <path d="M3 6h18"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </>),
  filter: stroke(<polygon points="22 3 2 3 10 12.5 10 19 14 21 14 12.5 22 3"/>),
  package: stroke(<>
    <path d="m7.5 4.27 9 5.15"/>
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
    <path d="m3.3 7 8.7 5 8.7-5"/>
    <path d="M12 22V12"/>
  </>),
  receipt: stroke(<>
    <path d="M4 2v20l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2V2l-2 2-2-2-2 2-2-2-2 2-2-2-2 2-2-2Z"/>
    <path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h6"/>
  </>),
  card: stroke(<>
    <rect width="20" height="14" x="2" y="5" rx="2"/>
    <line x1="2" x2="22" y1="10" y2="10"/>
  </>),
  cash: stroke(<>
    <rect width="20" height="12" x="2" y="6" rx="2"/>
    <circle cx="12" cy="12" r="2"/>
    <path d="M6 12h.01M18 12h.01"/>
  </>),
  phone: stroke(<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>),
  info: stroke(<>
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  </>),
  heart: stroke(<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>),
  bag: stroke(<>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
    <line x1="3" x2="21" y1="6" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </>),
  sparkle: stroke(<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>),
};

window.Icon = Icon;
