export interface Opera {
  id?: number;
  titolo: string;
  descrizione: string;
  prezzo: number;
  immagineUrl: string;
  anno?: number;

  // Se il backend manda anche l'artista:
  artista?: {
    id: number;
    nome: string;
  };
}
