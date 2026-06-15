// ============================================
// QUESTIONS CONFIG — Lokomoto Giveaway prijava
// Ceo tok forme. Svaki step ima `type` na osnovu kog ga form.js renderuje.
//
// Tipovi:
//   contact   — više input polja na jednom step-u (ime, email, telefon)
//   date      — datum rođenja
//   text      — kratak tekstualni input
//   textarea  — duži tekst (opis)
//   radio     — jedan izbor; auto-next osim ako ima conditionalInput koji se otvori
//   checkbox  — više izbora (multi-select); opciono "Ostalo" sa input poljem
//   scale     — slajder 1–10
//   mri       — radio + opcioni upload fajla na istom step-u
//   consent   — više Da/Ne pitanja na jednom step-u
//
// Polja:
//   id            — ključ u payload-u
//   required      — da li je obavezno (default true)
//   hasOther      — checkbox/radio: dodaj "Ostalo" opciju sa input poljem
//   autoNext      — radio: automatski pređi na sledeći (default true za radio)
//   conditional   — radio: { whenValue, label, id, required } → otvori input ispod
// ============================================

const Questions = (function() {

  const STEPS = [

    // 1. Kontakt — ime, email, telefon (jedan step)
    {
      id: 'kontakt',
      type: 'contact',
      title: 'Osnovni kontakt podaci',
      subtitle: null,
    },

    // 2. Datum rođenja
    {
      id: 'datum_rodjenja',
      type: 'date',
      title: 'Datum rođenja',
      subtitle: 'Pomaže nam da bolje procenimo tvoj slučaj.',
    },

    // 3. Problemi (multi + Ostalo)
    {
      id: 'problemi',
      type: 'checkbox',
      title: 'Selektuj koje probleme imaš',
      hasOther: true,
      options: [
        { value: 'Bol u donjem delu leđa' },
        { value: 'Bol u vratu i ramenina' },
        { value: 'Bol u srednjem delu leđa' },
        { value: 'Bol u leđima koji ide u zadnjicu' },
        { value: 'Bol koji ide niz nogu' },
        { value: 'Trnjenje u nozi' },
        { value: 'Slabost u nozi' },
        { value: 'Ukočenost u leđima' },
        { value: 'Bol koji ide niz ruku' },
      ],
    },

    // 4. Trajanje (radio, auto-next)
    {
      id: 'trajanje_problema',
      type: 'radio',
      title: 'Koliko dugo traje problem?',
      options: [
        { value: 'Manje od 2 nedelje' },
        { value: '1-3 meseca' },
        { value: '3–6 meseci' },
        { value: '6–12 meseci' },
        { value: 'Više od godinu dana' },
      ],
    },

    // 5. Jačina bola (scale 1–10)
    {
      id: 'jacina_bola',
      type: 'scale',
      title: 'Na skali od 1-10 koliko ti je bol jak?',
      min: 1,
      max: 10,
      minLabel: 'Slab bol',
      maxLabel: 'Jak bol',
    },

    // 6. Opis simptoma (textarea)
    {
      id: 'opis_simptoma',
      type: 'textarea',
      title: 'Kratko opiši simptome i kad ti se javljaju?',
      placeholder: 'Npr. bol se javlja ujutru i posle dužeg sedenja…',
    },

    // 7. MRI snimak (radio + opcioni upload, isti step)
    {
      id: 'ima_mr_snimak',
      type: 'mri',
      title: 'Da li imaš snimak magnetne rezonance?',
      options: [
        { value: 'Ne' },
        { value: 'Da (snimak star manje od 1 mesec)' },
        { value: 'Da (snimak star manje od 6 meseci)' },
        { value: 'Da (snimak star više od 1 godinu)' },
      ],
      upload: {
        label: 'Ukoliko imaš izveštaj sa magnetne rezonance možeš ovde da ga priložiš.',
        hint: 'Maksimalno 5MB. Slika ili PDF.',
      },
    },

    // 8. Šta piše u nalazu (multi, bez Ostalo)
    {
      id: 'nalaz',
      type: 'checkbox',
      title: 'Šta ti piše u nalazu, ako znaš?',
      options: [
        { value: 'Protruzija diska' },
        { value: 'Diskus hernija' },
        { value: 'Ekstruzija diska' },
        { value: 'Išijas / radikulopatija' },
        { value: 'Degenerativne promene' },
        { value: 'Suženje spinalnog kanala' },
        { value: 'Ne znam' },
        { value: 'Nemam nalaz' },
      ],
    },

    // 9. Probane terapije (multi + Ostalo)
    {
      id: 'probane_terapije',
      type: 'checkbox',
      title: 'Da li si da sada pokušao/la sa nekom od ovih terapija?',
      hasOther: true,
      options: [
        { value: 'Lekove' },
        { value: 'Injekcije' },
        { value: 'Masaže' },
        { value: 'Fizikalnu terapiju' },
        { value: 'Kiropraktiku' },
        { value: 'Vežbe sa interneta' },
        { value: 'Vežbe sa fizioterapeutom' },
        { value: 'Spinalnu dekompresiju' },
        { value: 'Mirovanje' },
        { value: 'Operaciju' },
        { value: 'Ništa do sada' },
      ],
    },

    // 10. Šta je pomoglo (multi + Ostalo)
    {
      id: 'sta_je_pomoglo',
      type: 'checkbox',
      title: 'Da li je nešto od ovoga pomoglo?',
      hasOther: true,
      options: [
        { value: 'Lekovi' },
        { value: 'Injekcije' },
        { value: 'Masaže' },
        { value: 'Fizikalna terapija' },
        { value: 'Kiropraktika' },
        { value: 'Vežbe sa interneta' },
        { value: 'Vežbe sa fizioterapeutom' },
        { value: 'Spinalna dekompresija' },
        { value: 'Mirovanje' },
        { value: 'Operacija' },
        { value: 'Ništa nije pomoglo' },
      ],
    },

    // 11. Željeni rezultat (multi + Ostalo)
    {
      id: 'zeljeni_rezultat',
      type: 'checkbox',
      title: 'Koji rezultat bi za tebe bio najveća pobeda posle 3 meseca?',
      hasOther: true,
      options: [
        { value: 'Da mogu da sedim bez bola' },
        { value: 'Da mogu normalno da hodam' },
        { value: 'Da mogu da radim bez straha' },
        { value: 'Da mogu da se vratim treningu' },
        { value: 'Da mogu da se savijem bez straha' },
        { value: 'Da mogu normalno da spavam' },
        { value: 'Da bol ne ide niz nogu' },
        { value: 'Da izbegnem operaciju, ako je moguće' },
      ],
    },

    // 12. Stopalo pada (Da/Ne, auto-next)
    {
      id: 'stopalo_pada',
      type: 'radio',
      title: 'Da li ti se desilo da stopalo „pada" ili da teško podižeš prste/stopalo?',
      options: [{ value: 'Da' }, { value: 'Ne' }],
    },

    // 13. Kontrola mokrenja (Da/Ne, auto-next)
    {
      id: 'kontrola_mokrenja',
      type: 'radio',
      title: 'Da li imaš problem sa kontrolom mokrenja ili stolice koji je počeo uz bol u leđima?',
      options: [{ value: 'Da' }, { value: 'Ne' }],
    },

    // 14. Temperatura / gubitak težine / noćni bol (Da/Ne, auto-next)
    {
      id: 'temperatura_gubitak_tezine',
      type: 'radio',
      title: 'Da li imaš temperaturu, neobjašnjiv gubitak težine ili konstantan noćni bol koji se ne menja promenom položaja?',
      options: [{ value: 'Da' }, { value: 'Ne' }],
    },

    // 15. Trauma (Da → otvara opcioni input; Ne → auto-next)
    {
      id: 'trauma',
      type: 'radio',
      title: 'Da li si imao/la ozbiljnu traumu, pad ili saobraćajnu nezgodu pre početka bola?',
      options: [{ value: 'Da' }, { value: 'Ne' }],
      conditional: {
        whenValue: 'Da',
        id: 'trauma_opis',
        label: 'Opiši povredu koju si imao',
        placeholder: 'Opiši šta se desilo…',
        required: false,
      },
    },

    // 16. Pod terapijom lekara (radio, auto-next)
    {
      id: 'terapija_lekara',
      type: 'radio',
      title: 'Da li si trenutno pod terapijom lekara ili čekaš operaciju?',
      options: [
        { value: 'Da' },
        { value: 'Ne' },
        { value: 'Imam zakazanu operaciju' },
      ],
    },

    // 17. Može li da dolazi 3x nedeljno (radio, auto-next)
    {
      id: 'moze_dolaziti_3x',
      type: 'radio',
      title: 'Da li možeš da dolaziš u Lokomoto Centar u Beogradu 3 puta nedeljno tokom 3 meseca trajanja programa?',
      subtitle: '(termin traje oko 1h)',
      options: [{ value: 'Da' }, { value: 'Ne' }],
    },

    // 18. Saglasnosti (3 Da/Ne pitanja na jednom step-u)
    {
      id: 'saglasnosti',
      type: 'consent',
      title: 'Još samo par potvrda',
      subtitle: 'Da bismo bili sigurni da si spreman/na za program.',
      questions: [
        {
          id: 'saglasnost_dolasci',
          text: 'Da li si saglasan/saglasna da, ako budeš izabran/a, redovno dolaziš na zakazane termine u Lokomoto Centar tokom 3 meseca?',
        },
        {
          id: 'saglasnost_dokumentovanje',
          text: 'Da li si saglasan/saglasna da se tvoj napredak dokumentuje kroz fotografije, kratke snimke, testove i rezultate?',
        },
        {
          id: 'saglasnost_edukativni',
          text: 'Da li si saglasan/saglasna da Lokomoto centar može da koristi deo tvog procesa kao edukativni sadržaj i prikaz rezultata?',
        },
      ],
    },

  ];


  return {
    STEPS,
    getTotal: () => STEPS.length,
  };

})();

console.log('[questions.js] učitan, broj step-ova:', Questions.getTotal());
