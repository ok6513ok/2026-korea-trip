// foundation.jsx — design tokens, icons, mock data, shared components

// ─────────────────────────────────────────────────────────────
// TOKENS
// ─────────────────────────────────────────────────────────────
const T = {
  bg:        '#F6F1E6',
  bgSoft:    '#FBF7EE',
  card:      '#FFFFFF',
  surfaceTint:'#EDE6D6',
  primary:   '#3F7B8A',
  primarySoft:'#E1EBEE',
  primaryDark:'#2A5C68',
  orange:    '#E89358',
  orangeSoft:'#FBE6D4',
  yellow:    '#F2C871',
  yellowSoft:'#FAEBC8',
  green:     '#7CA983',
  greenSoft: '#DDE9D9',
  rose:      '#C97A82',
  roseSoft:  '#F3DCDF',
  ink:       '#2A2A2A',
  ink2:      '#5A554D',
  ink3:      '#8A857A',
  ink4:      '#B5B0A4',
  divider:   '#ECE5D5',
  shadowCard: '0 1px 0 rgba(0,0,0,0.02), 0 6px 18px rgba(74,60,32,0.05)',
  shadowSoft: '0 2px 10px rgba(74,60,32,0.04)',
  shadowFab:  '0 8px 24px rgba(63,123,138,0.35), 0 2px 6px rgba(63,123,138,0.25)',
  font: '"Noto Sans TC", -apple-system, system-ui, "PingFang TC", sans-serif',
};

