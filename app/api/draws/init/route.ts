import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// This endpoint initializes a draw if there's no active draw
export async function POST() {
  try {
    // Check if there's already an active draw
    const { data: existingDraw, error: fetchError } = await supabase
      .from('draws')
      .select('*')
      .eq('status', 'pending')
      .order('draw_date', { ascending: true })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is the "no rows returned" error, which is expected if no draw exists
      return NextResponse.json(
        { error: 'Error checking for existing draw', details: fetchError },
        { status: 500 }
      );
    }

    // If there's already an active draw, return it
    if (existingDraw) {
      return NextResponse.json({ draw: existingDraw, created: false });
    }

    // Calculate draw date (7 days from now)
    const drawDate = new Date();
    drawDate.setDate(drawDate.getDate() + 7);
    
    // Create a new draw
    const { data: newDraw, error: insertError } = await supabase
      .from('draws')
      .insert({
        draw_date: drawDate.toISOString(),
        winning_numbers: [], // Will be populated when the draw is completed
        status: 'pending',
        prize_pool: 0,
        currency: 'USDC'
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: 'Error creating new draw', details: insertError },
        { status: 500 }
      );
    }

    return NextResponse.json({ draw: newDraw, created: true });
  } catch (error) {
    console.error('Error initializing draw:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 