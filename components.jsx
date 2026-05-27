// components.jsx — shared app components

const { useState, useMemo, useEffect, useRef } = React;

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const fmtKRW  = (n) => '₩ ' + n.toLocaleString('en-US');
const fmtTWD  = (n) => 'NT$ ' + Math.round(n).toLocaleString('en-US');
const krwToTwd = (k) => k / TRIP.rate.TWD_KRW;
const findCat = (id) => CATS.find(c => c.id === id) || CATS[5];
const findMember = (id) => MEMBERS.find(m => m.id === id) || MEMBERS[0];

// ─────────────────────────────────────────────────────────────
// AppShell — scrollable area, fills the app container
// ─────────────────────────────────────────────────────────────
function AppShell({ children, bg = T.bg, padTop = 'calc(env(safe-area-inset-top, 0px) + 96px)', padBot = 110, scrollRef }) {
  return (
    <div
      ref={scrollRef}
      style={{
        position: 'absolute', inset: 0, overflow: 'auto',
        background: bg, paddingTop: padTop, paddingBottom: padBot,
        fontFamily: T.font, color: T.ink,
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TopBar — translucent header, respects device safe area
// ─────────────────────────────────────────────────────────────
function TopBar({ title, sub, action, dark = false, transparent = false }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 8,
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 20px)', paddingBottom: 8,
      background: transparent ? 'transparent'
        : 'linear-gradient(180deg, rgba(246,241,230,0.96) 60%, rgba(246,241,230,0))',
      backdropFilter: transparent ? 'none' : 'blur(6px)',
    }}>
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'8px 20px 4px',
      }}>
        <div style={{ display:'flex', flexDirection:'column', gap: 2 }}>
          {sub && (
            <div style={{ fontSize: 12, color: T.ink3, letterSpacing: 1, fontWeight: 500 }}>
              {sub}
            </div>
          )}
          <div style={{
            fontSize: 22, fontWeight: 700, color: dark ? '#fff' : T.ink,
            letterSpacing: -0.2,
          }}>{title}</div>
        </div>
        {action}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BottomNav — pinned tab bar, respects device safe area
// ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'home',      label: '首頁', icon: 'home'   },
  { id: 'today',     label: '今日', icon: 'today'  },
  { id: 'itinerary', label: '行程', icon: 'route'  },
  { id: 'expense',   label: '消費', icon: 'wallet' },
  { id: 'stay',      label: '住宿', icon: 'bed'    },
];

function BottomNav({ active, onChange }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 30,
      padding: '8px 8px calc(env(safe-area-inset-bottom, 0px) + 8px)',
      background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.96) 30%)',
      pointerEvents: 'none',
    }}>
      <div style={{
        margin: '0 auto', maxWidth: 360, pointerEvents: 'auto',
        background: '#fff', borderRadius: 24,
        boxShadow: '0 6px 22px rgba(74,60,32,0.10), 0 1px 0 rgba(0,0,0,0.02)',
        border: '1px solid ' + T.divider,
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '8px 6px',
      }}>
        {NAV_ITEMS.map(item => {
          const on = item.id === active;
          return (
            <button key={item.id} onClick={() => onChange(item.id)} style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 2, padding: '6px 10px', borderRadius: 16,
              color: on ? T.primary : T.ink3, minWidth: 56,
              transition: 'color .15s',
            }}>
              <div style={{
                background: on ? T.primarySoft : 'transparent',
                borderRadius: 12, padding: '4px 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background .15s',
              }}>
                <Icon name={item.icon} size={22} color={on ? T.primary : T.ink3} strokeWidth={on ? 2 : 1.7}/>
              </div>
              <span style={{
                fontSize: 11, fontWeight: on ? 600 : 500, letterSpacing: 0.2,
              }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FAB — floating action button, respects device safe area
// ─────────────────────────────────────────────────────────────
function FAB({ onClick, label = '記一筆' }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', right: 18,
      bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
      zIndex: 25,
      height: 52, padding: '0 20px 0 16px', borderRadius: 26,
      border: 'none', background: T.primary, color: '#fff',
      display: 'flex', alignItems: 'center', gap: 8,
      fontFamily: T.font, fontSize: 15, fontWeight: 600,
      boxShadow: T.shadowFab, cursor: 'pointer',
      letterSpacing: 0.4,
    }}>
      <Icon name="plus" size={20} color="#fff" strokeWidth={2.2}/>
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Card
// ─────────────────────────────────────────────────────────────
function Card({ children, style = {}, onClick, pad = 16 }) {
  return (
    <div onClick={onClick} style={{
      background: T.card, borderRadius: 20, padding: pad,
      boxShadow: T.shadowCard, border: '1px solid rgba(236,229,213,0.6)',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}>{children}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// Section header (small grey label + optional right action)
// ─────────────────────────────────────────────────────────────
function SectionHeader({ title, action, style = {} }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 20px 8px', ...style,
    }}>
      <div style={{
        fontSize: 13, color: T.ink3, fontWeight: 600, letterSpacing: 0.6,
      }}>{title}</div>
      {action}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Member avatar (initial in colored circle)
// ─────────────────────────────────────────────────────────────
function Avatar({ member, size = 28, ring = false }) {
  const m = typeof member === 'string' ? findMember(member) : member;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: m.color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.45, fontWeight: 600, flexShrink: 0,
      boxShadow: ring ? '0 0 0 2px #fff, 0 0 0 3.5px ' + m.color : 'none',
      letterSpacing: 0,
    }}>{m.short}</div>
  );
}

function AvatarStack({ ids, size = 24, max = 5 }) {
  const list = ids.slice(0, max);
  return (
    <div style={{ display: 'flex' }}>
      {list.map((id, i) => (
        <div key={id} style={{ marginLeft: i === 0 ? 0 : -8 }}>
          <Avatar member={id} size={size} ring/>
        </div>
      ))}
      {ids.length > max && (
        <div style={{
          marginLeft: -8,
          width: size, height: size, borderRadius: '50%',
          background: '#fff', color: T.ink3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 600,
          boxShadow: '0 0 0 2px #fff, 0 0 0 3.5px ' + T.divider,
        }}>+{ids.length - max}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Pill (small tag/chip)
// ─────────────────────────────────────────────────────────────
function Pill({ children, color = T.ink2, bg = T.surfaceTint, icon, size = 'm', style = {} }) {
  const fz = size === 's' ? 11 : 12;
  const py = size === 's' ? 3 : 5;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: `${py}px 10px`, borderRadius: 999,
      background: bg, color, fontSize: fz, fontWeight: 600,
      lineHeight: 1, whiteSpace: 'nowrap', ...style,
    }}>
      {icon && <Icon name={icon} size={fz + 2} color={color} strokeWidth={2}/>}
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Category icon tile (rounded square with cat icon)
// ─────────────────────────────────────────────────────────────
function CatTile({ catId, size = 38, radius = 12 }) {
  const c = findCat(catId);
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: c.bg, color: c.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon name={c.icon} size={size * 0.55} color={c.color} strokeWidth={1.9}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Money — large number with currency
// ─────────────────────────────────────────────────────────────
function Money({ krw, twd, currency = 'TWD', size = 'm', muted = false }) {
  const sz = { s: 14, m: 18, l: 24, xl: 32 }[size];
  const value = currency === 'TWD'
    ? (twd != null ? twd : krwToTwd(krw))
    : (krw != null ? krw : twd * TRIP.rate.TWD_KRW);
  const text = currency === 'TWD' ? fmtTWD(value) : fmtKRW(value);
  return (
    <span style={{
      fontSize: sz, fontWeight: 700, color: muted ? T.ink2 : T.ink,
      letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums',
    }}>
      {text}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Button
// ─────────────────────────────────────────────────────────────
function Btn({ children, onClick, variant = 'primary', icon, size = 'm', style = {}, full }) {
  const variants = {
    primary:  { bg: T.primary, color: '#fff', border: 'none' },
    soft:     { bg: T.primarySoft, color: T.primary, border: 'none' },
    ghost:    { bg: 'transparent', color: T.primary, border: '1.5px solid ' + T.primary },
    neutral:  { bg: '#F5F0E4', color: T.ink, border: 'none' },
    warm:     { bg: T.orange, color: '#fff', border: 'none' },
  };
  const v = variants[variant];
  const sizes = { s:{h:32,fz:13,px:14}, m:{h:40,fz:14,px:18}, l:{h:50,fz:16,px:22} }[size];
  return (
    <button onClick={onClick} style={{
      height: sizes.h, padding: `0 ${sizes.px}px`,
      borderRadius: sizes.h / 2, border: v.border, background: v.bg, color: v.color,
      fontFamily: T.font, fontSize: sizes.fz, fontWeight: 600, letterSpacing: 0.2,
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
      width: full ? '100%' : undefined, justifyContent: 'center',
      whiteSpace: 'nowrap', flexShrink: 0,
      ...style,
    }}>
      {icon && <Icon name={icon} size={sizes.fz + 4} color={v.color} strokeWidth={2}/>}
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Day tabs (used by Itinerary)
// ─────────────────────────────────────────────────────────────
function DayTabs({ active, onChange }) {
  return (
    <div style={{
      display:'flex', gap:8, padding:'0 0 12px 16px', overflowX:'auto',
      scrollbarWidth:'none',
    }}>
      {DAYS.map(d => {
        const on = d.idx === active;
        return (
          <button key={d.idx} onClick={() => onChange(d.idx)} style={{
            flexShrink: 0, border:'none', cursor:'pointer',
            background: on ? T.primary : '#fff',
            color: on ? '#fff' : T.ink2,
            padding: '10px 14px', borderRadius: 16,
            boxShadow: on ? 'none' : T.shadowSoft,
            border: on ? 'none' : '1px solid ' + T.divider,
            display:'flex', flexDirection:'column', alignItems:'center', gap:2,
            minWidth: 64,
          }}>
            <span style={{
              fontSize: 11, fontWeight: 600, opacity: on ? 0.85 : 0.6,
              letterSpacing: 0.5,
            }}>{d.label}</span>
            <span style={{
              fontSize: 15, fontWeight: 700, fontFamily: T.font,
              letterSpacing: -0.2,
            }}>{d.date}</span>
          </button>
        );
      })}
      <div style={{ width: 20, flexShrink: 0 }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Weather chip
// ─────────────────────────────────────────────────────────────
function WeatherChip({ icon, t, desc }) {
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:8,
      padding:'6px 12px 6px 10px', borderRadius: 999,
      background: 'rgba(255,255,255,0.7)', border:'1px solid ' + T.divider,
    }}>
      <Icon name={icon} size={18} color={T.primary}/>
      <span style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{t}</span>
      <span style={{ fontSize: 12, color: T.ink3 }}>{desc}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Expose
// ─────────────────────────────────────────────────────────────
Object.assign(window, {
  AppShell, TopBar, BottomNav, NAV_ITEMS, FAB,
  Card, SectionHeader, Avatar, AvatarStack, Pill, CatTile, Money, Btn,
  DayTabs, WeatherChip,
  fmtKRW, fmtTWD, krwToTwd, findCat, findMember,
});
