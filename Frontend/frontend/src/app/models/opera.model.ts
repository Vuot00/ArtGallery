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
