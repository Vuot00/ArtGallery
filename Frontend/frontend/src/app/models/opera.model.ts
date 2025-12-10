export interface Opera {
  id?: number;
  titolo: string;
  descrizione: string;
  prezzo: number;
  immagineUrl: string;
  anno?: number;
  stato: string;

  immagini: {
    id: number;
    url: string;
  }[];

  // Se il backend manda anche l'artista:
  artista?: {
    id: number;
    nome: string;
  };
}

/**
 * Definisce un'interfaccia TypeScript. Serve a tipizzare i dati lato Frontend. Garantisce che
 * il codice Angular tratti i dati ricevuti dalle API REST (che sono JSON non tipizzati) come oggetti
 * strutturati (Opera), permettendo all'IDE di aiutarci con l'autocompletamento e di segnalare errori
 * se proviamo ad accedere a campi inesistenti. Rispecchia la struttura dei DTO o delle Entità inviate
 * dal Controller Spring Boot.
 */