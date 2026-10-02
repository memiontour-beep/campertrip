import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CATEGORIES = [
  { id: 'fuel', label: 'Carburante', emoji: '⛽', color: '#FF9F43' },
  { id: 'food', label: 'Spesa', emoji: '🛒', color: '#2DBE83' },
  { id: 'camping', label: 'Campeggi', emoji: '🏕️', color: '#5B8DEF' },
  { id: 'restaurant', label: 'Ristoranti', emoji: '🍝', color: '#EF6A6A' },
  { id: 'activities', label: 'Attività', emoji: '⭐', color: '#8B6DEB' },
  { id: 'tolls', label: 'Pedaggi', emoji: '🛣️', color: '#F3B72F' },
  { id: 'other', label: 'Altro', emoji: '•••', color: '#87929D' },
];

const seedTrips = [
  {
    id: 'current-demo', name: 'Dolomiti — Autunno 2026', destination: 'Trentino Alto Adige', start: '25/09/2026', end: '04/10/2026', budget: 1200, distance: 0, status: 'current',
    fuelings: [
      { id: 'f1', amount: 78, liters: 48, pricePerLiter: 1.63, km: 380, date: '27/09/2026', place: 'Bolzano', note: '' },
      { id: 'f2', amount: 74, liters: 47, pricePerLiter: 1.57, km: 420, date: '01/10/2026', place: 'Cortina', note: '' },
    ],
    expenses: [
      { id: 'ce1', amount: 78, category: 'fuel', date: '27/09/2026', place: 'Bolzano', note: 'Rifornimento', fuelId: 'f1' },
      { id: 'ce2', amount: 74, category: 'fuel', date: '01/10/2026', place: 'Cortina', note: 'Rifornimento', fuelId: 'f2' },
      { id: 'ce3', amount: 118, category: 'food', date: '28/09/2026', place: 'Brunico', note: 'Spesa' },
      { id: 'ce4', amount: 90, category: 'camping', date: '29/09/2026', place: 'San Candido', note: 'Area sosta' },
      { id: 'ce5', amount: 65, category: 'restaurant', date: '30/09/2026', place: 'Cortina', note: 'Cena' },
      { id: 'ce6', amount: 45, category: 'activities', date: '01/10/2026', place: 'Tre Cime', note: 'Parcheggio + navetta' },
      { id: 'ce7', amount: 25, category: 'tolls', date: '26/09/2026', place: 'Autostrada', note: 'Pedaggio' },
    ],
  },
  {
    id: 'past-1', name: 'Francia — Estate 2024', destination: 'Francia', start: '08/07/2024', end: '19/07/2024', budget: 1500, distance: 2340, status: 'past',
    expenses: [
      { id: 'e1', amount: 412, category: 'fuel', date: '14/07/2024', place: 'Francia', note: 'Rifornimenti' },
      { id: 'e2', amount: 248, category: 'food', date: '15/07/2024', place: 'Francia', note: 'Spesa' },
      { id: 'e3', amount: 201, category: 'camping', date: '16/07/2024', place: 'Francia', note: 'Area sosta' },
      { id: 'e4', amount: 193, category: 'restaurant', date: '17/07/2024', place: 'Nizza', note: 'Cena' },
      { id: 'e5', amount: 124, category: 'activities', date: '18/07/2024', place: 'Nizza', note: 'Museo' },
      { id: 'e6', amount: 76, category: 'tolls', date: '19/07/2024', place: 'Autostrada', note: 'Pedaggi' },
      { id: 'e7', amount: 30, category: 'other', date: '19/07/2024', place: 'Francia', note: 'Altro' },
    ],
  },
  {
    id: 'past-2', name: 'Sardegna — Primavera 2024', destination: 'Sardegna', start: '10/04/2024', end: '24/04/2024', budget: 1800, distance: 2800, status: 'past', expenses: []
  },
  {
    id: 'past-3', name: 'Dolomiti — Autunno 2023', destination: 'Dolomiti', start: '05/10/2023', end: '14/10/2023', budget: 1200, distance: 1200, status: 'past', expenses: []
  },
  {
    id: 'next-1', name: 'Dolomiti', destination: 'Trentino Alto Adige', start: '12/07/2025', end: '20/07/2025', budget: 1200, distance: 900, status: 'next', expenses: []
  },
  {
    id: 'next-2', name: 'Sardegna', destination: 'Sardegna', start: '10/08/2025', end: '24/08/2025', budget: 1800, distance: 2800, status: 'next', expenses: []
  },
  {
    id: 'next-3', name: 'Provenza', destination: 'Francia', start: '05/09/2025', end: '14/09/2025', budget: 1500, distance: 1100, status: 'next', expenses: []
  },
];

function money(n) { return `€ ${Number(n || 0).toFixed(2).replace('.', ',')}`; }
function totalOf(trip) { return (trip.expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0); }
function categoryTotal(trip, id) { return (trip.expenses || []).filter(e => e.category === id).reduce((s, e) => s + Number(e.amount || 0), 0); }

export default function App() {
  const [trips, setTrips] = useState(seedTrips);
  const [tab, setTab] = useState('home');
  const [selectedTripId, setSelectedTripId] = useState('past-1');
  const [modal, setModal] = useState(null);
  const [newTrip, setNewTrip] = useState({ name: '', destination: '', start: '', end: '', budget: '' });
  const [newExpense, setNewExpense] = useState({ amount: '', category: 'food', date: '', place: '', note: '' });
  const [newFuel, setNewFuel] = useState({ amount: '', liters: '', pricePerLiter: '', km: '', date: '', place: '', note: '' });

  useEffect(() => {
    AsyncStorage.getItem('campertrip-data').then(raw => { if (raw) setTrips(JSON.parse(raw)); });
  }, []);
  useEffect(() => { AsyncStorage.setItem('campertrip-data', JSON.stringify(trips)); }, [trips]);

  const currentTrip = trips.find(t => t.status === 'current');
  const selectedTrip = trips.find(t => t.id === selectedTripId) || currentTrip || trips.find(t => t.status === 'past');
  const nextTrips = trips.filter(t => t.status === 'next');
  const pastTrips = trips.filter(t => t.status === 'past');

  function openTrip(trip) { setSelectedTripId(trip.id); setTab(trip.status === 'past' ? 'past' : 'next'); }
  function startTrip(id) {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status: 'current' } : (t.status === 'current' ? { ...t, status: 'past' } : t)));
    setSelectedTripId(id); setTab('current');
  }
  function saveTrip() {
    if (!newTrip.name.trim()) return Alert.alert('Manca il nome', 'Inserisci un nome per il viaggio.');
    const trip = { id: `trip-${Date.now()}`, name: newTrip.name, destination: newTrip.destination, start: newTrip.start, end: newTrip.end, budget: Number(newTrip.budget || 0), distance: 0, status: 'next', expenses: [] };
    setTrips(prev => [trip, ...prev]); setNewTrip({ name: '', destination: '', start: '', end: '', budget: '' }); setModal(null);
  }
  function openExpense(category = 'food') {
    setNewExpense({ amount: '', category, date: new Date().toLocaleDateString('it-IT'), place: '', note: '' });
    setModal('expense');
  }
  function saveExpense() {
    const amount = Number(newExpense.amount.replace(',', '.'));
    if (!amount) return Alert.alert('Inserisci un importo');
    if (!currentTrip) return;
    const expense = { id: `expense-${Date.now()}`, ...newExpense, amount };
    setTrips(prev => prev.map(t => t.id === currentTrip.id ? { ...t, expenses: [expense, ...(t.expenses || [])] } : t));
    setNewExpense({ amount: '', category: 'food', date: '', place: '', note: '' }); setModal(null);
  }
  function saveFuel() {
    const amount = Number(newFuel.amount.replace(',', '.'));
    const liters = Number(newFuel.liters.replace(',', '.'));
    const pricePerLiter = Number(newFuel.pricePerLiter.replace(',', '.')) || (liters ? amount / liters : 0);
    const km = Number(newFuel.km.replace(',', '.'));
    if (!amount || !liters) return Alert.alert('Completa il rifornimento', 'Inserisci importo e litri.');
    if (!currentTrip) return;
    const fueling = { id: `fuel-${Date.now()}`, amount, liters, pricePerLiter, km, date: newFuel.date || new Date().toLocaleDateString('it-IT'), place: newFuel.place, note: newFuel.note };
    const expense = { id: `expense-${Date.now() + 1}`, amount, category: 'fuel', date: fueling.date, place: fueling.place, note: newFuel.note || 'Rifornimento', fuelId: fueling.id };
    setTrips(prev => prev.map(t => t.id === currentTrip.id ? { ...t, expenses: [expense, ...(t.expenses || [])], fuelings: [fueling, ...(t.fuelings || [])] } : t));
    setNewFuel({ amount: '', liters: '', pricePerLiter: '', km: '', date: '', place: '', note: '' });
    setModal(null);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {tab === 'home' && <HomeScreen nextTrips={nextTrips} currentTrip={currentTrip} pastTrips={pastTrips} onNext={() => setTab('next')} onCurrent={() => setTab('current')} onPast={() => setTab('past')} onOpen={openTrip} />}
          {tab === 'next' && <NextScreen trips={nextTrips} onOpen={openTrip} onAdd={() => setModal('trip')} onStart={startTrip} />}
          {tab === 'current' && <CurrentScreen trip={currentTrip} onAdd={openExpense} onFuel={() => { setNewFuel({ amount: '', liters: '', pricePerLiter: '', km: '', date: new Date().toLocaleDateString('it-IT'), place: '', note: '' }); setModal('fuel'); }} />}
          {tab === 'past' && <PastScreen trips={pastTrips} selected={selectedTrip} onOpen={setSelectedTripId} />}
          {tab === 'settings' && <SettingsScreen />}
        </ScrollView>
        <BottomNav tab={tab} setTab={setTab} />
      </View>

      <Modal visible={modal === 'trip'} animationType="slide" transparent onRequestClose={() => setModal(null)}>
        <View style={styles.modalBackdrop}><View style={styles.modalCard}>
          <Text style={styles.modalTitle}>✨ Nuovo viaggio</Text>
          <Field label="Nome" value={newTrip.name} onChangeText={v => setNewTrip({ ...newTrip, name: v })} placeholder="Es. Francia — Estate" />
          <Field label="Destinazione" value={newTrip.destination} onChangeText={v => setNewTrip({ ...newTrip, destination: v })} placeholder="Es. Provenza" />
          <View style={styles.row}><View style={{ flex: 1 }}><Field label="Partenza" value={newTrip.start} onChangeText={v => setNewTrip({ ...newTrip, start: v })} placeholder="12/07/2026" /></View><View style={{ width: 12 }} /><View style={{ flex: 1 }}><Field label="Rientro" value={newTrip.end} onChangeText={v => setNewTrip({ ...newTrip, end: v })} placeholder="20/07/2026" /></View></View>
          <Field label="Budget" value={newTrip.budget} onChangeText={v => setNewTrip({ ...newTrip, budget: v })} placeholder="1500" keyboardType="decimal-pad" />
          <Button label="Salva viaggio" onPress={saveTrip} /><Button label="Annulla" variant="ghost" onPress={() => setModal(null)} />
        </View></View>
      </Modal>

      <Modal visible={modal === 'expense'} animationType="slide" transparent onRequestClose={() => setModal(null)}>
        <View style={styles.modalBackdrop}><View style={styles.modalCard}>
          <Text style={styles.modalTitle}>➕ Nuova spesa</Text>
          <Field label="Importo" value={newExpense.amount} onChangeText={v => setNewExpense({ ...newExpense, amount: v })} placeholder="25,00" keyboardType="decimal-pad" />
          <Text style={styles.label}>Categoria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 12 }}>
            {CATEGORIES.filter(c => c.id !== 'fuel').map(c => <Pressable key={c.id} onPress={() => setNewExpense({ ...newExpense, category: c.id })} style={[styles.categoryChip, newExpense.category === c.id && { borderColor: c.color, backgroundColor: '#F2FBF8' }]}><Text>{c.emoji} {c.label}</Text></Pressable>)}
          </ScrollView>
          <Field label="Data" value={newExpense.date} onChangeText={v => setNewExpense({ ...newExpense, date: v })} placeholder="12/07/2026" />
          <Field label="Luogo" value={newExpense.place} onChangeText={v => setNewExpense({ ...newExpense, place: v })} placeholder="Es. Nizza" />
          <Field label="Nota" value={newExpense.note} onChangeText={v => setNewExpense({ ...newExpense, note: v })} placeholder="Es. cena, supermercato..." />
          <Button label="Salva spesa" onPress={saveExpense} /><Button label="Annulla" variant="ghost" onPress={() => setModal(null)} />
        </View></View>
      </Modal>

      <Modal visible={modal === 'fuel'} animationType="slide" transparent onRequestClose={() => setModal(null)}>
        <View style={styles.modalBackdrop}><View style={styles.modalCard}>
          <Text style={styles.modalTitle}>⛽ Rifornimento</Text>
          <View style={styles.quickStats}>
            <View style={styles.quickStat}><Text style={styles.quickStatLabel}>Prezzo/L</Text><Text style={styles.quickStatValue}>{newFuel.liters && newFuel.amount ? money(Number(newFuel.amount.replace(',', '.')) / Number(newFuel.liters.replace(',', '.'))) : '—'}</Text></View>
            <View style={styles.quickStat}><Text style={styles.quickStatLabel}>Km inseriti</Text><Text style={styles.quickStatValue}>{newFuel.km || '—'}</Text></View>
          </View>
          <View style={styles.row}><View style={{ flex: 1 }}><Field label="Importo" value={newFuel.amount} onChangeText={v => setNewFuel({ ...newFuel, amount: v })} placeholder="62,40" keyboardType="decimal-pad" /></View><View style={{ width: 12 }} /><View style={{ flex: 1 }}><Field label="Litri" value={newFuel.liters} onChangeText={v => setNewFuel({ ...newFuel, liters: v })} placeholder="38,5" keyboardType="decimal-pad" /></View></View>
          <Field label="Km percorsi dall'ultimo pieno" value={newFuel.km} onChangeText={v => setNewFuel({ ...newFuel, km: v })} placeholder="425" keyboardType="decimal-pad" />
          <Field label="Prezzo al litro (opzionale)" value={newFuel.pricePerLiter} onChangeText={v => setNewFuel({ ...newFuel, pricePerLiter: v })} placeholder="1,62" keyboardType="decimal-pad" />
          <Field label="Data" value={newFuel.date} onChangeText={v => setNewFuel({ ...newFuel, date: v })} placeholder="12/07/2026" />
          <Field label="Luogo" value={newFuel.place} onChangeText={v => setNewFuel({ ...newFuel, place: v })} placeholder="Es. Trento" />
          <Field label="Nota" value={newFuel.note} onChangeText={v => setNewFuel({ ...newFuel, note: v })} placeholder="Es. autostrada..." />
          <Button label="Salva rifornimento" onPress={saveFuel} /><Button label="Annulla" variant="ghost" onPress={() => setModal(null)} />
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

function HomeScreen({ nextTrips, currentTrip, pastTrips, onNext, onCurrent, onPast, onOpen }) {
  return <>
    <Text style={styles.brand}>CamperTrip <Text style={{ fontSize: 20 }}>☀️</Text></Text>
    <Text style={styles.tagline}>Le tue avventure, le tue spese.</Text>
    <View style={styles.hero}><Text style={styles.heroEmoji}>🚐</Text><Text style={styles.heroTitle}>Pronti a partire?</Text><Text style={styles.heroText}>Organizza il viaggio, registra le spese e scopri quanto ti è costata l’avventura.</Text></View>
    <HomeTile emoji="🗓️" title="Prossimi viaggi" text="Organizza la prossima avventura" onPress={onNext} />
    <HomeTile emoji="🚐" title="Viaggio in corso" text={currentTrip ? currentTrip.name : 'Nessun viaggio in corso'} onPress={onCurrent} />
    <HomeTile emoji="🕘" title="Viaggi passati" text={`${pastTrips.length} viaggi con resoconto`} onPress={onPast} />
    <Text style={styles.sectionTitle}>La prossima partenza</Text>
    {nextTrips[0] && <TripCard trip={nextTrips[0]} onPress={() => onOpen(nextTrips[0])} />}
  </>;
}

function NextScreen({ trips, onOpen, onAdd, onStart }) {
  return <><Header title="Prossimi viaggi" action="+" onAction={onAdd} /><Text style={styles.muted}>Organizza le tue prossime avventure.</Text>{trips.map(t => <TripCard key={t.id} trip={t} onPress={() => onOpen(t)} />)}{!trips.length && <Empty text="Nessun viaggio programmato." />}{trips[0] && <Button label="🚐  Inizia il prossimo viaggio" onPress={() => onStart(trips[0].id)} />}</>;
}

function CurrentScreen({ trip, onAdd, onFuel }) {
  if (!trip) return <Empty text="Non hai un viaggio in corso. Puoi iniziarne uno dalla sezione Prossimi." />;
  const total = totalOf(trip);
  const remaining = Math.max(0, trip.budget - total);
  const pct = trip.budget ? Math.min(100, total / trip.budget * 100) : 0;
  const fuelings = trip.fuelings || [];
  const fuelCost = fuelings.reduce((s, f) => s + Number(f.amount || 0), 0);
  const liters = fuelings.reduce((s, f) => s + Number(f.liters || 0), 0);
  const kms = fuelings.reduce((s, f) => s + Number(f.km || 0), 0);
  const consumption = liters && kms ? kms / liters : 0;
  const costPer100 = kms ? fuelCost / kms * 100 : 0;
  return <>
    <Header title="Viaggio in corso" />
    <View style={styles.tripHero}>
      <View style={styles.tripHeroTop}><View style={{ flex: 1 }}><Text style={styles.eyebrow}>🚐 ADESSO IN VIAGGIO</Text><Text style={styles.tripHeroTitle}>{trip.name}</Text><Text style={styles.muted}>{trip.destination} · {trip.start} — {trip.end}</Text></View><Text style={styles.tripHeroEmoji}>☀️</Text></View>
      <View style={styles.budgetMini}><Text style={styles.budgetMiniText}>{Math.round(pct)}% del budget usato</Text><Text style={styles.budgetMiniValue}>{money(total)} / {money(trip.budget)}</Text></View>
      <View style={styles.progress}><View style={[styles.progressFill, { width: `${pct}%` }]} /></View>
    </View>

    <View style={styles.statsRow}>
      <Stat label="Speso" value={money(total)} />
      <Stat label="Budget" value={money(trip.budget)} />
      <Stat label="Ti restano" value={money(remaining)} />
    </View>

    <Text style={styles.sectionTitle}>Cosa vuoi registrare?</Text>
    <View style={styles.quickGrid}>
      <QuickAction emoji="⛽" title="Rifornimento" subtitle="Litri + km" onPress={onFuel} color="#FFF1DE" />
      <QuickAction emoji="🛒" title="Spesa" subtitle="Supermercato" onPress={() => onAdd('food')} color="#EAF8F1" />
      <QuickAction emoji="🏕️" title="Sosta" subtitle="Campeggio / area" onPress={() => onAdd('camping')} color="#EAF1FF" />
      <QuickAction emoji="🍝" title="Ristorante" subtitle="Pranzo / cena" onPress={() => onAdd('restaurant')} color="#FFF0F0" />
    </View>
    <Button label="＋  Altra spesa" onPress={() => onAdd('other')} />

    <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Dove stanno andando i soldi?</Text><Text style={styles.sectionHint}>{money(total)} totali</Text></View>
    <View style={styles.categoryCard}>
      {CATEGORIES.map(c => { const value = categoryTotal(trip, c.id); const p = total ? value / total : 0; return <View key={c.id} style={styles.catRow}><View style={styles.catLabelWrap}><View style={[styles.catDot, { backgroundColor: c.color }]} /><Text style={styles.catName}>{c.label}</Text></View><View style={styles.catBar}><View style={[styles.catFill, { width: `${p * 100}%`, backgroundColor: c.color }]} /></View><Text style={styles.catValue}>{money(value)}</Text></View>; })}
    </View>

    <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>⛽ Carburante</Text><Text style={styles.sectionHint}>{fuelings.length} rifornimenti</Text></View>
    <View style={styles.fuelCard}>
      <View style={styles.fuelMetric}><Text style={styles.fuelMetricLabel}>Consumo medio</Text><Text style={styles.fuelMetricValue}>{consumption ? `${consumption.toFixed(1).replace('.', ',')} km/l` : '—'}</Text></View>
      <View style={styles.fuelMetric}><Text style={styles.fuelMetricLabel}>Costo / 100 km</Text><Text style={styles.fuelMetricValue}>{costPer100 ? money(costPer100) : '—'}</Text></View>
      <View style={styles.fuelMetric}><Text style={styles.fuelMetricLabel}>Km registrati</Text><Text style={styles.fuelMetricValue}>{kms ? kms.toLocaleString('it-IT') : '—'}</Text></View>
    </View>

    <Text style={styles.sectionTitle}>Ultime spese</Text>
    {(trip.expenses || []).slice(0, 5).map(e => <ExpenseRow key={e.id} expense={e} />)}
    {!trip.expenses?.length && <Empty text="Ancora nessuna spesa. La prima avventura è gratis! 😄" />}
  </>;
}
function PastScreen({ trips, selected, onOpen }) {
  return <>{selected ? <><Header title="Dettaglio viaggio" action="←" onAction={() => onOpen(null)} /><PastDetail trip={selected} /></> : <><Header title="Viaggi passati" /><Text style={styles.muted}>Tutti i tuoi viaggi, con il loro resoconto.</Text>{trips.map(t => <PastCard key={t.id} trip={t} onPress={() => onOpen(t.id)} />)}{!trips.length && <Empty text="Qui compariranno i tuoi viaggi conclusi." />}</>}</>;
}

function PastDetail({ trip }) {
  const total = totalOf(trip); const daily = total / Math.max(1, dateDiff(trip.start, trip.end));
  return <><View style={styles.pastHero}><Text style={styles.pastHeroEmoji}>🌅🚐</Text><Text style={styles.pastTitle}>{trip.name}</Text><Text style={styles.muted}>{trip.start} — {trip.end}</Text></View><View style={styles.statsRow}><Stat label="Totale speso" value={money(total)} /><Stat label="Media / giorno" value={money(daily)} /><Stat label="Km percorsi" value={trip.distance ? `${trip.distance}` : '—'} /></View><Text style={styles.sectionTitle}>Resoconto spese</Text>{CATEGORIES.map(c => { const value = categoryTotal(trip, c.id); const p = total ? value / total : 0; return <View key={c.id} style={styles.catRow}><Text style={styles.catName}>{c.emoji}  {c.label}</Text><View style={styles.catBar}><View style={[styles.catFill, { width: `${p * 100}%`, backgroundColor: c.color }]} /></View><Text style={styles.catValue}>{money(value)}</Text></View>; })}<Text style={styles.sectionTitle}>Tutte le spese</Text>{(trip.expenses || []).map(e => <ExpenseRow key={e.id} expense={e} />)}{!trip.expenses?.length && <Empty text="Questo viaggio non ha ancora spese registrate." />}</>;
}

function SettingsScreen() { return <><Header title="Impostazioni" /><Setting icon="🚐" title="Profilo veicolo" sub="Modello, consumi, targa" /><Setting icon="🏷️" title="Categorie di spesa" sub="Personalizza le categorie" /><Setting icon="📏" title="Unità e preferenze" sub="Km, litri, valuta" /><Setting icon="☁️" title="Backup e sincronizzazione" sub="Salva i tuoi dati" /><Setting icon="📤" title="Esporta dati" sub="PDF / Excel" /><Setting icon="ℹ️" title="Informazioni app" sub="CamperTrip 0.1.0" /></>; }

function Header({ title, action, onAction }) { return <View style={styles.header}><Text style={styles.headerTitle}>{title}</Text>{action && <Pressable onPress={onAction} style={styles.headerAction}><Text style={styles.headerActionText}>{action}</Text></Pressable>}</View>; }
function HomeTile({ emoji, title, text, onPress }) { return <Pressable onPress={onPress} style={styles.homeTile}><Text style={styles.tileEmoji}>{emoji}</Text><View style={{ flex: 1 }}><Text style={styles.tileTitle}>{title}</Text><Text style={styles.tileText}>{text}</Text></View><Text style={styles.arrow}>›</Text></Pressable>; }
function TripCard({ trip, onPress }) { const total = totalOf(trip); return <Pressable onPress={onPress} style={styles.card}><View style={styles.cardImage}><Text style={{ fontSize: 32 }}>{trip.destination?.includes('Sardegna') ? '🏝️' : trip.destination?.includes('Francia') ? '🌅' : '🏔️'}</Text></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{trip.name}</Text><Text style={styles.cardSub}>{trip.start} — {trip.end}</Text><Text style={styles.cardSub}>📍 {trip.destination}</Text><View style={styles.badge}><Text style={styles.badgeText}>Budget: {money(trip.budget)}</Text></View>{trip.status === 'past' && <Text style={styles.cardTotal}>Speso: {money(total)}</Text>}</View><Text style={styles.arrow}>›</Text></Pressable>; }
function PastCard({ trip, onPress }) { return <TripCard trip={trip} onPress={onPress} />; }
function QuickAction({ emoji, title, subtitle, onPress, color }) { return <Pressable onPress={onPress} style={styles.quickAction}><View style={[styles.quickActionIcon, { backgroundColor: color }]}><Text style={{ fontSize: 24 }}>{emoji}</Text></View><View style={{ flex: 1 }}><Text style={styles.quickActionTitle}>{title}</Text><Text style={styles.quickActionSub}>{subtitle}</Text></View><Text style={styles.quickActionArrow}>+</Text></Pressable>; }
function ExpenseRow({ expense }) { const c = CATEGORIES.find(x => x.id === expense.category) || CATEGORIES[6]; return <View style={styles.expenseRow}><View style={[styles.expenseIcon, { backgroundColor: c.color + '22' }]}><Text>{c.emoji}</Text></View><View style={{ flex: 1 }}><Text style={styles.expenseTitle}>{c.label}</Text><Text style={styles.expenseSub}>{expense.place || '—'} · {expense.date || '—'}{expense.note ? ` · ${expense.note}` : ''}</Text></View><Text style={styles.expenseAmount}>{money(expense.amount)}</Text></View>; }
function Stat({ label, value }) { return <View style={styles.stat}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>; }
function Setting({ icon, title, sub }) { return <View style={styles.setting}><Text style={styles.settingIcon}>{icon}</Text><View style={{ flex: 1 }}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.settingSub}>{sub}</Text></View><Text style={styles.arrow}>›</Text></View>; }
function Field({ label, ...props }) { return <View><Text style={styles.label}>{label}</Text><TextInput {...props} style={styles.input} placeholderTextColor="#9AA5AE" /></View>; }
function Button({ label, onPress, variant }) { return <Pressable onPress={onPress} style={[styles.button, variant === 'ghost' && styles.buttonGhost]}><Text style={[styles.buttonText, variant === 'ghost' && styles.buttonGhostText]}>{label}</Text></Pressable>; }
function Empty({ text }) { return <View style={styles.empty}><Text style={{ fontSize: 42 }}>🗺️</Text><Text style={styles.emptyTitle}>{text}</Text></View>; }
function BottomNav({ tab, setTab }) { const items = [['home','⌂','Home'],['next','🗓️','Prossimi'],['current','🚐','In corso'],['past','🕘','Passati'],['settings','⚙️','Altro']]; return <View style={styles.nav}>{items.map(([id, emoji, label]) => <Pressable key={id} onPress={() => setTab(id)} style={styles.navItem}><Text style={[styles.navEmoji, tab === id && styles.navActive]}>{emoji}</Text><Text style={[styles.navLabel, tab === id && styles.navActive]}>{label}</Text></Pressable>)}</View>; }
function dateDiff(a, b) { const parse = s => { const p = (s || '').split('/').map(Number); return p.length === 3 ? new Date(p[2], p[1] - 1, p[0]) : new Date(); }; return Math.max(1, Math.round((parse(b) - parse(a)) / 86400000) + 1); }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7FBFA' }, container: { flex: 1 }, scroll: { padding: 20, paddingBottom: 100 },
  brand: { fontSize: 34, fontWeight: '900', color: '#154B45', letterSpacing: -1.5, marginTop: 8 }, tagline: { fontSize: 15, color: '#71807D', marginBottom: 18 },
  hero: { backgroundColor: '#E6F7F1', borderRadius: 24, padding: 22, marginBottom: 18 }, heroEmoji: { fontSize: 56 }, heroTitle: { fontSize: 25, fontWeight: '900', color: '#174C45', marginTop: 8 }, heroText: { color: '#59706B', lineHeight: 21, marginTop: 5 },
  homeTile: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, backgroundColor: '#fff', marginBottom: 10, borderWidth: 1, borderColor: '#E5ECEA' }, tileEmoji: { fontSize: 30, marginRight: 14 }, tileTitle: { fontSize: 17, fontWeight: '800', color: '#20312E' }, tileText: { color: '#788580', marginTop: 3 }, arrow: { fontSize: 28, color: '#9AA5A2', marginLeft: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, marginBottom: 8 }, headerTitle: { fontSize: 28, fontWeight: '900', color: '#183B36', letterSpacing: -0.7 }, headerAction: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#DFF6ED', alignItems: 'center', justifyContent: 'center' }, headerActionText: { fontSize: 24, color: '#13785F' },
  muted: { color: '#788580', marginBottom: 16 }, sectionTitle: { fontSize: 19, fontWeight: '900', color: '#20312E', marginTop: 22, marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5ECEA' }, cardImage: { width: 72, height: 72, borderRadius: 16, backgroundColor: '#EAF7F4', alignItems: 'center', justifyContent: 'center', marginRight: 12 }, cardTitle: { fontSize: 17, fontWeight: '800', color: '#20312E' }, cardSub: { color: '#77837F', fontSize: 12, marginTop: 3 }, badge: { alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#ECF8F4', borderRadius: 8 }, badgeText: { color: '#16785F', fontSize: 11, fontWeight: '700' }, cardTotal: { fontSize: 12, color: '#1C765F', fontWeight: '800', marginTop: 4 },
  tripHero: { backgroundColor: '#E7F6F1', borderRadius: 22, padding: 18, marginTop: 10 }, tripHeroEmoji: { fontSize: 45 }, tripHeroTitle: { fontSize: 25, fontWeight: '900', color: '#184B44', marginTop: 6 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 12 }, stat: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#E6ECEA' }, statLabel: { fontSize: 11, color: '#84908D' }, statValue: { fontSize: 17, fontWeight: '900', color: '#1C4E46', marginTop: 4 },
  progress: { height: 10, borderRadius: 5, backgroundColor: '#E5ECEA', overflow: 'hidden' }, progressFill: { height: '100%', backgroundColor: '#20A77D', borderRadius: 5 },
  catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 }, catName: { width: 105, fontSize: 12, color: '#34423F' }, catBar: { flex: 1, height: 8, backgroundColor: '#EDF1F0', borderRadius: 4, overflow: 'hidden' }, catFill: { height: '100%', borderRadius: 4 }, catValue: { width: 74, textAlign: 'right', fontSize: 12, fontWeight: '800', color: '#34423F' },
  button: { backgroundColor: '#18A57B', borderRadius: 16, minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: 16 }, buttonText: { color: '#fff', fontWeight: '900', fontSize: 16 }, buttonGhost: { backgroundColor: 'transparent' }, buttonGhostText: { color: '#6C7975' },
  expenseRow: { backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E7ECEB' }, expenseIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 10 }, expenseTitle: { fontWeight: '800', color: '#25332F' }, expenseSub: { color: '#84908D', fontSize: 11, marginTop: 3 }, expenseAmount: { fontWeight: '900', color: '#253F39' },
  pastHero: { backgroundColor: '#EAF7F3', borderRadius: 22, padding: 18, marginTop: 10 }, pastHeroEmoji: { fontSize: 42 }, pastTitle: { fontSize: 23, fontWeight: '900', color: '#184B44', marginTop: 5 },
  setting: { backgroundColor: '#fff', borderRadius: 18, padding: 15, marginBottom: 9, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E7ECEB' }, settingIcon: { fontSize: 25, marginRight: 13 }, settingTitle: { fontWeight: '800', color: '#273632' }, settingSub: { color: '#87918E', fontSize: 12, marginTop: 2 },
  empty: { alignItems: 'center', justifyContent: 'center', padding: 40 }, emptyTitle: { textAlign: 'center', color: '#75817E', fontSize: 15, marginTop: 12, lineHeight: 22 },
  nav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 76, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5ECEA', flexDirection: 'row', justifyContent: 'space-around', paddingTop: 8 }, navItem: { alignItems: 'center', width: 70 }, navEmoji: { fontSize: 20, opacity: 0.45 }, navLabel: { fontSize: 10, color: '#87918E', marginTop: 3, fontWeight: '700' }, navActive: { color: '#14936E', opacity: 1 },
  tripHeroTop: { flexDirection: 'row', alignItems: 'center' }, eyebrow: { color: '#278B70', fontSize: 10, fontWeight: '900', letterSpacing: 0.8, marginBottom: 4 }, budgetMini: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, marginBottom: 8 }, budgetMiniText: { color: '#5F716C', fontSize: 12, fontWeight: '700' }, budgetMiniValue: { color: '#174C45', fontSize: 12, fontWeight: '900' }, tripHeroEmoji: { fontSize: 38, marginLeft: 8 }, sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, sectionHint: { color: '#8A9692', fontSize: 11, marginBottom: 12 }, quickGrid: { gap: 9 }, quickAction: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, padding: 12, borderWidth: 1, borderColor: '#E7ECEB' }, quickActionIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 12 }, quickActionTitle: { fontSize: 15, fontWeight: '900', color: '#25332F' }, quickActionSub: { color: '#89948F', fontSize: 11, marginTop: 2 }, quickActionArrow: { fontSize: 25, color: '#16A078', fontWeight: '700', paddingHorizontal: 6 }, categoryCard: { backgroundColor: '#fff', borderRadius: 18, padding: 15, borderWidth: 1, borderColor: '#E7ECEB' }, catLabelWrap: { width: 105, flexDirection: 'row', alignItems: 'center' }, catDot: { width: 7, height: 7, borderRadius: 4, marginRight: 7 }, fuelCard: { backgroundColor: '#FFF9EF', borderRadius: 18, padding: 15, flexDirection: 'row', borderWidth: 1, borderColor: '#F5E5C9' }, fuelMetric: { flex: 1 }, fuelMetricLabel: { fontSize: 10, color: '#8B806D', marginBottom: 4 }, fuelMetricValue: { fontSize: 14, fontWeight: '900', color: '#5B4C35' }, quickStats: { flexDirection: 'row', gap: 8, marginBottom: 4 }, quickStat: { flex: 1, backgroundColor: '#FFF9EF', borderRadius: 13, padding: 10 }, quickStatLabel: { fontSize: 10, color: '#8B806D' }, quickStatValue: { fontSize: 15, fontWeight: '900', color: '#5B4C35', marginTop: 2 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,30,27,0.38)', justifyContent: 'flex-end' }, modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 30, maxHeight: '92%' }, modalTitle: { fontSize: 25, fontWeight: '900', color: '#183B36', marginBottom: 10 }, label: { fontSize: 12, color: '#6F7B77', fontWeight: '800', marginBottom: 6, marginTop: 8 }, input: { borderWidth: 1, borderColor: '#DCE6E3', borderRadius: 14, height: 48, paddingHorizontal: 14, color: '#21332F', backgroundColor: '#FAFCFB' }, row: { flexDirection: 'row' }, categoryChip: { borderWidth: 1, borderColor: '#E0E8E5', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#fff' }
});
