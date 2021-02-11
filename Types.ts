export interface GameState {
  timestamp: number;
  players: Player[];
}

export interface Player {
  id: number;
  score: number;
  balance: number;
  location: {
    x: number;
    y: number;
  };
}

export interface Server {
  name: string;
  url: string;
  port: string;
}

export interface ServerWithId extends Server {
  id: number;
}