// ─────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────
const Icon = ({ name, size = 22, color = 'currentColor', strokeWidth = 1.7 }) => {
  const p = { fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    home: <><path d="M3.5 11L12 4l8.5 7" {...p}/><path d="M5.5 9.5V20h13V9.5" {...p}/><path d="M10 20v-5h4v5" {...p}/></>,
    today: <><rect x="3.5" y="5" width="17" height="15" rx="2.5" {...p}/><path d="M3.5 9.5h17M8 3v4M16 3v4" {...p}/><circle cx="12" cy="14" r="2" {...p}/></>,
    route: <><circle cx="6" cy="6" r="2.2" {...p}/><circle cx="18" cy="18" r="2.2" {...p}/><path d="M8.2 6H14a4 4 0 014 4v0a4 4 0 01-4 4h-4a4 4 0 00-4 4v0" {...p}/></>,
    wallet: <><path d="M4 8a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" {...p}/><path d="M4 10h16" {...p}/><circle cx="16" cy="14.5" r="1.3" fill={color} stroke="none"/></>,
    bed: <><path d="M3 18v-7a2 2 0 012-2h14a2 2 0 012 2v7" {...p}/><path d="M3 15h18M3 18v2M21 18v2" {...p}/><path d="M7 9V7a1.5 1.5 0 011.5-1.5h7A1.5 1.5 0 0117 7v2" {...p}/></>,
    plus: <><path d="M12 5v14M5 12h14" {...p}/></>,
    pin: <><path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" {...p}/><circle cx="12" cy="9" r="2.5" {...p}/></>,
    map: <><path d="M3 6.5l6-2 6 2 6-2v13l-6 2-6-2-6 2v-13z" {...p}/><path d="M9 4.5v13M15 6.5v13" {...p}/></>,
    clock: <><circle cx="12" cy="12" r="8.5" {...p}/><path d="M12 7.5V12l3 2" {...p}/></>,
    chevR: <><path d="M9 5l7 7-7 7" {...p}/></>,
    chevL: <><path d="M15 5l-7 7 7 7" {...p}/></>,
    chevD: <><path d="M5 9l7 7 7-7" {...p}/></>,
    chevU: <><path d="M5 15l7-7 7 7" {...p}/></>,
    plane: <><path d="M3 13l3-1 3 4 2-.5-2-5 4-1.2 2 2 2-.5-1.5-2.5L20 7l1 1-3 4.5 1 5-1.7.5-3-4.2-3 1-.5 3-1.5.5-.5-3-2.8-1.5z" {...p}/></>,
    user: <><circle cx="12" cy="8" r="3.5" {...p}/><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" {...p}/></>,
    users: <><circle cx="9" cy="9" r="3" {...p}/><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" {...p}/><path d="M15.5 6.5a3 3 0 010 5.5M17 14c2.5.5 4 2.5 4 5" {...p}/></>,
    split: <><circle cx="6" cy="6" r="2" {...p}/><circle cx="18" cy="6" r="2" {...p}/><circle cx="12" cy="18" r="2" {...p}/><path d="M7.5 7.5l3 9M16.5 7.5l-3 9" {...p}/></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" {...p}/></>,
    bookmark: <><path d="M6 4h12v17l-6-4-6 4V4z" {...p}/></>,
    settings: <><circle cx="12" cy="12" r="3" {...p}/><path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H3a2 2 0 010-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H9a1.6 1.6 0 001-1.5V3a2 2 0 014 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V9a1.6 1.6 0 001.5 1H21a2 2 0 010 4h-.1a1.6 1.6 0 00-1.5 1z" {...p}/></>,
    sun: <><circle cx="12" cy="12" r="4" {...p}/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" {...p}/></>,
    cloud: <><path d="M7 18h10a4 4 0 100-8 6 6 0 00-11.7 1.5A3.5 3.5 0 007 18z" {...p}/></>,
    snow: <><path d="M12 3v18M3 12h18M5 5l14 14M19 5L5 19" {...p}/></>,
    subway: <><rect x="5" y="3" width="14" height="15" rx="3" {...p}/><path d="M5 12h14" {...p}/><circle cx="9" cy="15" r=".9" fill={color} stroke="none"/><circle cx="15" cy="15" r=".9" fill={color} stroke="none"/><path d="M8 18l-2 3M16 18l2 3" {...p}/></>,
    fork: <><path d="M7 3v8a2 2 0 002 2v8M5 3v5M9 3v5M15 3c-1 2-1 5 0 7 1 0 2-1 2-3V3M15 13v8" {...p}/></>,
    bag: <><path d="M5 8h14l-1 12H6L5 8z" {...p}/><path d="M9 8V6a3 3 0 016 0v2" {...p}/></>,
    ticket: <><path d="M3 9a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 000 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1a2 2 0 000-4V9z" {...p}/><path d="M10 8v8" strokeDasharray="2 2" {...p}/></>,
    coffee: <><path d="M4 9h12v6a4 4 0 01-4 4H8a4 4 0 01-4-4V9z" {...p}/><path d="M16 11h2a2.5 2.5 0 010 5h-2M8 3v3M12 3v3" {...p}/></>,
    cart: <><circle cx="9" cy="20" r="1.4" {...p}/><circle cx="17" cy="20" r="1.4" {...p}/><path d="M3 4h2l2.5 11h11l2-7H7" {...p}/></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" {...p}/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" {...p}/></>,
    phone: <><path d="M4.5 5a2 2 0 012-2h2l2 4-2 1.5a11 11 0 005 5L14 11.5l4 2v2a2 2 0 01-2 2h-1A12 12 0 014.5 6V5z" {...p}/></>,
    key: <><circle cx="8" cy="14" r="3.5" {...p}/><path d="M11 13l9-9M16 8l2 2M18 6l2 2" {...p}/></>,
    bell: <><path d="M6 16V11a6 6 0 1112 0v5l2 2H4l2-2z" {...p}/><path d="M10 20a2 2 0 004 0" {...p}/></>,
    search: <><circle cx="11" cy="11" r="6" {...p}/><path d="M16 16l4 4" {...p}/></>,
    filter: <><path d="M3 5h18l-7 9v6l-4-2v-4L3 5z" {...p}/></>,
    check: <><path d="M5 12l5 5L20 6" {...p}/></>,
    arrowR: <><path d="M5 12h14M13 6l6 6-6 6" {...p}/></>,
    note: <><path d="M5 5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" {...p}/><path d="M14 3v5h5M8 12h8M8 16h5" {...p}/></>,
    close: <><path d="M6 6l12 12M6 18L18 6" {...p}/></>,
    trash: <><path d="M4 7h16M10 11v6M14 11v6M5 7l1 12h12l1-12M9 7V4h6v3" {...p}/></>,
    edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" {...p}/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" {...p}/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
      {paths[name] || null}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────
const ALL7 = ['yixuan','annie','yating','yiru','chenyu','hongsheng','guanjie'];

const MEMBERS = [
  { id: 'yixuan',    name: '苡璇', color: '#3F7B8A', short: '璇', budgetTWD: 60000 },
  { id: 'annie',     name: '安妮', color: '#C97A82', short: '妮', budgetTWD: 60000 },
  { id: 'yating',    name: '雅婷', color: '#9B7AB8', short: '婷', budgetTWD: 60000 },
  { id: 'yiru',      name: '苡如', color: '#5A8F6E', short: '如', budgetTWD: 60000 },
  { id: 'chenyu',    name: '承毓', color: '#D49152', short: '毓', budgetTWD: 60000 },
  { id: 'hongsheng', name: '宏昇', color: '#7A9BC9', short: '昇', budgetTWD: 60000 },
  { id: 'guanjie',   name: '冠杰', color: '#8A6E4E', short: '杰', budgetTWD: 60000 },
];

// Compute which trip day corresponds to today's date
function computeTodayIndex() {
  const tripDates = ['2026/12/29', '2026/12/30', '2026/12/31', '2027/01/01', '2027/01/02'];
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm   = String(now.getMonth() + 1).padStart(2, '0');
  const dd   = String(now.getDate()).padStart(2, '0');
  const today = `${yyyy}/${mm}/${dd}`;
  const idx = tripDates.indexOf(today);
  if (idx >= 0) return idx;
  // Before trip → Day 1; after trip → Day 5
  return now < new Date('2026-12-29') ? 0 : 4;
}

const TRIP = {
  name: '2026 韓國跨年旅行',
  start: '2026/12/29',
  end:   '2027/01/02',
  city:  '首爾',
  days:  5,
  todayIndex: computeTodayIndex(),
  rate: { TWD_KRW: 40 },
  budget: { totalTWD: 420000 },
};

const CATS = [
  { id: 'food',   label: '餐飲', icon: 'fork',   color: '#E89358', bg: '#FBE6D4' },
  { id: 'tx',     label: '交通', icon: 'subway', color: '#3F7B8A', bg: '#E1EBEE' },
  { id: 'stay',   label: '住宿', icon: 'bed',    color: '#9B7AB8', bg: '#EADFF1' },
  { id: 'shop',   label: '購物', icon: 'bag',    color: '#C97A82', bg: '#F3DCDF' },
  { id: 'ticket', label: '門票', icon: 'ticket', color: '#5A8F6E', bg: '#DDE9D9' },
  { id: 'other',  label: '其他', icon: 'note',   color: '#8A857A', bg: '#ECE5D5' },
];

const DAYS = [
  {
    idx: 0, date: '12/29', dow: '週一', label: 'Day 1', title: '出發 · 桃園機場',
    weather: { icon: 'sun', t: '18°C / 24°C', desc: '晴' },
    items: [],
  },
  {
    idx: 1, date: '12/30', dow: '週二', label: 'Day 2', title: '抵達 · 明洞',
    weather: { icon: 'cloud', t: '-2°C / 4°C', desc: '多雲' },
    items: [],
  },
  {
    idx: 2, date: '12/31', dow: '週三', label: 'Day 3', title: '古宮 · 弘大跨年',
    weather: { icon: 'snow', t: '-5°C / 1°C', desc: '小雪' },
    items: [],
  },
  {
    idx: 3, date: '01/01', dow: '週四', label: 'Day 4', title: '南山塔 · 購物',
    weather: { icon: 'sun', t: '-3°C / 3°C', desc: '晴' },
    items: [],
  },
  {
    idx: 4, date: '01/02', dow: '週五', label: 'Day 5', title: '回程',
    weather: { icon: 'cloud', t: '-1°C / 5°C', desc: '陰' },
    items: [],
  },
];

const STAYS = [];

// expense entries
const EXPENSES_INIT = [];

Object.assign(window, { T, Icon, ALL7, MEMBERS, TRIP, CATS, DAYS, STAYS, EXPENSES_INIT });
