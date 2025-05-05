export type User = {
  id: string;
  wallet_address: string;
  username: string | null;
  created_at: string;
  updated_at: string;
}

export type TicketType = {
  id: number;
  name: string;
  price: number;
  description: string | null;
  created_at: string;
}

export type Draw = {
  id: string;
  draw_number: number;
  draw_date: string;
  winning_numbers: string[];
  status: 'pending' | 'completed' | 'cancelled';
  prize_pool: number;
  currency: string;
  created_at: string;
  completed_at: string | null;
}

export type Ticket = {
  id: string;
  user_id: string;
  draw_id: string;
  ticket_type_id: number;
  ticket_numbers: string[];
  purchase_price: number;
  currency: string;
  transaction_hash: string | null;
  is_winner: boolean;
  winnings: number;
  created_at: string;
}

export type Transaction = {
  id: string;
  user_id: string;
  ticket_id: string | null;
  transaction_type: 'purchase' | 'winning' | 'refund';
  amount: number;
  currency: string;
  transaction_hash: string | null;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  completed_at: string | null;
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      ticket_types: {
        Row: TicketType;
        Insert: Omit<TicketType, 'id' | 'created_at'>;
        Update: Partial<Omit<TicketType, 'id' | 'created_at'>>;
      };
      draws: {
        Row: Draw;
        Insert: Omit<Draw, 'id' | 'draw_number' | 'created_at'>;
        Update: Partial<Omit<Draw, 'id' | 'draw_number' | 'created_at'>>;
      };
      tickets: {
        Row: Ticket;
        Insert: Omit<Ticket, 'id' | 'is_winner' | 'winnings' | 'created_at'>;
        Update: Partial<Omit<Ticket, 'id' | 'user_id' | 'draw_id' | 'created_at'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at'>;
        Update: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>;
      };
    };
    Views: {
      public_draws: {
        Row: {
          draw_number: number;
          draw_date: string;
          winning_numbers: string[];
          status: 'completed';
          prize_pool: number;
          currency: string;
          completed_at: string;
        };
      };
    };
    Functions: {
      handle_new_user: {
        Args: Record<string, never>;
        Returns: unknown;
      };
    };
  };
}; 