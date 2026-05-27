// app.jsx — main App: state, navigation, device frame composition

// ─── date helpers ───────────────────────────────────────────
function getCurrentDateLabel() {
  const now = new Date();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const yyyy = now.getFullYear();
  const mm   = String(now.getMonth() + 1).padStart(2, '0');
  const dd   = String(now.getDate()).padStart(2, '0');
  return `${yyyy} / ${mm} / ${dd}・週${weekdays[now.getDay()]}`;
}
function getCurrentWeekday() {
  return ['日', '一', '二', '三', '四', '五', '六'][new Date().getDay()];
}

// ─── localStorage helpers ───────────────────────────────────
function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) return JSON.parse(raw);
  } catch(e) {}
  return fallback;
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) {}
}

function App() {
  const [tab, setTab] = useState(() => {
    const saved = lsGet('familyTrip_activeTab', 'home');
    return ['home','today','itinerary','expense','stay'].includes(saved) ? saved : 'home';
  });
  const [showAdd, setShowAdd] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [showItinForm, setShowItinForm] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [itineraryDay, setItineraryDay] = useState(TRIP.todayIndex);

  // ── expenses — localStorage persisted ──────────────────────
  const [expenses, setExpenses] = useState(() =>
    lsGet('familyTrip_expenses', EXPENSES_INIT)
  );
  useEffect(() => { lsSet('familyTrip_expenses', expenses); }, [expenses]);

  // ── 保存目前頁面 — localStorage persisted ──────────────────
  useEffect(() => { lsSet('familyTrip_activeTab', tab); }, [tab]);

  // ── per-member budgets — localStorage persisted ─────────────
  const [memberBudgets, setMemberBudgets] = useState(() => {
    const defaults = {};
    MEMBERS.forEach(m => { defaults[m.id] = 50000; });
    return lsGet('familyTrip_memberBudgets', defaults);
  });
  useEffect(() => { lsSet('familyTrip_memberBudgets', memberBudgets); }, [memberBudgets]);

  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editBudgetMemberId, setEditBudgetMemberId] = useState(null);

  const handleEditBudget = (memberId) => {
    setEditBudgetMemberId(memberId);
    setShowBudgetForm(true);
  };
  const handleSaveMemberBudget = (memberId, amount) => {
    setMemberBudgets(prev => ({ ...prev, [memberId]: amount }));
    setShowBudgetForm(false);
    setEditBudgetMemberId(null);
  };

  // ── stays — localStorage persisted ─────────────────────────
  const [stays, setStays] = useState(() =>
    lsGet('familyTrip_stays', STAYS.map(s => ({ ...s })))
  );
  useEffect(() => { lsSet('familyTrip_stays', stays); }, [stays]);

  const [showStayForm, setShowStayForm] = useState(false);
  const [editStay, setEditStay] = useState(null);

  const handleEditStay = (stay) => { setEditStay(stay); setShowStayForm(true); };
  const handleSaveStay = (newS) => {
    setStays(prev => editStay
      ? prev.map(s => s.id === newS.id ? newS : s)
      : [...prev, newS]);
    setEditStay(null);
    setShowStayForm(false);
  };
  const handleDeleteStay = (id) => {
    setStays(prev => prev.filter(s => s.id !== id));
    setEditStay(null);
    setShowStayForm(false);
  };

  // ── itinerary items — localStorage persisted ───────────────
  const [allItinItems, setAllItinItems] = useState(() => {
    const fallback = {};
    DAYS.forEach(d => { fallback[d.idx] = d.items.map(it => ({ ...it })); });
    return lsGet('familyTrip_itineraryItems', fallback);
  });
  useEffect(() => { lsSet('familyTrip_itineraryItems', allItinItems); }, [allItinItems]);

  const handleSaveItinItem = (item, dayIdx) => {
    setAllItinItems(prev => {
      const list = [...(prev[dayIdx] || [])];
      const idx = list.findIndex(x => x.id === item.id);
      if (idx >= 0) list[idx] = item;
      else { list.push(item); list.sort((a, b) => a.time.localeCompare(b.time)); }
      return { ...prev, [dayIdx]: list };
    });
  };

  const handleDeleteItinItem = (itemId, dayIdx) => {
    setAllItinItems(prev => ({
      ...prev, [dayIdx]: (prev[dayIdx] || []).filter(x => x.id !== itemId),
    }));
  };

  const scrollRef = useRef(null);

  // reset scroll on tab change
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [tab]);

  const handleNav = (id) => {
    if (id === 'home' || id === 'today' || id === 'itinerary' || id === 'expense' || id === 'stay') {
      setTab(id);
    } else {
      if (id === 'sub-budget' || id === 'sub-split') setTab('expense');
      else if (id === 'sub-tx' || id === 'sub-mem' || id === 'sub-saved' || id === 'sub-set') setTab('itinerary');
      else if (id === 'stay') setTab('stay');
    }
  };

  const handleEditExpense = (e) => { setEditExpense(e); setShowAdd(true); };

  const handleAddExpense = (newE) => {
    setExpenses(prev => editExpense
      ? prev.map(e => e.id === newE.id ? newE : e)
      : [...prev, newE]);
    setEditExpense(null);
    setShowAdd(false);
    setTab('expense');
  };

  // top bar config per tab
  const topBarFor = (t) => ({
    home:      { sub: getCurrentDateLabel(), title: `哈囉，週${getCurrentWeekday()}早安 👋` },
    today:     { sub: 'TODAY',               title: '今日行程' },
    itinerary: { sub: 'ITINERARY',           title: '行程總覽' },
    expense:   { sub: 'EXPENSE',             title: '消費記錄' },
    stay:      { sub: 'STAY',               title: '住宿資訊' },
  }[t]);

  const tb = topBarFor(tab);

  // page content
  let content;
  if (tab === 'home') {
    content = <ScreenDashboard expenses={expenses} onNav={handleNav} onAddExpense={()=>setShowAdd(true)}/>;
  } else if (tab === 'today') {
    content = <ScreenToday expenses={expenses} todayItems={allItinItems[TRIP.todayIndex] || []}/>;
  } else if (tab === 'itinerary') {
    content = <ScreenItinerary
      initialDay={itineraryDay}
      allItemsExt={allItinItems}
      onSaveItemExt={handleSaveItinItem}
      onDeleteItemExt={handleDeleteItinItem}
    />;
  } else if (tab === 'expense') {
    content = <ScreenExpense
      expenses={expenses}
      memberBudgets={memberBudgets}
      onAddExpense={()=>setShowAdd(true)}
      onViewSplit={()=>setShowSplit(true)}
      onEditExpense={handleEditExpense}
      onEditBudget={handleEditBudget}
    />;
  } else if (tab === 'stay') {
    content = <ScreenStay stays={stays} onEditStay={handleEditStay} onDeleteStay={handleDeleteStay}/>;
  }

  const showFab = tab === 'itinerary' || tab === 'expense' || tab === 'stay';
  const fabIsItinerary = tab === 'itinerary';
  const fabIsStay = tab === 'stay';

  return (
    <div style={{
      position: 'fixed', top: 0, bottom: 0, left: 0, right: 0,
      maxWidth: 430, margin: '0 auto',
      background: T.bg, fontFamily: T.font,
      overflow: 'hidden',
    }}>
      {/* TopBar */}
      <TopBar title={tb.title} sub={tb.sub} action={
        <button style={{
          width: 38, height: 38, borderRadius: 12,
          background: '#fff', cursor: 'pointer',
          boxShadow: T.shadowSoft, border: '1px solid ' + T.divider,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="bell" size={18} color={T.ink2}/>
        </button>
      }/>

      {/* scrollable content */}
      <AppShell scrollRef={scrollRef}>
        {content}
      </AppShell>

      {/* FAB */}
      {showFab && !showAdd && !showItinForm && !showStayForm && !showBudgetForm && (
        <FAB
          onClick={() => fabIsItinerary ? setShowItinForm(true) : fabIsStay ? setShowStayForm(true) : setShowAdd(true)}
          label={fabIsItinerary ? '新增行程' : fabIsStay ? '新增住宿' : '新增消費'}
        />
      )}

      {/* Bottom nav */}
      {!showAdd && !showItinForm && !showStayForm && !showBudgetForm && <BottomNav active={tab} onChange={handleNav}/>}

      {/* Add expense sheet overlay */}
      {showAdd && (
        <ScreenAddExpense onClose={()=>{ setShowAdd(false); setEditExpense(null); }} onSave={handleAddExpense} editExpense={editExpense}/>
      )}

      {/* Add itinerary form overlay */}
      {showItinForm && (
        <ItineraryForm
          item={null}
          dayIdx={tab === 'itinerary' ? itineraryDay : TRIP.todayIndex}
          onSave={(item) => {
            const dayIdx = tab === 'itinerary' ? itineraryDay : TRIP.todayIndex;
            handleSaveItinItem(item, dayIdx);
            setShowItinForm(false);
          }}
          onDelete={null}
          onClose={() => setShowItinForm(false)}
        />
      )}

      {/* Budget form overlay — per member */}
      {showBudgetForm && editBudgetMemberId && (
        <BudgetForm
          memberId={editBudgetMemberId}
          memberBudget={memberBudgets[editBudgetMemberId] || 50000}
          expenses={expenses}
          onClose={() => { setShowBudgetForm(false); setEditBudgetMemberId(null); }}
          onSave={handleSaveMemberBudget}
        />
      )}

      {/* Stay form overlay */}
      {showStayForm && (
        <StayForm
          stay={editStay}
          onClose={() => { setShowStayForm(false); setEditStay(null); }}
          onSave={handleSaveStay}
          onDelete={editStay ? handleDeleteStay : null}
        />
      )}

      {/* Split overlay */}
      {showSplit && (
        <ScreenSplit expenses={expenses} onClose={()=>setShowSplit(false)}/>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
