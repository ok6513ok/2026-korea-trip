// screen-expense.jsx — Expense 消費記錄 + Add Expense 新增消費

// ─────────────────────────────────────────────────────────────
// Helper: 計算某成員應分攤金額（KRW）
// ─────────────────────────────────────────────────────────────
function calcMemberShare(memberId, expenses) {
  return expenses.reduce((sum, e) => {
    if (!e.split || !e.split.includes(memberId)) return sum;
    const amount = Number(e.krw) || 0;
    const splitCount = e.split.length || 1;
    return sum + amount / splitCount;
  }, 0);
}

// ─────────────────────────────────────────────────────────────
// Expense (消費記錄)
// ─────────────────────────────────────────────────────────────
function ScreenExpense({ expenses, onAddExpense, onViewSplit, onEditExpense, memberBudgets, onEditBudget }) {
  // 預設「全部」視角
  const [memberView, setMemberView] = useState('all');
  const [cat, setCat] = useState('all');
  const [day, setDay] = useState('all');

  const filtered = expenses.filter(e =>
    (cat === 'all' || e.cat === cat) &&
    (day === 'all' || e.day === day)
  );

  // ── 英雄卡片資料 ──────────────────────────────────────────
  const allTWD = krwToTwd(expenses.reduce((s, e) => s + e.krw, 0));
  const totalBudget = MEMBERS.reduce((s, m) => s + ((memberBudgets && memberBudgets[m.id]) || 50000), 0);

  let heroTitle, heroSpent, heroBudget, heroSubtitle;
  if (memberView === 'all') {
    heroTitle    = '旅程總花費';
    heroSpent    = allTWD;
    heroBudget   = totalBudget;
    heroSubtitle = `${expenses.length} 筆消費`;
  } else {
    const m = MEMBERS.find(x => x.id === memberView);
    const shareKRW = calcMemberShare(memberView, expenses);
    const mb = (memberBudgets && memberBudgets[memberView]) || 50000;
    heroTitle    = `${m.name}的旅程總花費`;
    heroSpent    = krwToTwd(shareKRW);
    heroBudget   = mb;
    heroSubtitle = '應分攤金額';
  }
  const pct = heroBudget > 0 ? Math.min(100, (heroSpent / heroBudget) * 100) : 0;

  // ── 成員消費總覽 ──────────────────────────────────────────
  const memberShares = MEMBERS.map(m => ({
    ...m,
    shareTWD: krwToTwd(calcMemberShare(m.id, expenses)),
  }));

  // ── 消費清單（依日期群組）────────────────────────────────
  const groups = {};
  filtered.slice().reverse().forEach(e => {
    if (!groups[e.date]) groups[e.date] = [];
    groups[e.date].push(e);
  });

  return (
    <>
      {/* ── 英雄：旅程總花費 + 成員切換 ── */}
      <div style={{ padding: '4px 16px 14px' }}>
        <div style={{
          padding: 18, borderRadius: 22,
          background: `linear-gradient(135deg, ${T.orange}22 0%, ${T.yellow}33 100%)`,
          border: '1.5px solid ' + T.orange + '33',
        }}>
          {/* 成員切換 pills */}
          <div style={{
            display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 14,
            scrollbarWidth: 'none', paddingBottom: 2,
          }}>
            {[{ id: 'all', name: '全部' }, ...MEMBERS].map(m => {
              const on = memberView === m.id;
              return (
                <button key={m.id} onClick={() => setMemberView(m.id)} style={{
                  flexShrink: 0, padding: '5px 12px', borderRadius: 999,
                  border: on ? 'none' : '1px solid ' + T.orange + '66',
                  background: on ? T.orange : 'rgba(255,255,255,0.65)',
                  color: on ? '#fff' : T.ink2,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  fontFamily: T.font, letterSpacing: 0.2,
                }}>{m.name}</button>
              );
            })}
          </div>

          {/* 標題 + 修改預算按鈕（只在單一成員時顯示） */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 11, color: T.ink3, fontWeight: 700, letterSpacing: 1 }}>
              {heroTitle}
            </div>
            {memberView !== 'all' && onEditBudget && (
              <button onClick={() => onEditBudget(memberView)} style={{
                border: 'none', background: 'rgba(255,255,255,0.55)',
                borderRadius: 20, padding: '4px 10px',
                fontSize: 11, fontWeight: 700, color: T.ink2,
                cursor: 'pointer', fontFamily: T.font,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Icon name="edit" size={12} color={T.ink2}/>
                修改預算
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <Money twd={heroSpent} size="xl"/>
            {memberView !== 'all' && (
              <span style={{ fontSize: 13, color: T.ink3, fontWeight: 500 }}>
                / {fmtTWD(heroBudget)}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: T.ink2, marginTop: 2 }}>{heroSubtitle}</div>

          {/* 進度條 + 剩餘（僅個人視角） */}
          {memberView !== 'all' && (
            <>
              <div style={{
                height: 8, borderRadius: 8, background: 'rgba(255,255,255,0.7)',
                marginTop: 14, overflow: 'hidden',
              }}>
                <div style={{
                  width: pct + '%', height: '100%',
                  background: pct > 80 ? T.rose : T.orange,
                  borderRadius: 8,
                }}/>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', fontSize: 11,
                color: T.ink3, marginTop: 6, fontWeight: 600,
              }}>
                <span>已用 {pct.toFixed(0)}%</span>
                <span>剩餘 {fmtTWD(heroBudget - heroSpent)}</span>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ── 成員消費總覽（點擊切換視角）── */}
      <div style={{ padding: '0 16px' }}>
        <Card pad={14}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 12,
          }}>
            <span style={{ fontSize: 12, color: T.ink3, fontWeight: 600, letterSpacing: 0.5 }}>
              成員消費總覽
            </span>
            <button
              onClick={onViewSplit}
              style={{
                border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 12, color: T.primary, fontWeight: 600, fontFamily: T.font,
                padding: 0,
              }}
            >查看分帳 →</button>
          </div>
          {/* 7 人橫向滑動 — 點擊切換上方視角 */}
          <div style={{
            display: 'flex', gap: 4,
            overflowX: 'auto', scrollbarWidth: 'none',
            paddingBottom: 2, marginRight: -14, paddingRight: 14,
          }}>
            {memberShares.map(m => {
              const on = memberView === m.id;
              return (
                <div key={m.id} onClick={() => setMemberView(m.id)} style={{
                  flexShrink: 0, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 5, padding: '4px 6px', borderRadius: 12,
                  background: on ? T.primarySoft : 'transparent',
                  transition: 'background .15s',
                }}>
                  <Avatar member={m} size={32}/>
                  <span style={{
                    fontSize: 11.5, fontWeight: 700, color: on ? T.primary : T.ink,
                    whiteSpace: 'nowrap',
                  }}>{m.name}</span>
                  <span style={{
                    fontSize: 10.5, fontWeight: 600, color: T.primary,
                    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
                  }}>{fmtTWD(m.shareTWD)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── 篩選 ── */}
      <SectionHeader title="篩選 / 全部消費"/>
      <div style={{ padding: '0 16px 8px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <FilterChip active={cat === 'all'} onClick={() => setCat('all')} label="全部"/>
        {CATS.map(c => (
          <FilterChip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}
            label={c.label} dotColor={c.color}/>
        ))}
      </div>
      <div style={{ padding: '0 16px 8px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <FilterChip active={day === 'all'} onClick={() => setDay('all')} label="全部日期" small/>
        {DAYS.map(d => (
          <FilterChip key={d.idx} active={day === d.idx} onClick={() => setDay(d.idx)}
            label={d.label + ' · ' + d.date} small/>
        ))}
      </div>

      {/* ── 消費清單 ── */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Object.entries(groups).map(([date, list]) => {
          const dayTotal = list.reduce((s, e) => s + e.krw, 0);
          return (
            <div key={date}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '4px 6px 8px',
              }}>
                <span style={{ fontSize: 12, color: T.ink3, fontWeight: 700, letterSpacing: 0.5 }}>
                  {date}
                </span>
                <span style={{ fontSize: 12, color: T.ink3, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  {fmtKRW(dayTotal)}
                </span>
              </div>
              <Card pad={0}>
                {list.map((e, i) => <ExpenseRow key={e.id} e={e} last={i === list.length - 1} onEdit={onEditExpense}/>)}
              </Card>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <Card pad={32} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: T.ink3 }}>沒有符合條件的消費</div>
          </Card>
        )}
      </div>

      <div style={{ height: 24 }}/>
    </>
  );
}

function FilterChip({ active, onClick, label, dotColor, small }) {
  return (
    <button onClick={onClick} style={{
      border: active ? 'none' : '1px solid ' + T.divider,
      background: active ? T.primary : '#fff',
      color: active ? '#fff' : T.ink2,
      padding: small ? '5px 10px' : '6px 12px',
      borderRadius: 999, cursor: 'pointer', fontFamily: T.font,
      fontSize: small ? 11 : 12, fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: 6,
    }}>
      {dotColor && !active && (
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor }}/>
      )}
      {label}
    </button>
  );
}

function ExpenseRow({ e, last, onEdit }) {
  const c = findCat(e.cat);
  const p = findMember(e.payer);
  return (
    <div onClick={() => onEdit && onEdit(e)} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      borderBottom: last ? 'none' : '1px solid ' + T.divider,
      cursor: onEdit ? 'pointer' : 'default',
    }}>
      <CatTile catId={e.cat} size={38}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 600, color: T.ink, letterSpacing: -0.1,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{e.item}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <Avatar member={p} size={16}/>
          <span style={{ fontSize: 11, color: T.ink3, fontWeight: 600 }}>{p.name} 付</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: T.ink4 }}/>
          <AvatarStack ids={e.split} size={16} max={4}/>
          <span style={{ fontSize: 11, color: T.ink3 }}>分</span>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <Money krw={e.krw} currency="KRW" size="s"/>
        <div style={{ fontSize: 10.5, color: T.ink3, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
          ≈ {fmtTWD(krwToTwd(e.krw))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Add Expense (新增消費)  — sheet-style
// ─────────────────────────────────────────────────────────────
function ScreenAddExpense({ onClose, onSave, editExpense, onDelete }) {
  const [amount, setAmount] = useState(editExpense ? String(editExpense.krw) : '');
  const [currency, setCurrency] = useState('KRW');
  const [name, setName] = useState(editExpense?.item || '');
  const [cat, setCat] = useState(editExpense?.cat || 'food');
  const [payer, setPayer] = useState(editExpense?.payer || MEMBERS[0].id);
  const [splitMode, setSplitMode] = useState('pick');
  const [splitSet, setSplitSet] = useState(new Set(editExpense?.split || MEMBERS.map(m => m.id)));
  const [selectedDayIdx, setSelectedDayIdx] = useState(editExpense?.day ?? TRIP.todayIndex);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [note, setNote] = useState(editExpense?.note || '');
  const [confirmDel, setConfirmDel] = useState(false);

  const numAmount = parseInt(amount || '0', 10);
  const krw = currency === 'KRW' ? numAmount : numAmount * TRIP.rate.TWD_KRW;
  const twd = currency === 'TWD' ? numAmount : numAmount / TRIP.rate.TWD_KRW;

  const splitIds = splitMode === 'all'
    ? MEMBERS.map(m => m.id)
    : [...splitSet];
  const perPerson = splitIds.length > 0 ? krw / splitIds.length : 0;

  const toggleSplit = (id) => {
    const ns = new Set(splitSet);
    if (ns.has(id)) ns.delete(id); else ns.add(id);
    setSplitSet(ns);
  };

  const save = () => {
    onSave({
      id:   editExpense?.id || 'e' + Date.now(),
      day:  selectedDayIdx,
      date: DAYS[selectedDayIdx].date,
      item: name || '未命名消費',
      cat, krw, payer,
      split: splitIds,
      note,
    });
  };

  const presets = currency === 'KRW' ? [5000, 10000, 30000, 50000] : [200, 500, 1000, 2000];

  return (
    <div style={{
      position: 'absolute', inset: 0, background: T.bg, zIndex: 50,
      display: 'flex', flexDirection: 'column',
      fontFamily: T.font, color: T.ink,
    }}>
      {/* sheet header */}
      <div style={{
        padding: 'calc(env(safe-area-inset-top, 0px) + 20px) 16px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: T.bg,
      }}>
        <button onClick={onClose} style={{
          border: '1px solid ' + T.divider, background: '#fff', cursor: 'pointer',
          width: 38, height: 38, borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: T.shadowSoft,
        }}>
          <Icon name="close" size={20} color={T.ink2}/>
        </button>
        <div style={{ fontSize: 17, fontWeight: 700, color: T.ink, letterSpacing: -0.2 }}>
          {editExpense ? '編輯消費' : '新增消費'}
        </div>
        <button onClick={save} disabled={!numAmount} style={{
          border: 'none', background: numAmount ? T.primary : T.surfaceTint,
          color: numAmount ? '#fff' : T.ink4, cursor: numAmount ? 'pointer' : 'default',
          padding: '8px 16px', borderRadius: 20, fontFamily: T.font,
          fontSize: 14, fontWeight: 700,
        }}>儲存</button>
      </div>

      {/* scroll body */}
      <div style={{
        flex: 1, overflow: 'auto', padding: '4px 16px 24px',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {/* amount */}
        <Card pad={20}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <div style={{
              display: 'inline-flex', padding: 3, borderRadius: 999,
              background: T.bgSoft, border: '1px solid ' + T.divider,
            }}>
              {['KRW', 'TWD'].map(c => (
                <button key={c} onClick={() => setCurrency(c)} style={{
                  border: 'none', background: currency === c ? T.primary : 'transparent',
                  color: currency === c ? '#fff' : T.ink3, cursor: 'pointer',
                  padding: '7px 18px', borderRadius: 999, fontFamily: T.font,
                  fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
                }}>{c === 'KRW' ? '韓元 ₩' : '台幣 NT$'}</button>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: T.ink3, fontWeight: 600, letterSpacing: 1 }}>金額</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6, marginTop: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 600, color: T.ink3 }}>
                {currency === 'KRW' ? '₩' : 'NT$'}
              </span>
              <input
                inputMode="numeric"
                value={amount}
                onChange={e => setAmount(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="0"
                style={{
                  border: 'none', outline: 'none', background: 'transparent',
                  fontFamily: T.font, fontSize: 40, fontWeight: 700, color: T.ink,
                  letterSpacing: -1, width: 200, textAlign: 'center',
                }}
              />
            </div>
            {numAmount > 0 && (
              <div style={{ fontSize: 12, color: T.ink3, marginTop: 2 }}>
                ≈ {currency === 'KRW' ? fmtTWD(twd) : fmtKRW(krw)}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 16, justifyContent: 'center' }}>
            {presets.map(p => (
              <button key={p} onClick={() => setAmount(String(p))} style={{
                border: '1px solid ' + T.divider, background: '#fff',
                color: T.ink2, cursor: 'pointer', padding: '6px 12px',
                borderRadius: 999, fontFamily: T.font, fontSize: 12, fontWeight: 600,
              }}>+{p.toLocaleString()}</button>
            ))}
          </div>
        </Card>

        {/* name + date */}
        <Card pad={0}>
          <FieldRow label="消費名稱" icon="note">
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="例：劉家辣炒年糕"
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontFamily: T.font, fontSize: 15, fontWeight: 600, color: T.ink,
                width: '100%', textAlign: 'right',
              }}
            />
          </FieldRow>
          <Divider/>
          <FieldRow label="日期" icon="today">
            <button onClick={() => setShowDatePicker(true)} style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: T.font, fontSize: 14, fontWeight: 600, color: T.primary,
              padding: 0,
            }}>
              {DAYS[selectedDayIdx].label}｜{DAYS[selectedDayIdx].date}
            </button>
          </FieldRow>
        </Card>

        {/* category */}
        <Card pad={14}>
          <FieldLabel>消費分類</FieldLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 10 }}>
            {CATS.map(c => {
              const on = cat === c.id;
              return (
                <button key={c.id} onClick={() => setCat(c.id)} style={{
                  border: on ? '2px solid ' + c.color : '1px solid ' + T.divider,
                  background: on ? c.bg : '#fff', cursor: 'pointer',
                  padding: '12px 8px', borderRadius: 14,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                }}>
                  <Icon name={c.icon} size={22} color={c.color} strokeWidth={1.9}/>
                  <span style={{ fontSize: 12, color: on ? c.color : T.ink2, fontWeight: 700 }}>
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* payer */}
        <Card pad={14}>
          <FieldLabel>付款人</FieldLabel>
          <div style={{
            display: 'flex', gap: 6, marginTop: 10,
            overflowX: 'auto', scrollbarWidth: 'none',
          }}>
            {MEMBERS.map(m => {
              const on = payer === m.id;
              return (
                <button key={m.id} onClick={() => setPayer(m.id)} style={{
                  flexShrink: 0, border: 'none', background: 'transparent', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: 4,
                }}>
                  <div style={{
                    padding: 3, borderRadius: '50%',
                    background: on ? m.color : 'transparent',
                  }}>
                    <div style={{
                      padding: on ? 2 : 0, borderRadius: '50%',
                      background: on ? '#fff' : 'transparent',
                    }}>
                      <Avatar member={m} size={on ? 36 : 40}/>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: on ? 700 : 500,
                    color: on ? T.ink : T.ink3,
                  }}>{m.name}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* split */}
        <Card pad={14}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <FieldLabel>分帳對象</FieldLabel>
            <div style={{
              display: 'inline-flex', padding: 2, borderRadius: 999,
              background: T.bgSoft, border: '1px solid ' + T.divider,
            }}>
              {[{ id: 'all', l: '全部' }, { id: 'pick', l: '自選' }].map(o => (
                <button key={o.id} onClick={() => setSplitMode(o.id)} style={{
                  border: 'none', background: splitMode === o.id ? '#fff' : 'transparent',
                  color: splitMode === o.id ? T.ink : T.ink3, cursor: 'pointer',
                  padding: '4px 10px', borderRadius: 999,
                  fontFamily: T.font, fontSize: 11, fontWeight: 600,
                  boxShadow: splitMode === o.id ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                }}>{o.l}</button>
              ))}
            </div>
          </div>
          {splitMode === 'pick' ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {MEMBERS.map(m => {
                const on = splitSet.has(m.id);
                return (
                  <button key={m.id} onClick={() => toggleSplit(m.id)} style={{
                    border: 'none', background: on ? m.color + '22' : T.bgSoft,
                    cursor: 'pointer', padding: '6px 10px 6px 6px',
                    borderRadius: 999, display: 'flex', alignItems: 'center', gap: 6,
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
          ) : (
            <div style={{ display: 'flex', marginTop: 12, alignItems: 'center' }}>
              <AvatarStack ids={MEMBERS.map(m => m.id)} size={28}/>
              <span style={{ fontSize: 12, color: T.ink3, marginLeft: 8 }}>
                全員 {MEMBERS.length} 人平分
              </span>
            </div>
          )}
          {numAmount > 0 && splitIds.length > 0 && (
            <div style={{
              marginTop: 14, padding: '10px 12px', borderRadius: 12,
              background: T.primarySoft, display: 'flex', justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: 12, color: T.primary, fontWeight: 600 }}>每人分擔</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.primary }}>
                {fmtKRW(Math.round(perPerson))} · ≈ {fmtTWD(krwToTwd(perPerson))}
              </span>
            </div>
          )}
        </Card>

        {/* note */}
        <Card pad={0}>
          <FieldRow label="備註" icon="note" align="top">
            <textarea
              value={note} onChange={e => setNote(e.target.value)}
              placeholder="選填，例如：好吃 / 弟弟想再吃一次"
              rows={2}
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontFamily: T.font, fontSize: 14, color: T.ink,
                width: '100%', resize: 'none', textAlign: 'right',
              }}
            />
          </FieldRow>
        </Card>

        {/* 刪除此消費 — 只在編輯模式顯示 */}
        {editExpense && onDelete && !confirmDel && (
          <button onClick={() => setConfirmDel(true)} style={{
            width: '100%', padding: 14, borderRadius: 20, border: 'none',
            background: T.roseSoft, cursor: 'pointer',
            fontSize: 14, fontWeight: 600, color: T.rose, fontFamily: T.font,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Icon name="trash" size={16} color={T.rose} strokeWidth={2}/>
            刪除此消費
          </button>
        )}

        {editExpense && confirmDel && (
          <div style={{ background: T.roseSoft, borderRadius: 18, padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, textAlign: 'center', marginBottom: 12 }}>
              確定要刪除這筆消費嗎？
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmDel(false)} style={{
                flex: 1, padding: '11px 0', borderRadius: 16,
                border: '1px solid ' + T.divider, background: '#fff',
                fontSize: 14, fontWeight: 600, color: T.ink, cursor: 'pointer', fontFamily: T.font,
              }}>取消</button>
              <button onClick={() => onDelete(editExpense.id)} style={{
                flex: 1, padding: '11px 0', borderRadius: 16,
                border: 'none', background: T.rose,
                fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: T.font,
              }}>確認刪除</button>
            </div>
          </div>
        )}
      </div>

      {/* Date picker bottom sheet */}
      {showDatePicker && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.35)', zIndex: 100,
          display: 'flex', alignItems: 'flex-end',
        }} onClick={() => setShowDatePicker(false)}>
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
            }}>選擇消費日期</div>
            {DAYS.map(d => (
              <button key={d.idx}
                onClick={() => { setSelectedDayIdx(d.idx); setShowDatePicker(false); }}
                style={{
                  width: '100%', padding: '14px 20px',
                  border: 'none',
                  background: selectedDayIdx === d.idx ? T.primarySoft : 'transparent',
                  cursor: 'pointer', borderRadius: 14, marginBottom: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  fontFamily: T.font, boxSizing: 'border-box',
                }}>
                <span style={{
                  fontSize: 15, fontWeight: 700,
                  color: selectedDayIdx === d.idx ? T.primary : T.ink,
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

function FieldLabel({ children }) {
  return (
    <div style={{ fontSize: 12, color: T.ink3, fontWeight: 700, letterSpacing: 0.5 }}>
      {children}
    </div>
  );
}

function FieldRow({ label, icon, children, align = 'center' }) {
  return (
    <div style={{
      display: 'flex', alignItems: align === 'top' ? 'flex-start' : 'center',
      gap: 10, padding: '14px 16px',
    }}>
      <Icon name={icon} size={18} color={T.ink3}/>
      <span style={{ fontSize: 13, color: T.ink2, fontWeight: 600, flexShrink: 0 }}>
        {label}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: T.divider, marginLeft: 44 }}/>;
}

// ─────────────────────────────────────────────────────────────
// BudgetForm 子元件（模組級，避免 input 每次 re-render 失焦）
// ─────────────────────────────────────────────────────────────
function BRow({ label, icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px' }}>
      <Icon name={icon} size={18} color={T.ink3}/>
      <span style={{ fontSize: 13, color: T.ink2, fontWeight: 600, flexShrink: 0, minWidth: 80 }}>
        {label}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}
function BDivider() {
  return <div style={{ height: 1, background: T.divider, marginLeft: 44 }}/>;
}

// ─────────────────────────────────────────────────────────────
// BudgetForm — 修改個人預算 overlay（單一成員）
// ─────────────────────────────────────────────────────────────
function BudgetForm({ memberId, memberBudget, expenses, onClose, onSave }) {
  const member = MEMBERS.find(m => m.id === memberId);
  // 本地 state：只在按「儲存」時才更新全域，避免 onChange 觸發重新掛載導致鍵盤消失
  const [budgetInput, setBudgetInput] = useState(String(memberBudget || 50000));

  const budgetNum = parseInt(budgetInput) || 0;
  const spentTWD  = krwToTwd(calcMemberShare(memberId, expenses || []));
  const remaining = budgetNum - spentTWD;

  const inputStyle = {
    border: 'none', outline: 'none', background: 'transparent',
    fontFamily: T.font, fontSize: 15, fontWeight: 700, color: T.ink,
    textAlign: 'right', width: 100,
    MozAppearance: 'textfield',
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, background: T.bg, zIndex: 50,
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
          width: 38, height: 38, borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: T.shadowSoft,
        }}>
          <Icon name="close" size={20} color={T.ink2}/>
        </button>
        <div style={{ fontSize: 17, fontWeight: 700, color: T.ink, letterSpacing: -0.2 }}>
          修改個人預算
        </div>
        <button onClick={() => onSave(memberId, budgetNum || 50000)} style={{
          border: 'none', background: T.primary, color: '#fff',
          cursor: 'pointer', padding: '8px 16px', borderRadius: 20,
          fontFamily: T.font, fontSize: 14, fontWeight: 700,
        }}>儲存</button>
      </div>

      {/* body */}
      <div style={{
        flex: 1, overflow: 'auto', padding: '4px 16px 40px',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: T.shadowCard }}>
          {/* 成員（唯讀） */}
          <BRow label="成員" icon="person">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
              {member && <Avatar member={member} size={22}/>}
              <span style={{ fontamily: T.font, fontSize: 15, fontWeight: 700, color: T.ink }}>
                {member ? member.name : ''}
              </span>
            </div>
          </BRow>
          <BDivider/>
          {/* 個人預算（可編輯）— onChange 只更新本地 state，不觸發全域 */}
          <BRow label="個人預算" icon="chart">
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 13, color: T.ink3, fontWeight: 600 }}>NT$</span>
              <input
                type="number"
                inputMode="numeric"
                value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)}
                placeholder="50000"
                style={inputStyle}
              />
            </div>
          </BRow>
          <BDivider/>
          {/* 個人旅程總金額（唯讀） */}
          <BRow label="個人旅程總金額" icon="wallet">
            <div style={{
              textAlign: 'right', fontSize: 15, fontWeight: 700, color: T.ink2,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {fmtTWD(spentTWD)}
            </div>
          </BRow>
          <BDivider/>
          {/* 剩餘預算（自動計算） */}
          <BRow label="剩餘預算" icon="bookmark">
            <div style={{
              textAlign: 'right', fontSize: 15, fontWeight: 700,
              color: remaining >= 0 ? T.primary : T.rose,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {fmtTWD(remaining)}
            </div>
          </BRow>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenExpense, ScreenAddExpense, BudgetForm, calcMemberShare });
