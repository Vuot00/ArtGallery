# ArtGallery - Galleria d'Arte Virtuale 
## Descrizione del Progetto

ArtGallery è un'applicazione web enterprise che digitalizza il concetto tradizionale di galleria d'arte. Offre una piattaforma completa per la gestione, l'esposizione e la commercializzazione di opere d'arte, eliminando gli intermediari tradizionali e permettendo agli artisti di raggiungere un pubblico globale.

L'applicazione offre un'esperienza completa che va oltre la semplice vetrina online. Gli artisti possono caricare opere ad alta risoluzione (dipinti, sculture, fotografie, ecc.) complete di metadati dettagliati come descrizione, tecnica, data, dimensioni e storia.

## Target Utenti

Il sistema si rivolge principalmente a due categorie di utenti:

 - Artisti: Possono creare la propria galleria virtuale, gestire il proprio portfolio e vendere autonomamente le proprie opere.
 - Appassionati d'Arte e Collezionisti: Possono scoprire nuovi talenti, esplorare collezioni e acquistare opere.

## Funzionalità Chiave

La piattaforma implementa le seguenti funzionalità chiave per supportare un ecosistema di vendita d'arte completo:

### Gestione Gallerie Artisti:

 - Upload di opere ad alta risoluzione.
 - Gestione di informazioni dettagliate e metadati per ogni opera (descrizione, tecnica, data di creazione, dimensioni, storia).

### Doppia Modalità di Vendita:

 - Prezzo Fisso: Per l'acquisto immediato di opere.
 - Aste Online: Per la vendita di opere tramite sessioni di offerte competitive.

### Sistema di Offerte in Tempo Reale:

 - Le offerte sulle pagine delle aste si aggiornano dinamicamente per tutti gli utenti connessi.
 - L'aggiornamento è istantaneo alla ricezione di una nuova offerta, senza che l'utente debba ricaricare la pagina manualmente.

### Notifiche Istantanee Multi-Canale:

 - Sulla Piattaforma: Avvisi in-app (es. badge, pop-up) quando un'offerta viene superata.
 - Via Email: Invio automatico di email quando un'offerta viene superata o quando un'asta a cui l'utente partecipa è in procinto di scadere.

### Integrazione Gateway di Pagamento (es. Stripe/PayPal):

 - Gestione completa del ciclo di vita della transazione.
 - Acquisto immediato per opere a prezzo fisso.
 - Saldo delle aste vinte da parte dei collezionisti.
 - Gestione sicura dei dati di pagamento.
 - Gestione di stati di pagamento asincroni (riuscito, fallito, rimborsato) tramite la configurazione di API e webhook.

### Stack Tecnologico e Architettura

Per realizzare le specifiche del progetto, vengono impiegate le seguenti tecnologie e pattern architetturali, coreografati per rispondere a requisiti complessi di real-time e gestione asincrona.

 - Architettura MVC
    - Pattern architetturale fondamentale
    - Separa la logica di business, l'interfaccia utente e la gestione delle richieste per uno sviluppo strutturato e manutenibile.

 - Angular
    - View
    - Costruisce l'interfaccia utente reattiva. Gestisce la visualizzazione dinamica dei dati ricevuti dai WebSockets (offerte) e l'integrazione con i form di pagamento sicuri lato client.

 - JPA e Transazioni
    - Model
    - Gestisce la mappatura O/R e l'accesso ai dati. Le transazioni sono critiche per garantire l'integrità dei dati (es. inserimento offerta e aggiornamento prezzo devono essere atomici; l'aggiornamento dello stato dell'ordine via webhook deve essere transazionale).

 - WebSockets
    - Real-Time Communication
    - Tecnologia chiave per il Sistema di offerte in tempo reale. Stabilisce una connessione persistente tra server e client, permettendo al server di inviare "push" di dati (nuove offerte) a tutti gli utenti sull'asta senza ricaricare la pagina.

 - API Gateway
    - Gestione Pagamenti
    - Avvia le transazioni sicure per gli acquisti a prezzo fisso e il saldo delle aste.

 - Webhook
    - Gestione Pagamenti Asincroni
    - Cruciali per l'Integrazione del Gateway. Il server riceve notifiche asincrone (pagamento riuscito/fallito) dal provider esterno per aggiornare lo stato dell'ordine in modo sicuro e affidabile. Servizi Email Transazionali

 - Notifiche
    - Utilizzati dalla logica di backend (attivati da eventi) per implementare le Notifiche istantanee via email (es. offerta superata).
