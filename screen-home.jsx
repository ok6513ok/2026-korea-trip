// screen-home.jsx — Dashboard 首頁 + Today 今日行程

// ─────────────────────────────────────────────────────────────
// Dashboard (首頁)
// ─────────────────────────────────────────────────────────────
function ScreenDashboard({ expenses, memberBudgets = {}, onNav, onAddExpense, todayItems = [] }) {
  const todayDay = DAYS[TRIP.todayIndex];
  const nextItem = todayItems[0] || null;   // first item of today = "next up"
  const stay = STAYS[0];

  // spend totals — same logic as Expense 頁「全部」視角
  const totalKRW  = expenses.reduce((s, e) => s + e.krw, 0);
  const totalTWD  = krwToTwd(totalKRW);
  const budgetTWD = MEMBERS.reduce((s, m) => s + ((memberBudgets[m.id]) || 50000), 0);
  const pct = budgetTWD > 0 ? Math.min(100, (totalTWD / budgetTWD) * 100) : 0;
  const remainingTWD = budgetTWD - totalTWD;

  return (
    <>
      {/* HERO — trip status */}
      <div style={{
        margin: '8px 16px 16px', borderRadius: 28, padding: '22px 22px 20px',
        background: `linear-gradient(140deg, ${T.primary} 0%, ${T.primaryDark} 100%)`,
        color: '#fff', position: 'relative', overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(63,123,138,0.25)',
      }}>
        {/* decorative circles */}
        <div style={{
          position:'absolute', top:-40, right:-40, width:160, height:160,
          borderRadius:'50%', background:'rgba(255,255,255,0.06)',
        }}/>
        <div style={{
          position:'absolute', bottom:-50, right:30, width:120, height:120,
          borderRadius:'50%', background:'rgba(255,255,255,0.04)',
        }}/>

        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom: 10 }}>
          <span style={{
            display:'inline-flex', alignItems:'center', gap:6,
            padding:'4px 10px', background:'rgba(255,255,255,0.18)',
            borderRadius:999, fontSize: 11, fontWeight:600, letterSpacing: 0.5,
          }}>
            <span style={{
              width:6, height:6, borderRadius:'50%', background:'#7DDB9A',
              boxShadow:'0 0 0 3px rgba(125,219,154,0.3)',
            }}/>
            旅行中 · Day {todayDay.idx + 1} / {TRIP.days}
          </span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.25, letterSpacing: -0.2 }}>
          {TRIP.name}
        </div>
        <div style={{ fontSize: 13, opacity: 0.78, marginTop: 6, letterSpacing: 0.3 }}>
          {TRIP.start} – {TRIP.end} · 首爾 {MEMBERS.length} 人同行
        </div>

        {/* member dots */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          marginTop: 18, paddingTop: 14,
          borderTop:'1px solid rgba(255,255,255,0.15)',
        }}>
          <AvatarStack ids={MEMBERS.map(m=>m.id)} size={28} max={5}/>
          <div style={{ display:'flex', alignItems:'center', gap:4, fontSize: 12, opacity:0.85 }}>
            <Icon name="pin" size={14} color="#fff"/>
            <span>明洞 L7 飯店</span>
          </div>
        </div>
      </div>

      {/* TODAY summary */}
      <SectionHeader title="今日行程" action={
        <button onClick={()=>onNav('today')} style={{
          border:'none', background:'transparent', cursor:'pointer',
          color: T.primary, fontWeight:600, fontSize:12,
          display:'inline-flex', alignItems:'center', gap:2,
        }}>查看全部 <Icon name="chevR" size={14}/></button>
      }/>
      <div style={{ padding: '0 16px' }}>
        <Card pad={0}>
          {/* "Next up" pinned row — only when items exist */}
          {nextItem && (
            <div style={{
              padding: '14px 16px', borderBottom: '1px solid ' + T.divider,
              display:'flex', alignItems:'center', gap: 12,
              background: T.yellowSoft + '88',
              borderTopLeftRadius: 20, borderTopRightRadius: 20,
            }}>
              <div style={{
                width: 44, textAlign:'center',
                padding: '6px 0', borderRadius: 10,
                background: '#fff', border: '1px solid ' + T.divider,
              }}>
                <div style={{ fontSize: 10, color: T.ink3, fontWeight:600, letterSpacing:0.5 }}>下一站</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, letterSpacing: -0.3 }}>
                  {nextItem.time}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 15, fontWeight: 600, color: T.ink,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                }}>{nextItem.title}</div>
                <div style={{ fontSize: 12, color: T.ink3, marginTop: 2 }}>
                  {nextItem.addr || nextItem.note || ''}
                </div>
              </div>
              <button style={{
                border:'none', background: T.primary, color:'#fff',
                width: 38, height: 38, borderRadius: 12, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <Icon name="map" size={18} color="#fff" strokeWidth={2}/>
              </button>
            </div>
          )}

          {/* mini timeline — up to 4 items from shared state */}
          {todayItems.length > 0 ? (
            <div style={{ padding: '10px 16px 14px' }}>
              {todayItems.slice(0, 4).map((it) => (
                <div key={it.id} style={{
                  display:'flex', alignItems:'center', gap:12, padding:'6px 0',
                }}>
                  <div style={{
                    fontSize: 12, color: T.ink3, fontWeight:600, width: 42,
                    fontVariantNumeric:'tabular-nums',
                  }}>{it.time}</div>
                  <CatTile catId={it.type} size={26} radius={8}/>
                  <div style={{ flex:1, fontSize: 13.5, color: T.ink2, fontWeight:500,
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {it.title}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '28px 16px', textAlign:'center', fontSize: 13, color: T.ink3 }}>
              今天尚未安排行程
            </div>
          )}
        </Card>
      </div>

      {/* TONIGHT'S STAY + SPEND row */}
      <div style={{ padding: '16px 16px 0', display:'grid', gap: 12, gridTemplateColumns:'1fr 1fr' }}>
        {/* tonight stay */}
        <Card pad={14} onClick={() => onNav('stay')} style={{ display:'flex', flexDirection:'column', gap: 8 }}>
          <div style={{
            display:'inline-flex', alignSelf:'flex-start', alignItems:'center', gap:4,
            padding: '3px 8px', borderRadius: 999,
            background: T.greenSoft, color: '#4D7058', fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
          }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'#5A8F6E' }}/>
            今晚住這裡
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, letterSpacing:-0.2,
            display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
          }}>{stay.name}</div>
          <div style={{ fontSize: 11, color: T.ink3, marginTop: 'auto' }}>
            {stay.tag}
          </div>
        </Card>

        {/* spend */}
        <Card pad={14} onClick={() => onNav('expense')} style={{ display:'flex', flexDirection:'column', gap: 6 }}>
          <div style={{ fontSize: 11, color: T.ink3, fontWeight:600, letterSpacing:0.5 }}>
            旅程總花費
          </div>
          <div style={{ display:'flex', alignItems:'baseline', gap: 4 }}>
            <Money twd={totalTWD} size="l"/>
          </div>
        </Card>
      </div>

      {/* recent expenses */}
      <SectionHeader title="最近消費" action={
        <button onClick={()=>onNav('expense')} style={{
          border:'none', background:'transparent', cursor:'pointer',
          color: T.primary, fontWeight:600, fontSize:12,
          display:'inline-flex', alignItems:'center', gap:2,
        }}>全部 <Icon name="chevR" size={14}/></button>
      }/>
      <div style={{ padding: '0 16px' }}>
        <Card pad={6}>
          {expenses.slice(-3).reverse().map((e, i, arr) => {
            const c = findCat(e.cat);
            const p = findMember(e.payer);
            return (
              <div key={e.id} style={{
                display:'flex', alignItems:'center', gap:12, padding: '12px 10px',
                borderBottom: i < arr.length - 1 ? '1px solid ' + T.divider : 'none',
              }}>
                <CatTile catId={e.cat} size={36}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.ink,
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {e.item}
                  </div>
                  <div style={{ fontSize: 11, color: T.ink3, marginTop: 2, display:'flex', gap:6, alignItems:'center' }}>
                    <span>{e.date}</span>
                    <span style={{ width:3, height:3, borderRadius:'50%', background: T.ink4 }}/>
                    <span>{p.name}付款</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Money krw={e.krw} currency="KRW" size="s"/>
                  <div style={{ fontSize: 10, color: T.ink3, marginTop: 2 }}>
                    ≈ {fmtTWD(krwToTwd(e.krw))}
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      <div style={{ height: 24 }}/>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Today (今日行程) — 唯讀瀏覽，資料來自共用 allItinItems
// ─────────────────────────────────────────────────────────────
function ScreenToday({ expenses, todayItems }) {
  const day  = DAYS[TRIP.todayIndex];
  const stay = STAYS[0];
  const items = todayItems || [];

  const todayExp = expenses.filter(e => e.day === TRIP.todayIndex);
  const todayKRW = todayExp.reduce((s, e) => s + e.krw, 0);

  const nextItem = items[0]; // 第一筆作為 NEXT UP

  return (
    <>
      {/* date hero */}
      <div style={{
        padding: '6px 20px 14px',
        background: 'linear-gradient(180deg, rgba(241,234,217,0.5) 0%, rgba(246,241,230,0) 100%)',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
          <div>
            <div style={{ fontSize: 12, color: T.ink3, letterSpacing: 0.5, fontWeight: 600 }}>
              DAY {day.idx + 1} / {TRIP.days}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: T.ink, letterSpacing: -0.5, marginTop: 2 }}>
              {day.date} <span style={{ fontSize: 16, color: T.ink3, fontWeight: 600 }}>{day.dow}</span>
            </div>
            <div style={{ fontSize: 14, color: T.ink2, marginTop: 4 }}>
              {day.title}
            </div>
          </div>
          <WeatherChip {...day.weather}/>
        </div>
      </div>

      {/* NEXT UP — 只在有行程時顯示 */}
      {nextItem && (
        <div style={{ padding: '0 16px 14px' }}>
          <div style={{
            borderRadius: 22, padding: 18,
            background: `linear-gradient(135deg, ${T.yellow}33 0%, ${T.orange}22 100%)`,
            border: '1.5px solid ' + T.yellow + '55',
            position:'relative', overflow:'hidden',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap: 6, marginBottom: 8 }}>
              <Icon name="bell" size={14} color={T.orange} strokeWidth={2.2}/>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.orange, letterSpacing: 1 }}>
                NEXT UP
              </span>
            </div>
            <div style={{ fontSize: 19, fontWeight: 700, color: T.ink, lineHeight: 1.3, letterSpacing: -0.3 }}>
              {nextItem.title}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap: 10, marginTop: 10, color: T.ink2, fontSize: 13 }}>
              <Icon name="clock" size={14} color={T.ink2}/>
              <span>{nextItem.time}{nextItem.dur ? ' · 停留 ' + nextItem.dur : ''}</span>
            </div>
            {nextItem.addr && (
              <div style={{ display:'flex', alignItems:'center', gap: 10, marginTop: 6, color: T.ink2, fontSize: 13 }}>
                <Icon name="pin" size={14} color={T.ink2}/>
                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {nextItem.addr}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 時間軸 — 有行程顯示列表，無行程顯示空狀態 */}
      <SectionHeader title="今日時間軸"/>
      <div style={{ padding: '0 16px' }}>
        {items.length === 0 ? (
          <Card pad={40} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🗓️</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: T.ink2, marginBottom: 6 }}>
              今天尚未安排任何行程
            </div>
            <div style={{ fontSize: 13, color: T.ink3 }}>
              請到行程頁新增行程
            </div>
          </Card>
        ) : (
          <Card pad={0}>
            <div style={{ padding: '6px 0' }}>
              {items.map((it, i) => {
                const cat = findCat(it.type);
                return (
                  <div key={it.id} style={{
                    display:'flex', gap: 12, padding: '12px 16px',
                    position:'relative',
                  }}>
                    {/* 時間 */}
                    <div style={{ width: 48, textAlign:'right', flexShrink: 0, paddingTop: 4 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 700, color: T.ink,
                        fontVariantNumeric:'tabular-nums', letterSpacing:-0.3,
                      }}>{it.time}</div>
                      {it.dur && <div style={{ fontSize: 10, color: T.ink3, marginTop: 2 }}>{it.dur}</div>}
                    </div>
                    {/* 時間線圓點 */}
                    <div style={{ position:'relative', width: 16, flexShrink: 0 }}>
                      <div style={{
                        position:'absolute', left: 6, top: 10,
                        bottom: i === items.length - 1 ? '50%' : -12,
                        width: 2, background: T.surfaceTint,
                      }}/>
                      <div style={{
                        position:'absolute', left: 0, top: 6,
                        width: 14, height: 14, borderRadius: '50%',
                        background: '#fff', border: '2px solid ' + cat.color,
                      }}/>
                    </div>
                    {/* 內容 */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 4 }}>
                        <CatTile catId={it.type} size={22} radius={6}/>
                        <span style={{
                          fontSize: 10, color: cat.color, fontWeight: 700,
                          letterSpacing: 0.4, textTransform: 'uppercase',
                        }}>{cat.label}</span>
                      </div>
                      <div style={{
                        fontSize: 14.5, fontWeight: 600, color: T.ink, letterSpacing:-0.2,
                      }}>{it.title}</div>
                      {it.addr && (
                        <div style={{ fontSize: 12, color: T.ink3, marginTop: 3, display:'flex', alignItems:'center', gap: 4 }}>
                          <Icon name="pin" size={11} color={T.ink3}/>
                          <span>{it.addr}</span>
                        </div>
                      )}
                      {it.participants && it.participants.length > 0 && (
                        <div style={{ display:'flex', alignItems:'center', gap: 6, marginTop: 6 }}>
                          <AvatarStack ids={it.participants} size={18} max={7}/>
                          <span style={{ fontSize: 10, color: T.ink3 }}>
                            {it.participants.length === MEMBERS.length ? '全員' : it.participants.length + ' 人'}
                          </span>
                        </div>
                      )}
                      {it.note && (
                        <div style={{
                          fontSize: 11.5, color: T.ink2, marginTop: 6,
                          padding: '6px 10px', background: T.bgSoft, borderRadius: 10,
                          display:'inline-block', maxWidth:'100%',
                        }}>
                          💬 {it.note}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {/* 今日重點 */}
      <SectionHeader title="今日重點"/>
      <div style={{ padding: '0 16px', display:'grid', gap:12, gridTemplateColumns:'1fr 1fr' }}>
        <Card pad={14}>
          <div style={{ fontSize: 11, color: T.ink3, fontWeight: 600, letterSpacing: 0.5 }}>今日交通</div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8 }}>
            <Icon name="subway" size={20} color={T.primary}/>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>3 號線</span>
          </div>
          <div style={{ fontSize: 11, color: T.ink3, marginTop: 4 }}>明洞 → 安國 → 弘大</div>
        </Card>
        <Card pad={14}>
          <div style={{ fontSize: 11, color: T.ink3, fontWeight: 600, letterSpacing: 0.5 }}>今日已花</div>
          <div style={{ marginTop: 6 }}>
            <Money krw={todayKRW} currency="KRW" size="m"/>
          </div>
          <div style={{ fontSize: 11, color: T.ink3, marginTop: 4 }}>
            ≈ {fmtTWD(krwToTwd(todayKRW))} · {todayExp.length} 筆
          </div>
        </Card>
      </div>

      {/* 今晚住宿 */}
      <SectionHeader title="今晚住宿"/>
      <div style={{ padding: '0 16px' }}>
        <Card pad={14} style={{ display:'flex', gap:12, alignItems:'center' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: T.greenSoft, color: '#4D7058',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          }}>
            <Icon name="bed" size={26} color="#4D7058" strokeWidth={1.8}/>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: T.ink, letterSpacing:-0.2,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
            }}>{stay.name}</div>
            <div style={{ fontSize: 12, color: T.ink3, marginTop: 3 }}>{stay.addrShort}</div>
          </div>
          <button style={{
            width: 40, height: 40, borderRadius: 12, border:'none',
            background: T.primarySoft, color: T.primary, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <Icon name="map" size={20} color={T.primary} strokeWidth={2}/>
          </button>
        </Card>
      </div>

      <div style={{ height: 24 }}/>
    </>
  );
}

Object.assign(window, { ScreenDashboard, ScreenToday });
