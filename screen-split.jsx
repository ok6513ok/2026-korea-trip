// screen-split.jsx — 分帳結算頁（overlay style）

// ─────────────────────────────────────────────────────────────
// 結算計算邏輯
// ─────────────────────────────────────────────────────────────
function computeSettlement(expenses) {
  // shareKRW[id] = 此人應分攤（KRW）
  // paidKRW[id]  = 此人實際付款（KRW）
  const shareKRW = {}, paidKRW = {};
  MEMBERS.forEach(m => { shareKRW[m.id] = 0; paidKRW[m.id] = 0; });

  expenses.forEach(e => {
    if (paidKRW[e.payer] !== undefined) paidKRW[e.payer] += e.krw;
    const per = e.krw / e.split.length;
    e.split.forEach(id => {
      if (shareKRW[id] !== undefined) shareKRW[id] += per;
    });
  });

  // net[id] > 0 → 此人需要付出更多（owe）
  // net[id] < 0 → 此人應收回錢（credit）
  const netKRW = {};
  MEMBERS.forEach(m => { netKRW[m.id] = shareKRW[m.id] - paidKRW[m.id]; });

  // 最小化交易的貪婪演算法
  const debtors   = MEMBERS.filter(m => netKRW[m.id] >  0.5).map(m => ({ id: m.id, name: m.name, amt: netKRW[m.id] }));
  const creditors = MEMBERS.filter(m => netKRW[m.id] < -0.5).map(m => ({ id: m.id, name: m.name, amt: -netKRW[m.id] }));
  debtors.sort((a, b) => b.amt - a.amt);
  creditors.sort((a, b) => b.amt - a.amt);

  const d = debtors.map(x => ({ ...x }));
  const c = creditors.map(x => ({ ...x }));
  const transactions = [];
  let i = 0, j = 0;
  while (i < d.length && j < c.length) {
    const amount = Math.min(d[i].amt, c[j].amt);
    if (amount > 0.5) {
      transactions.push({ from: d[i].id, to: c[j].id, krw: Math.round(amount) });
    }
    d[i].amt -= amount;
    c[j].amt -= amount;
    if (d[i].amt < 0.5) i++;
    if (c[j].amt < 0.5) j++;
  }

  return { shareKRW, paidKRW, netKRW, transactions };
}

