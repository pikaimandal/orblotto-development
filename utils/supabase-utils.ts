import { supabase } from '@/lib/supabase';
import type { User, Ticket, Draw, Transaction, TicketType } from '@/types/supabase';

// --- User Functions ---

/**
 * Get user profile by wallet address
 */
export async function getUserByWalletAddress(walletAddress: string): Promise<User | null> {
  // Normalize wallet address - strip out any dev mode text
  const normalizedWalletAddress = walletAddress
    .toLowerCase()
    .replace(/\s*\(dev\s*mode\)\s*/i, '')
    .trim();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .ilike('wallet_address', normalizedWalletAddress)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data;
}

/**
 * Create or update user profile
 */
export async function upsertUser(user: {
  id: string;
  wallet_address: string;
  username?: string;
}): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .upsert(user, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting user:', error);
    return null;
  }

  return data;
}

// --- Ticket Functions ---

/**
 * Get all ticket types
 */
export async function getTicketTypes(): Promise<TicketType[]> {
  const { data, error } = await supabase
    .from('ticket_types')
    .select('*')
    .order('price', { ascending: true });

  if (error) {
    console.error('Error fetching ticket types:', error);
    return [];
  }

  return data;
}

/**
 * Get tickets for a specific user
 */
export async function getUserTickets(userId: string): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from('tickets')
    .select('*, draw:draws(*), ticket_type:ticket_types(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user tickets:', error);
    return [];
  }

  return data;
}

/**
 * Purchase new tickets
 */
export async function purchaseTickets(
  userId: string,
  ticketTypeId: number,
  drawId: string,
  ticketNumbers: string[][],
  purchasePrice: number,
  currency: string,
  transactionHash?: string
): Promise<{ tickets: Ticket[], transaction: Transaction } | null> {
  // Start a transaction
  const { data, error } = await supabase.rpc('purchase_tickets', {
    p_user_id: userId,
    p_ticket_type_id: ticketTypeId,
    p_draw_id: drawId,
    p_ticket_numbers: ticketNumbers,
    p_purchase_price: purchasePrice,
    p_currency: currency,
    p_transaction_hash: transactionHash || null
  });

  if (error) {
    console.error('Error purchasing tickets:', error);
    return null;
  }

  return data;
}

// --- Draw Functions ---

/**
 * Get the current active draw
 */
export async function getCurrentDraw(): Promise<Draw | null> {
  const { data, error } = await supabase
    .from('draws')
    .select('*')
    .eq('status', 'pending')
    .order('draw_date', { ascending: true })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching current draw:', error);
    return null;
  }

  return data;
}

/**
 * Get past completed draws
 */
export async function getPastDraws(limit: number = 10): Promise<Draw[]> {
  const { data, error } = await supabase
    .from('draws')
    .select('*')
    .eq('status', 'completed')
    .order('draw_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching past draws:', error);
    return [];
  }

  return data;
}

// --- Transaction Functions ---

/**
 * Get transactions for a specific user
 */
export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user transactions:', error);
    return [];
  }

  return data;
}

/**
 * Create a new transaction
 */
export async function createTransaction(transaction: {
  user_id: string;
  ticket_id?: string;
  transaction_type: 'purchase' | 'winning' | 'refund';
  amount: number;
  currency: string;
  transaction_hash?: string;
  status?: 'pending' | 'completed' | 'failed';
}): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    return null;
  }

  return data;
} 