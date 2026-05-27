// screen-itinerary.jsx — Itinerary 行程總覽 + Stay 住宿資訊

// ─────────────────────────────────────────────────────────────
// Duration helpers
// ─────────────────────────────────────────────────────────────
function parseDurMinutes(dur) {
  if (!dur) return 60;
  const n = parseInt(dur, 10);
  return isNaN(n) ? 60 : Math.max(0, n);
}
function formatDurLabel(totalMin) {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return m + ' min';
  if (m === 0) return h + ' h';
  return h + ' h ' + m + ' min';
}

// ─────────────────────────────────────────────────────────────
// ItineraryForm — 新增 / 編輯行程 overlay
// ─────────────────────────────────────────────────────────────
function ItineraryForm({ item, dayIdx, onSave, onDelete, onClose }) {
  const [selectedDay,   setSelectedDay]   = useState(item?.dayIdx ?? dayIdx);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [time,          setTime]          = useState(item?.time  || '09:00');
  const [durH,          setDurH]          = useState(() => Math.floor(parseDurMinutes(item?.dur) / 60));
  const [durM,          setDurM]          = useState(() => parseDurMinutes(item?.dur) % 60);
  const [type,          setType]          = useState(item?.type  || 'food');
  const [title,         setTitle]         = useState(item?.title || '');
  const [addr,          setAddr]          = useState(item?.addr   || '');
  const [mapUrl,        setMapUrl]        = useState(item?.mapUrl || '');
  const [note,          setNote]          = useState(item?.note   || '');
  const [participants,  setParticipants]  = useState(
    item?.participants || MEMBERS.map(m => m.id)
  );

  const toggleP = (id) =>
    setParticipants(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const canSave = title.trim().length > 0;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id:    item?.id || ('i' + Date.now()),
      dayIdx: selectedDay,
      time, dur: String(durH * 60 + durM) + ' min', type,
      title:  title.trim(),
      addr:   addr.trim(),
      mapUrl: mapUrl.trim(),
      note:   note.trim(),
      participants,
    });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      width: '100%', height: '100dvh',
      background: T.bg, zIndex: 9999,
      overflowY: 'auto', WebkitOverflowScrolling: 'touch',
      fontFamily: T.font, color: T.ink,
    }}>
      {/* header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10000,
        padding: 'calc(env(safe-area-inset-top, 0px) + 20px) 16px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: T.bg,
      }}>
        <button onClick={onClose} style={{
          border: '1px solid ' + T.divider, background: '#fff', cursor: 'pointer',
          width: 38, height: 38, borderRadius: 12, boxShadow: T.shadowSoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="close" size={20} color={T.ink2}/>
        </button>
        <div style={{ fontSize: 17, fontWeight: 700, color: T.ink }}>
          {item ? '編輯行程' : '新增行程'}
        </div>
        <button onClick={handleSave} disabled={!canSave} style={{
          border: 'none',
          background: canSave ? T.primary : T.surfaceTint,
          color:      canSave ? '#fff'    : T.ink4,
          cursor:     canSave ? 'pointer' : 'default',
          padding: '8px 16px', borderRadius: 20,
          fontFamily: T.font, fontSize: 14, fontWeight: 700,
        }}>儲存</button>
      </div>

      {/* body */}
      <div style={{ padding: '4px 16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 120px)', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* 基本資訊 */}
        <Card pad={0}>
          <FieldRow label="行程名稱" icon="note">
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="例：景福宮觀光"
              style={{ border:'none', outline:'none', background:'transparent',
                fontFamily: T.font, fontSize: 15, fontWeight: 600, color: T.ink,
                width: '100%', textAlign: 'right' }}/>
          </FieldRow>
          <Divider/>
          <FieldRow label="地址" icon="pin">
            <input value={addr} onChange={e => setAddr(e.target.value)}
              placeholder="地址或景點名稱"
              style={{ border:'none', outline:'none', background:'transparent',
                fontFamily: T.font, fontSize: 14, color: T.ink,
                width: '100%', textAlign: 'right' }}/>
          </FieldRow>
          <Divider/>
          <FieldRow label="地圖連結" icon="map">
            <input value={mapUrl} onChange={e => setMapUrl(e.target.value)}
              placeholder="Naver / KakaoMap / Google Maps"
              style={{ border:'none', outline:'none', background:'transparent',
                fontFamily: T.font, fontSize: 13, color: T.primary,
                width: '100%', textAlign: 'right' }}/>
          </FieldRow>
          <Divider/>
          <FieldRow label="行程日期" icon="today">
            <button onClick={() => setShowDayPicker(true)} style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: T.font, fontSize: 14, fontWeight: 600, color: T.primary,
              padding: 0, display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {DAYS[selectedDay].label}｜{DAYS[selectedDay].date}
            </button>
          </FieldRow>
          <Divider/>
          <FieldRow label="時間" icon="clock">
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              inputMode="numeric"
              style={{ border:'none', outline:'none', background:'transparent',
                fontFamily: T.font, fontSize: 14, fontWeight: 600, color: T.ink,
                width: 100, textAlign: 'right' }}/>
          </FieldRow>
          <Divider/>
          <FieldRow label="時長" icon="today">
            <div style={{ display:'flex', alignItems:'center', gap: 4 }}>
              <input
                type="number" inputMode="numeric" min="0" max="23"
                value={durH}
                onChange={e => setDurH(Math.max(0, parseInt(e.target.value) || 0))}
                style={{ border:'none', outline:'none', background:'transparent',
                  fontFamily: T.font, fontSize: 14, fontWeight: 600, color: T.ink,
                  width: 36, textAlign: 'right' }}/>
              <span style={{ fontSize: 13, color: T.ink3, fontWeight: 600 }}>h</span>
              <input
                type="number" inputMode="numeric" min="0" max="59"
                value={durM}
                onChange={e => setDurM(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                style={{ border:'none', outline:'none', background:'transparent',
                  fontFamily: T.font, fontSize: 14, fontWeight: 600, color: T.ink,
                  width: 36, textAlign: 'right' }}/>
              <span style={{ fontSize: 13, color: T.ink3, fontWeight: 600 }}>min</span>
            </div>
          </FieldRow>
        </Card>

        {/* 行程類型 */}
        <Card pad={14}>
          <FieldLabel>行程類型</FieldLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 10 }}>
            {CATS.map(c => {
              const on = type === c.id;
              return (
                <button key={c.id} onClick={() => setType(c.id)} style={{
                  border: on ? '2px solid ' + c.color : '1px solid ' + T.divider,
                  background: on ? c.bg : '#fff', cursor: 'pointer',
                  padding: '10px 8px', borderRadius: 14,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                }}>
                  <Icon name={c.icon} size={20} color={c.color} strokeWidth={1.9}/>
                  <span style={{ fontSize: 12, color: on ? c.color : T.ink2, fontWeight: 700 }}>{c.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* 參與成員 */}
        <Card pad={14}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 10 }}>
            <FieldLabel>參與成員</FieldLabel>
            <div style={{ display:'flex', gap: 8 }}>
              <button onClick={() => setParticipants(MEMBERS.map(m => m.id))} style={{
                border:'none', background:'transparent', cursor:'pointer',
                fontSize: 11, color: T.primary, fontWeight: 700, fontFamily: T.font,
              }}>全選</button>
              <button onClick={() => setParticipants([])} style={{
                border:'none', background:'transparent', cursor:'pointer',
                fontSize: 11, color: T.ink3, fontWeight: 700, fontFamily: T.font,
              }}>清除</button>
            </div>
          </div>
          <div style={{ display:'flex', gap: 8, flexWrap:'wrap' }}>
            {MEMBERS.map(m => {
              const on = participants.includes(m.id);
              return (
                <button key={m.id} onClick={() => toggleP(m.id)} style={{
                  border: 'none',
                  background: on ? m.color + '22' : T.bgSoft,
                  cursor: 'pointer', padding: '6px 10px 6px 6px',
                  borderRadius: 999, display:'flex', alignItems:'center', gap: 6,
                  fontFamily: T.font, fontSize: 13, fontWeight: 600,
                  color: on ? T.ink : T.ink3,
                }}>
                  <Avatar member={m} size={22}/>
                  <span>{m.name}</span>
                  {on && <Icon name="check" size={14} color={m.color} strokeWidth={2.5}/>}
                </button>
              );
            })}
          </div>
          {participants.length > 0 && (
            <div style={{ marginTop: 10, display:'flex', alignItems:'center', gap: 8 }}>
              <AvatarStack ids={participants} size={22} max={7}/>
              <span style={{ fontSize: 11, color: T.ink3 }}>{participants.length} 人參與</span>
            </div>
          )}
        </Card>

        {/* 備註 */}
        <Card pad={0}>
          <FieldRow label="備註" icon="note" align="top">
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="選填備註"
              rows={2}
              style={{ border:'none', outline:'none', background:'transparent',
                fontFamily: T.font, fontSize: 14, color: T.ink,
                width: '100%', resize:'none', textAlign:'right' }}/>
          </FieldRow>
        </Card>

        {/* 刪除 */}
        {onDelete && (
          <button onClick={onDelete} style={{
            width: '100%', padding: 14, borderRadius: 20, border: 'none',
            background: T.roseSoft, cursor: 'pointer',
            fontSize: 14, fontWeight: 600, color: T.rose, fontFamily: T.font,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Icon name="trash" size={16} color={T.rose} strokeWidth={2}/>
            刪除此行程
          </button>
        )}
      </div>

      {/* Day picker bottom sheet */}
      {showDayPicker && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.35)', zIndex: 100,
          display: 'flex', alignItems: 'flex-end',
        }} onClick={() => setShowDayPicker(false)}>
          <div style={{
            width: '100%', background: '#fff',
            borderRadius: '24px 24px 0 0',
            padding: '20px 16px 52px', boxSizing: 'border-box',
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              width: 36, height: 4, borderRadius: 2,
              background: T.divider, margin: '0 auto 16px',
            }}/>
            <div style={{
              fontSize: 15, fontWeight: 700, color: T.ink,
              marginBottom: 14, textAlign: 'center',
            }}>選擇行程日期</div>
            {DAYS.map(d => (
              <button key={d.idx}
                onClick={() => { setSelectedDay(d.idx); setShowDayPicker(false); }}
                style={{
                  width: '100%', padding: '14px 20px',
                  border: 'none',
                  background: selectedDay === d.idx ? T.primarySoft : 'transparent',
                  cursor: 'pointer', borderRadius: 14, marginBottom: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  fontFamily: T.font, boxSizing: 'border-box',
                }}>
                <span style={{
                  fontSize: 15, fontWeight: 700,
                  color: selectedDay === d.idx ? T.primary : T.ink,
                }}>
                  {d.label}
                </span>
                <span style={{ fontSize: 14, color: T.ink3 }}>
                  {d.dow}　{d.date}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Itinerary (行程總覽)
// ─────────────────────────────────────────────────────────────
function ScreenItinerary({ initialDay = TRIP.todayIndex, allItemsExt, onSaveItemExt, onDeleteItemExt, onOpenEditForm }) {
  const [active,       setActive]       = useState(initialDay);
  const [memberFilter, setMemberFilter] = useState('all');

  const [allItemsLocal, setAllItemsLocal] = useState(() => {
    const m = {};
    DAYS.forEach(d => { m[d.idx] = d.items.map(it => ({ ...it })); });
    return m;
  });

  const allItems = allItemsExt || allItemsLocal;
  const day   = DAYS[active];
  const items = allItems[active] || [];
  const isToday = active === TRIP.todayIndex;

  const filteredItems = memberFilter === 'all'
    ? items
    : items.filter(it => (it.participants || []).includes(memberFilter));

  const handleDelete = (itemId) => {
    if (onDeleteItemExt) {
      onDeleteItemExt(itemId, active);
    } else {
      setAllItemsLocal(prev => ({ ...prev, [active]: prev[active].filter(x => x.id !== itemId) }));
    }
  };

  const openAdd  = () => { if (onOpenEditForm) onOpenEditForm(null, active); };
  const openEdit = (it) => { if (onOpenEditForm) onOpenEditForm(it, active); };

  return (
    <>
      {/* day tabs */}
      <div style={{ paddingTop: 4 }}>
        <DayTabs active={active} onChange={i => { setActive(i); setMemberFilter('all'); }}/>
      </div>

      {/* day header */}
      <div style={{ padding: '0 20px 10px' }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.ink, letterSpacing: -0.3 }}>
                {day.title}
              </div>
              {isToday && <Pill bg={T.orange} color="#fff" size="s">今天</Pill>}
            </div>
            <div style={{ fontSize: 13, color: T.ink3, marginTop: 4 }}>
              {day.date} {day.dow} · {filteredItems.length} 個行程
            </div>
          </div>
          <div style={{ flexShrink: 0 }}><WeatherChip {...day.weather}/></div>
        </div>
      </div>

      {/* 成員篩選 chips */}
      <div style={{
        padding: '0 0 12px 16px', display: 'flex', gap: 6,
        overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
      }}>
        {[{ id: 'all', name: '全部' }, ...MEMBERS].map(m => {
          const on = memberFilter === m.id;
          return (
            <button key={m.id} onClick={() => setMemberFilter(m.id)} style={{
              flexShrink: 0, padding: '5px 12px', borderRadius: 999,
              border: on ? 'none' : '1px solid ' + T.divider,
              background: on ? T.primary : '#fff',
              color: on ? '#fff' : T.ink2,
              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: T.font,
            }}>{m.name}</button>
          );
        })}
        <div style={{ width: 20, flexShrink: 0 }}/>
      </div>

      {/* 行程卡片 */}
      <div style={{ padding: '0 20px', display:'flex', flexDirection:'column', gap: 10 }}>
        {filteredItems.map((it, i) => {
          const cat = findCat(it.type);
          return (
            <div key={it.id} style={{ display:'flex', gap: 10, position:'relative' }}>
              {/* time gutter */}
              <div style={{ width: 52, flexShrink: 0, paddingTop: 18, position:'relative' }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: T.ink, textAlign:'right',
                  fontVariantNumeric:'tabular-nums', letterSpacing:-0.3,
                }}>{it.time}</div>
                <div style={{ fontSize: 10, color: T.ink3, textAlign:'right', marginTop: 2 }}>{formatDurLabel(parseDurMinutes(it.dur))}</div>
                {i < filteredItems.length - 1 && (
                  <div style={{
                    position:'absolute', top: 60, bottom: -10, right: -6,
                    width: 2, background: T.divider,
                  }}/>
                )}
                <div style={{
                  position:'absolute', top: 24, right: -10,
                  width: 10, height: 10, borderRadius:'50%',
                  background: '#fff', border: '2px solid ' + cat.color,
                }}/>
              </div>

              {/* card */}
              <Card pad={0} style={{ flex: 1, overflow:'hidden' }}>
                <div style={{ padding: '14px 14px 10px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 6 }}>
                    <CatTile catId={it.type} size={26} radius={8}/>
                    <span style={{ fontSize: 10, color: cat.color, fontWeight: 700, letterSpacing: 0.6, textTransform:'uppercase' }}>
                      {cat.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 15.5, fontWeight: 700, color: T.ink, letterSpacing:-0.2, lineHeight: 1.3 }}>
                    {it.title}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap: 6, marginTop: 8, fontSize: 12.5, color: T.ink2 }}>
                    <Icon name="pin" size={13} color={T.ink3}/>
                    <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{it.addr}</span>
                  </div>

                  {it.participants && it.participants.length > 0 && (
                    <div style={{ display:'flex', alignItems:'center', gap: 7, marginTop: 10 }}>
                      <AvatarStack ids={it.participants} size={22} max={7}/>
                      <span style={{ fontSize: 11, color: T.ink3, fontWeight: 500 }}>
                        {it.participants.length === MEMBERS.length
                          ? '全員參與'
                          : it.participants.length + ' 人'}
                      </span>
                    </div>
                  )}

                  {it.note && (
                    <div style={{
                      fontSize: 12, color: T.ink2, marginTop: 8,
                      padding: '8px 12px', background: T.bgSoft, borderRadius: 12,
                      borderLeft: '3px solid ' + cat.color,
                    }}>{it.note}</div>
                  )}
                </div>

                {/* footer */}
                <div style={{ display:'flex', borderTop: '1px solid ' + T.divider }}>
                  <button onClick={() => {
                    const url = it.mapUrl
                      ? it.mapUrl
                      : it.addr
                        ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(it.addr)
                        : null;
                    if (url) window.open(url, '_blank');
                  }} style={{
                    flex: 1, padding: '11px 12px', border:'none', background:'transparent',
                    cursor: (it.mapUrl || it.addr) ? 'pointer' : 'default',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    gap: 6, fontSize: 13, fontWeight: 600,
                    color: (it.mapUrl || it.addr) ? T.primary : T.ink4, fontFamily: T.font,
                  }}>
                    <Icon name="map" size={16} color={(it.mapUrl || it.addr) ? T.primary : T.ink4} strokeWidth={2}/>
                    地圖導航
                  </button>
                  <div style={{ width: 1, background: T.divider }}/>
                  <button onClick={() => openEdit(it)} style={{
                    width: 52, border:'none', background:'transparent',
                    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <Icon name="edit" size={17} color={T.ink3} strokeWidth={1.8}/>
                  </button>
                  <div style={{ width: 1, background: T.divider }}/>
                  <button onClick={() => handleDelete(it.id)} style={{
                    width: 52, border:'none', background:'transparent',
                    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <Icon name="trash" size={17} color={T.rose} strokeWidth={1.8}/>
                  </button>
                </div>
              </Card>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <Card pad={28} style={{ textAlign:'center' }}>
            <div style={{ fontSize: 13, color: T.ink3 }}>
              {memberFilter === 'all'
                ? '此天尚無行程'
                : (MEMBERS.find(m => m.id === memberFilter)?.name ?? '') + ' 當天沒有行程'}
            </div>
          </Card>
        )}

        <button onClick={openAdd} style={{
          width: '100%', padding: '13px 16px', borderRadius: 20,
          border: '2px dashed ' + T.divider, background: 'transparent',
          cursor: 'pointer', fontSize: 14, fontWeight: 600, color: T.ink3,
          fontFamily: T.font, display:'flex', alignItems:'center', justifyContent:'center', gap: 8,
        }}>
          <Icon name="plus" size={18} color={T.ink3}/>
          新增行程
        </button>
      </div>

      <div style={{ height: 24 }}/>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Stay helpers
// ─────────────────────────────────────────────────────────────
const stayInputStyle = {
  border: 'none', outline: 'none', background: 'transparent',
  fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#2A2A2A',
  width: '100%', textAlign: 'right',
};

function StayFieldCard({ children }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 18, overflow: 'hidden',
      boxShadow: T.shadowCard, border: '1px solid rgba(236,229,213,0.6)',
    }}>
      {children}
    </div>
  );
}

function StayRow({ label, icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px' }}>
      <Icon name={icon} size={18} color={T.ink3}/>
      <span style={{ fontSize: 13, color: T.ink2, fontWeight: 600, flexShrink: 0, minWidth: 68 }}>
        {label}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

function StayDivider() {
  return <div style={{ height: 1, background: T.divider, marginLeft: 44 }}/>;
}

// ─────────────────────────────────────────────────────────────
// StayDayPicker — 日期選擇 bottom sheet（住宿用）
// ─────────────────────────────────────────────────────────────
function StayDayPicker({ current, onSelect, onClose }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.35)', zIndex: 200,
      display: 'flex', alignItems: 'flex-end',
    }} onClick={onClose}>
      <div style={{
        width: '100%', background: '#fff',
        borderRadius: '24px 24px 0 0',
        padding: '20px 16px 52px', boxSizing: 'border-box',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: T.divider, margin: '0 auto 16px' }}/>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 14, textAlign: 'center' }}>
          選擇日期
        </div>
        {DAYS.map(d => (
          <button key={d.idx} onClick={() => { onSelect(d.idx); onClose(); }} style={{
            width: '100%', padding: '14px 20px', border: 'none',
            background: current === d.idx ? T.primarySoft : 'transparent',
            cursor: 'pointer', borderRadius: 14, marginBottom: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontFamily: T.font, boxSizing: 'border-box',
          }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: current === d.idx ? T.primary : T.ink }}>
              {d.label}
            </span>
            <span style={{ fontSize: 14, color: T.ink3 }}>{d.dow}　{d.date}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// StayForm — 新增 / 編輯住宿 overlay
// ─────────────────────────────────────────────────────────────
function StayForm({ stay, onClose, onSave, onDelete }) {
  // 解析舊格式資料（backward compat）
  const parseDay = (str) => {
    if (str == null) return TRIP.todayIndex;
    if (typeof str === 'number') return Math.max(0, Math.min(DAYS.length - 1, str));
    for (let i = 0; i < DAYS.length; i++) {
      if (String(str).includes(DAYS[i].date)) return i;
    }
    return TRIP.todayIndex;
  };
  const parseTime = (str) => {
    if (!str) return '';
    const m = String(str).match(/(\d{1,2}:\d{2})/);
    return m ? m[1] : '';
  };

  const [name,         setName]         = useState(stay?.name      || '');
  const [checkInDay,   setCheckInDay]   = useState(() => stay?.checkInDay  != null ? stay.checkInDay  : parseDay(stay?.checkIn));
  const [checkInTime,  setCheckInTime]  = useState(() => stay?.checkInTime || parseTime(stay?.checkIn)  || '');
  const [checkOutDay,  setCheckOutDay]  = useState(() => stay?.checkOutDay != null ? stay.checkOutDay : parseDay(stay?.checkOut));
  const [checkOutTime, setCheckOutTime] = useState(() => stay?.checkOutTime || parseTime(stay?.checkOut) || '');
  const [addr,         setAddr]         = useState(stay?.addr      || '');
  const [mapUrl,       setMapUrl]       = useState(stay?.mapUrl    || stay?.mapsUrl || '');
  const [phone,        setPhone]        = useState(stay?.phone     || '');
  const [code,         setCode]         = useState(stay?.code      || '');
  const [breakfast,    setBreakfast]    = useState(stay?.breakfast || '');
  const [notes,        setNotes]        = useState(stay?.notes     || '');
  const [confirmDel,   setConfirmDel]   = useState(false);
  const [showInPicker, setShowInPicker]   = useState(false);
  const [showOutPicker, setShowOutPicker] = useState(false);

  const autoNights = checkOutDay > checkInDay ? checkOutDay - checkInDay : 0;

  const fmtDay = (dayIdx, time) => {
    const d = DAYS[dayIdx];
    const dow = d.dow.replace('週', '');
    return d.date + '（' + dow + '）' + (time ? '  ' + time : '');
  };

  const handleSave = () => {
    onSave({
      id:           stay?.id || ('st' + Date.now()),
      name:         name.trim() || '未命名住宿',
      checkInDay,   checkInTime,
      checkOutDay,  checkOutTime,
      checkIn:      fmtDay(checkInDay, checkInTime),
      checkOut:     fmtDay(checkOutDay, checkOutTime),
      nights:       autoNights,
      addr:         addr.trim(),
      mapUrl:       mapUrl.trim(),
      mapsUrl:      mapUrl.trim(),   // backward compat
      phone:        phone.trim(),
      code:         code.trim(),
      breakfast:    breakfast.trim(),
      notes:        notes.trim(),
    });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      maxWidth: 430, margin: '0 auto',
      background: T.bg, zIndex: 100,
      display: 'flex', flexDirection: 'column',
      fontFamily: T.font, color: T.ink,
    }}>
      {/* header */}
      <div style={{
        padding: 'calc(env(safe-area-inset-top, 0px) + 20px) 16px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: T.bg,
      }}>
        <button onClick={onClose} style={{
          border: '1px solid ' + T.divider, background: '#fff', cursor: 'pointer',
          width: 38, height: 38, borderRadius: 12, boxShadow: T.shadowSoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="close" size={20} color={T.ink2}/>
        </button>
        <div style={{ fontSize: 17, fontWeight: 700, color: T.ink, letterSpacing: -0.2 }}>
          {stay ? '編輯住宿' : '新增住宿'}
        </div>
        <button onClick={handleSave} style={{
          border: 'none', background: T.primary, color: '#fff',
          cursor: 'pointer', padding: '8px 16px', borderRadius: 20,
          fontFamily: T.font, fontSize: 14, fontWeight: 700,
        }}>儲存</button>
      </div>

      {/* body */}
      <div style={{ flex: 1, overflow: 'auto', padding: '4px 16px 40px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* 基本資訊 */}
        <StayFieldCard>
          <StayRow label="住宿名稱" icon="bed">
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="飯店 / 民宿名稱" style={stayInputStyle}/>
          </StayRow>
          <StayDivider/>
          <StayRow label="入住日期" icon="calendar">
            <button onClick={() => setShowInPicker(true)} style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: T.font, fontSize: 14, fontWeight: 600, color: T.primary, padding: 0,
            }}>
              {DAYS[checkInDay].date}（{DAYS[checkInDay].dow.replace('週','')}）
            </button>
          </StayRow>
          <StayDivider/>
          <StayRow label="入住時間" icon="clock">
            <input type="time" value={checkInTime} onChange={e => setCheckInTime(e.target.value)}
              style={{ ...stayInputStyle, width: 110 }}/>
          </StayRow>
          <StayDivider/>
          <StayRow label="退房日期" icon="calendar">
            <button onClick={() => setShowOutPicker(true)} style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: T.font, fontSize: 14, fontWeight: 600, color: T.primary, padding: 0,
            }}>
              {DAYS[checkOutDay].date}（{DAYS[checkOutDay].dow.replace('週','')}）
            </button>
          </StayRow>
          <StayDivider/>
          <StayRow label="退房時間" icon="clock">
            <input type="time" value={checkOutTime} onChange={e => setCheckOutTime(e.target.value)}
              style={{ ...stayInputStyle, width: 110 }}/>
          </StayRow>
          <StayDivider/>
          <StayRow label="晚數" icon="moon">
            <span style={{ ...stayInputStyle, color: T.ink2, display: 'block' }}>
              {autoNights > 0 ? autoNights + ' 晚' : '—'}
            </span>
          </StayRow>
        </StayFieldCard>

        {/* 地點 */}
        <StayFieldCard>
          <StayRow label="地址" icon="pin">
            <input value={addr} onChange={e => setAddr(e.target.value)}
              placeholder="飯店地址" style={stayInputStyle}/>
          </StayRow>
          <StayDivider/>
          <StayRow label="地圖連結" icon="map">
            <input value={mapUrl} onChange={e => setMapUrl(e.target.value)}
              placeholder="Naver / KakaoMap / Google Maps" style={stayInputStyle}/>
          </StayRow>
          <StayDivider/>
          <StayRow label="電話" icon="phone">
            <input value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+82-2-xxx-xxxx" style={stayInputStyle}/>
          </StayRow>
        </StayFieldCard>

        {/* 訂房資訊 */}
        <StayFieldCard>
          <StayRow label="訂房代碼" icon="ticket">
            <input value={code} onChange={e => setCode(e.target.value)}
              placeholder="訂房代碼 / 備註" style={stayInputStyle}/>
          </StayRow>
          <StayDivider/>
          <StayRow label="早餐" icon="coffee">
            <input value={breakfast} onChange={e => setBreakfast(e.target.value)}
              placeholder="含早餐 / 不含" style={stayInputStyle}/>
          </StayRow>
        </StayFieldCard>

        {/* 備註 */}
        <StayFieldCard>
          <StayRow label="備註" icon="note">
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="選填備註" rows={2}
              style={{ ...stayInputStyle, resize: 'none', lineHeight: 1.5 }}/>
          </StayRow>
        </StayFieldCard>

        {/* 刪除 */}
        {onDelete && !confirmDel && (
          <button onClick={() => setConfirmDel(true)} style={{
            width: '100%', padding: 14, borderRadius: 20, border: 'none',
            background: T.roseSoft, cursor: 'pointer',
            fontSize: 14, fontWeight: 600, color: T.rose, fontFamily: T.font,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Icon name="trash" size={16} color={T.rose} strokeWidth={2}/>
            刪除此住宿
          </button>
        )}

        {confirmDel && (
          <div style={{ background: T.roseSoft, borderRadius: 18, padding: '16px' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, textAlign: 'center', marginBottom: 12 }}>
              確定要刪除此住宿嗎？
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmDel(false)} style={{
                flex: 1, padding: '11px 0', borderRadius: 16,
                border: '1px solid ' + T.divider, background: '#fff',
                fontSize: 14, fontWeight: 600, color: T.ink, cursor: 'pointer', fontFamily: T.font,
              }}>取消</button>
              <button onClick={() => onDelete(stay.id)} style={{
                flex: 1, padding: '11px 0', borderRadius: 16,
                border: 'none', background: T.rose,
                fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: T.font,
              }}>確認刪除</button>
            </div>
          </div>
        )}
      </div>

      {showInPicker && (
        <StayDayPicker current={checkInDay} onSelect={setCheckInDay} onClose={() => setShowInPicker(false)}/>
      )}
      {showOutPicker && (
        <StayDayPicker current={checkOutDay} onSelect={setCheckOutDay} onClose={() => setShowOutPicker(false)}/>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ScreenStay — 住宿資訊頁
// ─────────────────────────────────────────────────────────────
function ScreenStay({ stays, onEditStay, onDeleteStay }) {
  const tonight = stays.find(s =>
    s.covers && s.covers.includes(TRIP.todayIndex)
  );

  return (
    <>
      {/* 今晚住宿 banner */}
      {tonight && (
        <div style={{ padding: '4px 16px 12px' }}>
          <div style={{
            padding: '12px 16px', borderRadius: 18,
            background: 'linear-gradient(135deg, ' + T.primary + '18 0%, ' + T.primary + '08 100%)',
            border: '1.5px solid ' + T.primary + '33',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Icon name="moon" size={18} color={T.primary}/>
            <div>
              <div style={{ fontSize: 11, color: T.primary, fontWeight: 700, letterSpacing: 0.6 }}>
                今晚住宿
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, marginTop: 2 }}>
                {tonight.name}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 住宿清單 */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {stays.map(s => (
          <StayCard key={s.id} stay={s} onEdit={() => onEditStay(s)} onDelete={() => onDeleteStay(s.id)}/>
        ))}

        {stays.length === 0 && (
          <Card pad={32} style={{ textAlign: 'center' }}>
            <Icon name="bed" size={32} color={T.ink4} strokeWidth={1.4}/>
            <div style={{ fontSize: 13, color: T.ink3, marginTop: 10 }}>尚未新增住宿</div>
          </Card>
        )}
      </div>

      <div style={{ height: 24 }}/>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// StayCard — 住宿卡片
// ─────────────────────────────────────────────────────────────
function StayCard({ stay, onEdit, onDelete }) {
  const [confirmDel, setConfirmDel] = useState(false);

  const mapTarget = (stay.mapUrl || stay.mapsUrl)
    ? (stay.mapUrl || stay.mapsUrl)
    : stay.addr
      ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(stay.addr)
    : null;

  return (
    <Card pad={0}>
      {/* hero */}
      <div style={{ padding: '16px 16px 14px' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.ink, letterSpacing: -0.2 }}>
          {stay.name}
        </div>
        {stay.checkIn && (
          <div style={{ fontSize: 12, color: T.ink3, marginTop: 5, lineHeight: 1.5 }}>
            {stay.checkIn}
            {stay.checkOut && (' → ' + stay.checkOut)}
          </div>
        )}
        {stay.nights > 0 && (
          <div style={{ marginTop: 8 }}>
            <Pill size="s">{stay.nights} 晚</Pill>
          </div>
        )}
      </div>

      <div style={{ height: 1, background: T.divider }}/>

      {/* details */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {stay.addr && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <Icon name="pin" size={15} color={T.ink3}/>
            <span style={{ fontSize: 13, color: T.ink2, lineHeight: 1.4, flex: 1 }}>{stay.addr}</span>
          </div>
        )}

        {stay.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="phone" size={14} color={T.ink3}/>
            <span style={{ fontSize: 13, color: T.ink2 }}>{stay.phone}</span>
          </div>
        )}

        {stay.code && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="ticket" size={15} color={T.ink3}/>
            <span style={{ fontSize: 13, color: T.ink2 }}>{stay.code}</span>
          </div>
        )}

        {stay.breakfast && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="coffee" size={15} color={T.ink3}/>
            <span style={{ fontSize: 13, color: T.ink2 }}>{stay.breakfast}</span>
          </div>
        )}

        {stay.notes && (
          <div style={{
            background: T.yellowSoft, borderRadius: 12, padding: '10px 12px',
            fontSize: 13, color: T.ink2, lineHeight: 1.5,
          }}>
            {stay.notes}
          </div>
        )}
      </div>

      {/* footer — 地圖導航 / 編輯 / 刪除 */}
      {!confirmDel && (
        <div style={{ display: 'flex', borderTop: '1px solid ' + T.divider }}>
          <button onClick={() => { if (mapTarget) window.open(mapTarget, '_blank'); }} style={{
            flex: 1, padding: '11px 12px', border: 'none', background: 'transparent',
            cursor: mapTarget ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 6, fontSize: 13, fontWeight: 600,
            color: mapTarget ? T.primary : T.ink4, fontFamily: T.font,
          }}>
            <Icon name="map" size={16} color={mapTarget ? T.primary : T.ink4} strokeWidth={2}/>
            地圖導航
          </button>
          <div style={{ width: 1, background: T.divider }}/>
          <button onClick={onEdit} style={{
            width: 52, border: 'none', background: 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="edit" size={17} color={T.ink3} strokeWidth={1.8}/>
          </button>
          <div style={{ width: 1, background: T.divider }}/>
          <button onClick={() => setConfirmDel(true)} style={{
            width: 52, border: 'none', background: 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="trash" size={17} color={T.rose} strokeWidth={1.8}/>
          </button>
        </div>
      )}

      {/* 確認刪除 */}
      {confirmDel && (
        <div style={{ borderTop: '1px solid ' + T.divider, padding: '14px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.ink, textAlign: 'center', marginBottom: 10 }}>
            確定要刪除這筆住宿嗎？
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setConfirmDel(false)} style={{
              flex: 1, padding: '10px 0', borderRadius: 14,
              border: '1px solid ' + T.divider, background: '#fff',
              fontSize: 13, fontWeight: 600, color: T.ink, cursor: 'pointer', fontFamily: T.font,
            }}>取消</button>
            <button onClick={() => { onDelete && onDelete(); }} style={{
              flex: 1, padding: '10px 0', borderRadius: 14,
              border: 'none', background: T.rose,
              fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: T.font,
            }}>確認刪除</button>
          </div>
        </div>
      )}
    </Card>
  );
}

Object.assign(window, { ScreenItinerary, ItineraryForm, ScreenStay, StayForm });