// ─────────────────────────────────────────────────────────────
// ScreenSplit
// ─────────────────────────────────────────────────────────────
function ScreenSplit({ expenses, onClose }) {
  const { shareKRW, paidKRW, netKRW, transactions } = React.useMemo(
    () => computeSettlement(expenses),
    [expenses]
  );

  return (
    <div style={{
      position: 'absolute', inset: 0, background: T.bg, zIndex: 50,
      display: 'flex', flexDirection: 'column',
      fontFamily: T.font, color: T.ink,
    }}>
      {/* header */}
      <div style={{
        padding: '60px 16px 12px',
        display: 'flex', alignItems: 'center', gap: 12,
        background: T.bg,
      }}>
        <button onClick={onClose} style={{
          border: '1px solid ' + T.divider, background: '#fff', cursor: 'pointer',
          width: 38, height: 38, borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: T.shadowSoft, flexShrink: 0,
        }}>
          <Icon name="chevL" size={20} color={T.ink2}/>
        </button>
        <div>
          <div style={{ fontSize: 12, color: T.ink3, letterSpacing: 1, fontWeight: 500 }}>SPLIT</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.ink, letterSpacing: -0.2 }}>分帳結算</div>
        </div>
      </div>

      {/* scroll body */}
      <div style={{ flex: 1, overflow: 'auto', padding: '4px 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── 每人明細表 ── */}
        <Card pad={0}>
          {/* 表頭 */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
            padding: '10px 14px 8px',
            borderBottom: '1px solid ' + T.divider,
          }}>
            {['成員', '已付款', '應分攤', '應付/收'].map(h => (
              <div key={h} style={{
                fontSize: 11, color: T.ink3, fontWeight: 700,
                letterSpacing: 0.4, textAlign: h === '成員' ? 'left' : 'right',
              }}>{h}</div>
            ))}
          </div>

          {MEMBERS.map((m, i) => {
            const paid  = paidKRW[m.id];
            const share = shareKRW[m.id];
            const net   = netKRW[m.id];   // positive = owes, negative = receives
            const isLast = i === MEMBERS.length - 1;
            return (
              <div key={m.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
                padding: '12px 14px',
                borderBottom: isLast ? 'none' : '1px solid ' + T.divider,
                alignItems: 'center',
              }}>
                {/* 成員 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Avatar member={m} size={24}/>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{m.name}</span>
                </div>
                {/* 已付款 */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.ink, fontVariantNumeric: 'tabular-nums' }}>
                    {fmtTWD(krwToTwd(paid))}
                  </div>
                  <div style={{ fontSize: 10, color: T.ink4, fontVariantNumeric: 'tabular-nums' }}>
                    {fmtKRW(Math.round(paid))}
                  </div>
                </div>
                {/* 應分攤 */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.ink, fontVariantNumeric: 'tabular-nums' }}>
                    {fmtTWD(krwToTwd(share))}
                  </div>
                  <div style={{ fontSize: 10, color: T.ink4, fontVariantNumeric: 'tabular-nums' }}>
                    {fmtKRW(Math.round(share))}
                  </div>
                </div>
                {/* 應付/應收 */}
                <div style={{ textAlign: 'right' }}>
                  {Math.abs(net) < 1 ? (
                    <span style={{ fontSize: 12, color: T.green, fontWeight: 700 }}>✓ 平</span>
                  ) : net > 0 ? (
                    <div>
                      <div style={{ fontSize: 11, color: T.rose, fontWeight: 700 }}>應付</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.rose, fontVariantNumeric: 'tabular-nums' }}>
                        {fmtTWD(krwToTwd(net))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 11, color: T.green, fontWeight: 700 }}>應收</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.green, fontVariantNumeric: 'tabular-nums' }}>
                        {fmtTWD(krwToTwd(-net))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </Card>

        {/* ── 結算清單：誰要付給誰 ── */}
        <div style={{ padding: '0 2px' }}>
          <div style={{ fontSize: 13, color: T.ink3, fontWeight: 600, letterSpacing: 0.6, marginBottom: 10 }}>
            轉帳清單
          </div>
          {transactions.length === 0 ? (
            <Card pad={20} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: T.green, fontWeight: 600 }}>🎉 大家都平了，不用轉帳！</div>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {transactions.map((tx, idx) => {
                const fromM = MEMBERS.find(m => m.id === tx.from);
                const toM   = MEMBERS.find(m => m.id === tx.to);
                return (
                  <Card key={idx} pad={14}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      {/* 付款方 */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                        <Avatar member={fromM} size={36}/>
                        <span style={{ fontSize: 12, fontWeight: 600, color: T.ink }}>{fromM.name}</span>
                        <span style={{ fontSize: 10, color: T.rose, fontWeight: 600 }}>付款方</span>
                      </div>

                      {/* 箭頭 + 金額 */}
                      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{
                          fontSize: 14, fontWeight: 700, color: T.ink,
                          fontVariantNumeric: 'tabular-nums',
                        }}>{fmtTWD(krwToTwd(tx.krw))}</div>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '6px 14px', borderRadius: 999,
                          background: T.primarySoft,
                        }}>
                          <Icon name="arrowR" size={16} color={T.primary} strokeWidth={2}/>
                        </div>
                        <div style={{ fontSize: 10, color: T.ink3, fontVariantNumeric: 'tabular-nums' }}>
                          ≈ {fmtKRW(tx.krw)}
                        </div>
                      </div>

                      {/* 收款方 */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                        <Avatar member={toM} size={36}/>
                        <span style={{ fontSize: 12, fontWeight: 600, color: T.ink }}>{toM.name}</span>
                        <span style={{ fontSize: 10, color: T.green, fontWeight: 600 }}>收款方</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 說明 ── */}
        <div style={{
          padding: '10px 14px', borderRadius: 14,
          background: T.bgSoft, border: '1px solid ' + T.divider,
        }}>
          <div style={{ fontSize: 11, color: T.ink3, lineHeight: 1.6 }}>
            <strong style={{ color: T.ink2 }}>付款人</strong>：實際刷卡或付現的人<br/>
            <strong style={{ color: T.ink2 }}>應分攤</strong>：此人實際需負擔的費用<br/>
            <strong style={{ color: T.ink2 }}>轉帳清單</strong>：已最佳化，用最少筆數完成結算
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenSplit });
