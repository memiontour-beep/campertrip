# CamperTrip — MVP 0.2

App mobile per organizzare i viaggi in camper e tenere sotto controllo le spese, con funzionamento offline.

## Novità 0.2 — Viaggio in corso
- Dashboard operativa del viaggio attivo
- Budget utilizzato con barra di avanzamento
- Totale speso, budget residuo e percentuale utilizzata
- Azioni rapide per Rifornimento, Spesa, Sosta e Ristorante
- Inserimento rifornimenti con importo, litri, prezzo/litro e km percorsi
- Calcolo automatico di consumo medio (km/l) e costo per 100 km
- Riepilogo grafico delle spese per categoria
- Lista delle ultime spese
- Dati persistenti in locale con AsyncStorage
- Dati demo inclusi per vedere subito la schermata del viaggio in corso

## Stack
- Expo + React Native
- AsyncStorage
- Nessun backend nel primo MVP

## Avvio
1. Installa Node.js LTS.
2. Nella cartella del progetto esegui `npm install`.
3. Esegui `npx expo start`.
4. Scansiona il QR con Expo Go oppure apri un simulatore iOS/Android.

## Nota
Il progetto è un prototipo funzionante: la prossima iterazione può aggiungere modifica/eliminazione delle spese, calendario, tappe, foto degli scontrini e una gestione più completa del veicolo.
