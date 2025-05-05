import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const {
      userId,
      ticketTypeId,
      drawId,
      ticketNumbers,
      purchasePrice,
      currency,
      transactionHash
    } = body;

    // Validate required fields
    if (!userId || !ticketTypeId || !drawId || !ticketNumbers || !purchasePrice || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call the purchase_tickets stored procedure
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
      return NextResponse.json(
        { error: 'Error purchasing tickets', details: error },
        { status: 500 }
      );
    }

    // Update the prize pool for the draw
    // For this lottery, 60% of ticket sales go to the prize pool
    const prizePoolContribution = purchasePrice * 0.6;
    
    await supabase
      .from('draws')
      .update({
        prize_pool: supabase.rpc('increment', { x: prizePoolContribution })
      })
      .eq('id', drawId);

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error processing ticket purchase:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 