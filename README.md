# Lokomoto Centar — Giveaway prijava (funnel)

Multi-step forma za giveaway prijavu. Stil preslikan iz `lokomoto-quiz-frontend`
(Instrument Sans, teal `#16a29d`, iste kartice/dugmad). Čist vanilla JS, bez build koraka.

## Pokretanje lokalno
Otvori `index.html` preko bilo kog static servera, npr:
```
npx serve .
```

## Struktura
- `index.html` — container + učitavanje skripti
- `styles.css` — bazni stil (kopija iz starog kviza)
- `styles.extra.css` — dodaci (welcome hero, upload, saglasnosti, thank-you…)
- `js/state.js` — drži odgovore, istoriju ekrana, UTM, priloženi MRI fajl
- `js/api.js` — slanje payloada na Make.com webhook
- `js/questions.js` — **ceo tok forme** (ovde se menjaju pitanja/opcije/redosled)
- `js/form.js` — engine: renderuje svaki tip step-a, validacija, navigacija, slanje

Pitanja se menjaju isključivo u `js/questions.js` (`STEPS` niz). Tipovi step-ova:
`contact`, `date`, `text`, `textarea`, `radio`, `checkbox`, `scale`, `mri`, `consent`.

## Slanje podataka
Na kraju forme šalje se jedan `POST` (JSON) na Make.com webhook
(`hook.eu1.make.com/…udil`, definisan u `js/api.js`).

### Polja u payload-u (kolone za Google Sheets)
`submitted_at`, `source`, `ime_prezime`, `email`, `telefon`, `datum_rodjenja`,
`problemi`, `trajanje_problema`, `jacina_bola`, `opis_simptoma`, `ima_mr_snimak`,
`nalaz`, `probane_terapije`, `sta_je_pomoglo`, `zeljeni_rezultat`, `stopalo_pada`,
`kontrola_mokrenja`, `temperatura_gubitak_tezine`, `trauma`, `trauma_opis`,
`terapija_lekara`, `moze_dolaziti_3x`, `saglasnost_dolasci`,
`saglasnost_dokumentovanje`, `saglasnost_edukativni`,
`mr_snimak_fajl_ime`, `mr_snimak_fajl_tip`, `mr_snimak_fajl_base64`,
`utm` (objekat), `device_type`, `referrer`, `user_agent`.

- Checkbox pitanja (`problemi`, `nalaz`, `probane_terapije`, `sta_je_pomoglo`,
  `zeljeni_rezultat`) dolaze kao string spojen sa `, `. Ako je čekiran „Ostalo",
  umesto reči „Ostalo" šalje se upisani tekst.
- `jacina_bola` je broj 1–10 (kao string).

### MRI snimak → Google Drive → link u Sheets (Make scenario)
Fajl je opcioni i šalje se kao base64 u `mr_snimak_fajl_base64` (limit 5MB, slika/PDF).
U Make scenariju:
1. **Webhook** (prima JSON).
2. **Router/Filter** (opciono): ako je `mr_snimak_fajl_base64` prazno → preskoči upload.
3. **Google Drive › Upload a File**:
   - File name: `{{mr_snimak_fajl_ime}}`
   - Data: mapiraj `mr_snimak_fajl_base64` (Make ga tretira kao base64 sadržaj fajla)
4. **Google Drive › (opciono) Share / Get link** → uzmi `webViewLink`.
5. **Google Sheets › Add a Row**: mapiraj sva polja; u kolonu „MRI snimak" stavi
   link iz koraka 4 (ako fajla nema, ostavi prazno).

## Napomene
- Sva pitanja su obavezna osim: prilog MRI snimka i `trauma_opis` (opis povrede).
- Referral logika (P.S. na thank-you ekranu) dolazi naknadno.
