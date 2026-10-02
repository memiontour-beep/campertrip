# CamperTrip 0.2 — APK

Questo progetto è configurato per EAS Build con un profilo `preview` che produce un APK Android installabile direttamente sul dispositivo.

Configurazione:
- App: CamperTrip
- Versione: 0.2.0
- Android package: com.campertrip.app
- Build profile: preview
- Artifact: APK

Comando EAS:
`eas build --platform android --profile preview`

La build viene eseguita nel cloud da EAS Build. Al termine, EAS fornisce un link per scaricare l'APK e installarlo sul dispositivo Android.
