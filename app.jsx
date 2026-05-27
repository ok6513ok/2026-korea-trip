// app.jsx — main App: state, navigation, Firestore sync

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

// ─── Firestore helpers ──────────────────────────────────────
// Firestore stores object keys as strings; convert back to numbers for dayIdx
function normalizeItinItems(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const result = {};
  Object.keys(raw).forEach(k => { result[Number(k)] = raw[k]; });
  return result;
}

// Write a partial update to the trip document (merge mode)
function writeToFirestore(updates) {
  try {
    const sync = window.FirebaseSync;
    if (!sync || !sync.ready) return;
    sync.setDoc(sync.tripRef(), updates, { merge: true })
      .catch(e => console.warn('[FS write]', e));
  } catch(e) { console.warn('[FS]', e); }
}

function App() {
  const [tab, setTab] = useState(() => {
    const saved = lsGet('familyTrip_activeTab', 'home');
    return ['home','today','itinerary','expense','stay'].includes(saved) ? saved : 'home';
  });
  const [showAdd,      setShowAdd]      = useState(false);
  const [showSplit,    setShowSplit]    = useState(false);
  const [showItinForm, setShowItinForm] = useState(false);
  const [editExpense,  setEditExpense]  = useState(null);
  const [editItinItem, setEditItinItem] = useState(null);
  const [editItinDay,  setEditItinDay]  = useState(null);
  const [itineraryDay, setItineraryDay] = useState(TRIP.todayIndex);

  // ── expenses — localStorage persisted ──────────────────────
  const [expenses, setExpenses] = useState(() =>
    lsGet('familyTrip_expenses', EXPENSES_INIT)
  );
  useEffect(() => { lsSet('familyTrip_expenses', expenses); }, [expenses]);

  // ── 保存目前頁面 ─────────────────────────────────────────
  useEffect(() => { lsSet('familyTrip_activeTab', tab); }, [tab]);

  // ── per-member budgets — localStorage persisted ─────────────
  const [memberBudgets, setMemberBudgets] = useState(() => {
    const defaults = {};
    MEMBERS.forEach(m => { defaults[m.id] = 50000; });
    return lsGet('familyTrip_memberBudgets', defaults);
  });
  useEffect(() => { lsSet('familyTrip_memberBudgets', memberBudgets); }, [memberBudgets]);

  // ── stays — localStorage persisted ─────────────────────────
  const [stays, setStays] = useState(() =>
    lsGet('familyTrip_stays', STAYS.map(s => ({ ...s })))
  );
  useEffect(() => { lsSet('familyTrip_stays', stays); }, [stays]);

  // ── itinerary items — localStorage persisted ───────────────
  const [allItinItems, setAllItinItems] = useState(() => {
    const fallback = {};
    DAYS.forEach(d => { fallback[d.idx] = d.items.map(it => ({ ...it })); });
    return lsGet('familyTrip_itineraryItems', fallback);
  });
  useEffect(() => { lsSet('familyTrip_itineraryItems', allItinItems); }, [allItinItems]);

  // ── Firestore real-time sync ────────────────────────────────
  const fsReadyRef = useRef(false);
  const fsUnsubRef = useRef(null);

  useEffect(() => {
    const startSync = () => {
      try {
        const sync = window.FirebaseSync;
        if (!sync || !sync.ready) return;

        const tripRef = sync.tripRef();

        fsUnsubRef.current = sync.onSnapshot(tripRef, (snap) => {
          // Document does not exist yet: seed Firestore from localStorage
          if (!snap.exists()) {
            const fallbackItin = {};
            DAYS.forEach(d => { fallbackItin[d.idx] = d.items.map(it => ({ ...it })); });
            const memberDefaults = {};
            MEMBERS.forEach(m => { memberDefaults[m.id] = 50000; });
            const initData = {
              expenses:       lsGet('familyTrip_expenses',       EXPENSES_INIT),
              itineraryItems: lsGet('familyTrip_itineraryItems', fallbackItin),
              stays:          lsGet('familyTrip_stays',          STAYS.map(s => ({ ...s }))),
              memberBudgets:  lsGet('familyTrip_memberBudgets',  memberDefaults),
            };
            sync.setDoc(tripRef, initData).catch(e => console.warn('[FS seed]', e));
            fsReadyRef.current = true;
            console.info('[FS] 首次初始化，已將本地資料寫入 Firestore');
            return;
          }

          const data = snap.data();

          // First snapshot with existing data: replace local state with Firestore data
          if (!fsReadyRef.current) {
            fsReadyRef.current = true;
            if (data.expenses)       setExpenses(data.expenses);
            if (data.itineraryItems) setAllItinItems(normalizeItinItems(data.itineraryItems));
            if (data.stays)          setStays(data.stays);
            if (data.memberBudgets)  setMemberBudgets(data.memberBudgets);
            console.info('[FS] 從 Firestore 載入資料完成');
            return;
          }

          // Real-time update from another device (skip our own pending writes)
          if (!snap.metadata.hasPendingWrites) {
            if (data.expenses)       setExpenses(data.expenses);
            if (data.itineraryItems) setAllItinItems(normalizeItinItems(data.itineraryItems));
            if (data.stays)          setStays(data.stays);
            if (data.memberBudgets)  setMemberBudgets(data.memberBudgets);
          }
        }, err => console.warn('[FS snapshot error]', err));

      } catch(e) { console.warn('[FS startSync]', e); }
    };

    if (window.FirebaseSync && window.FirebaseSync.ready) {
      startSync();
    } else {
      window.addEventListener('firebase-ready', startSync, { once: true });
    }

    return () => { if (fsUnsubRef.current) fsUnsubRef.current(); };
  }, []);

  // ── budget form ─────────────────────────────────────────────
  const [showBudgetForm,     setShowBudgetForm]     = useState(false);
  const [editBudgetMemberId, setEditBudgetMemberId] = useState(null);

  const handleEditBudget = (memberId) => {
    setEditBudgetMemberId(memberId);
    setShowBudgetForm(true);
  };
  const handleSaveMemberBudget = (memberId, amount) => {
    setMemberBudgets(prev => {
      const next = { ...prev, [memberId]: amount };
      writeToFirestore({ memberBudgets: next });
      return next;
    });
    setShowBudgetForm(false);
    setEditBudgetMemberId(null);
  };

  // ── stay handlers ───────────────────────────────────────────
  const [showStayForm, setShowStayForm] = useState(false);
  const [editStay,     setEditStay]     = useState(null);

  const handleEditStay   = (stay) => { setEditStay(stay); setShowStayForm(true); };
  const handleSaveStay   = (newS) => {
    setStays(prev => {
      const next = editStay
        ? prev.map(s => s.id === newS.id ? newS : s)
        : [...prev, newS];
      writeToFirestore({ stays: next });
      return next;
    });
    setEditStay(null);
    setShowStayForm(false);
  };
  const handleDeleteStay = (id) => {
    setStays(prev => {
      const next = prev.filter(s => s.id !== id);
      writeToFirestore({ stays: next });
      return next;
    });
    setEditStay(null);
    setShowStayForm(false);
  };

  // ── itinerary handlers ──────────────────────────────────────
  const handleSaveItinItem = (item, dayIdx) => {
    setAllItinItems(prev => {
      const list = [...(prev[dayIdx] || [])];
      const idx  = list.findIndex(x => x.id === item.id);
      if (idx >= 0) list[idx] = item;
      else { list.push(item); list.sort((a, b) => a.time.localeCompare(b.time)); }
      const next = { ...prev, [dayIdx]: list };
      writeToFirestore({ itineraryItems: next });
      return next;
    });
  };

  const handleDeleteItinItem = (itemId, dayIdx) => {
    setAllItinItems(prev => {
      const next = { ...prev, [dayIdx]: (prev[dayIdx] || []).filter(x => x.id !== itemId) };
      writeToFirestore({ itineraryItems: next });
      return next;
    });
  };

  const handleOpenItinForm = (item, dayIdx) => {
    setEditItinItem(item || null);
    setEditItinDay(dayIdx ?? TRIP.todayIndex);
    setShowItinForm(true);
  };

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [tab]);

  const handleNav = (id) => {
    if (['home','today','itinerary','expense','stay'].includes(id)) {
      setTab(id);
    } else {
      if (id === 'sub-budget' || id === 'sub-split') setTab('expense');
      else if (['sub-tx','sub-mem','sub-saved','sub-set'].includes(id)) setTab('itinerary');
    }
  };

  const handleEditExpense = (e) => { setEditExpense(e); setShowAdd(true); };

  const handleAddExpense = (newE) => {
    setExpenses(prev => {
      const next = editExpense
        ? prev.map(e => e.id === newE.id ? newE : e)
        : [...prev, newE];
      writeToFirestore({ expenses: next });
      return next;
    });
    setEditExpense(null);
    setShowAdd(false);
    setTab('expense');
  };

  const handleDeleteExpense = (id) => {
    setExpenses(prev => {
      const next = prev.filter(e => e.id !== id);
      writeToFirestore({ expenses: next });
      return next;
    });
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
    stay:      { sub: 'STAY',                title: '住宿資訊' },
  }[t]);

  const tb = topBarFor(tab);

  let content;
  if (tab === 'home') {
    content = <ScreenDashboard
      expenses={expenses} memberBudgets={memberBudgets}
      onNav={handleNav} onAddExpense={() => setShowAdd(true)}
      todayItems={allItinItems[TRIP.todayIndex] || []}
    />;
  } else if (tab === 'today') {
    content = <ScreenToday expenses={expenses} todayItems={allItinItems[TRIP.todayIndex] || []}/>;
  } else if (tab === 'itinerary') {
    content = <ScreenItinerary
      initialDay={itineraryDay}
      allItemsExt={allItinItems}
      onSaveItemExt={handleSaveItinItem}
      onDeleteItemExt={handleDeleteItinItem}
      onOpenEditForm={handleOpenItinForm}
    />;
  } else if (tab === 'expense') {
    content = <ScreenExpense
      expenses={expenses}
      memberBudgets={memberBudgets}
      onAddExpense={() => setShowAdd(true)}
      onViewSplit={() => setShowSplit(true)}
      onEditExpense={handleEditExpense}
      onEditBudget={handleEditBudget}
    />;
  } else if (tab === 'stay') {
    content = <ScreenStay stays={stays} onEditStay={handleEditStay} onDeleteStay={handleDeleteStay}/>;
  }

  const showFab        = tab === 'itinerary' || tab === 'expense' || tab === 'stay';
  const fabIsItinerary = tab === 'itinerary';
  const fabIsStay      = tab === 'stay';

  return (
    <div style={{
      position: 'fixed', top: 0, bottom: 0, left: 0, right: 0,
      maxWidth: 430, margin: '0 auto',
      background: T.bg, fontFamily: T.font,
      overflow: 'hidden',
    }}>
      <TopBar title={tb.title} sub={tb.sub}/>

      <AppShell scrollRef={scrollRef}>
        {content}
      </AppShell>

      {showFab && !showAdd && !showItinForm && !showStayForm && !showBudgetForm && (
        <FAB
          onClick={() => fabIsItinerary ? handleOpenItinForm(null, itineraryDay) : fabIsStay ? setShowStayForm(true) : setShowAdd(true)}
          label={fabIsItinerary ? '新增行程' : fabIsStay ? '新增住宿' : '新增消費'}
        />
      )}

      {!showAdd && !showItinForm && !showStayForm && !showBudgetForm && (
        <BottomNav active={tab} onChange={handleNav}/>
      )}

      {showAdd && (
        <ScreenAddExpense
          onClose={() => { setShowAdd(false); setEditExpense(null); }}
          onSave={handleAddExpense}
          onDelete={handleDeleteExpense}
          editExpense={editExpense}
        />
      )}

      {showItinForm && (
        <ItineraryForm
          item={editItinItem}
          dayIdx={editItinDay ?? (tab === 'itinerary' ? itineraryDay : TRIP.todayIndex)}
          onSave={(item) => {
            const targetDay = item.dayIdx ?? editItinDay ?? (tab === 'itinerary' ? itineraryDay : TRIP.todayIndex);
            const oldDay    = editItinItem ? (editItinItem.dayIdx ?? editItinDay ?? targetDay) : targetDay;
            if (editItinItem && oldDay !== targetDay) {
              handleDeleteItinItem(editItinItem.id, oldDay);
            }
            handleSaveItinItem(item, targetDay);
            setShowItinForm(false);
            setEditItinItem(null);
            setEditItinDay(null);
          }}
          onDelete={editItinItem ? () => {
            const oldDay = editItinItem.dayIdx ?? editItinDay ?? (tab === 'itinerary' ? itineraryDay : TRIP.todayIndex);
            handleDeleteItinItem(editItinItem.id, oldDay);
            setShowItinForm(false);
            setEditItinItem(null);
            setEditItinDay(null);
          } : null}
          onClose={() => {
            setShowItinForm(false);
            setEditItinItem(null);
            setEditItinDay(null);
          }}
        />
      )}

      {showBudgetForm && editBudgetMemberId && (
        <BudgetForm
          memberId={editBudgetMemberId}
          memberBudget={memberBudgets[editBudgetMemberId] || 50000}
          expenses={expenses}
          onClose={() => { setShowBudgetForm(false); setEditBudgetMemberId(null); }}
          onSave={handleSaveMemberBudget}
        />
      )}

      {showStayForm && (
        <StayForm
          stay={editStay}
          onClose={() => { setShowStayForm(false); setEditStay(null); }}
          onSave={handleSaveStay}
          onDelete={editStay ? handleDeleteStay : null}
        />
      )}

      {showSplit && (
        <ScreenSplit expenses={expenses} e={() => setShowSplit(false)}/>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
