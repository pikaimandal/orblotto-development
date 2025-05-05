-- Create a stored procedure for purchasing tickets in a transaction
CREATE OR REPLACE FUNCTION purchase_tickets(
  p_user_id UUID,
  p_ticket_type_id INTEGER,
  p_draw_id UUID,
  p_ticket_numbers TEXT[][],
  p_purchase_price DECIMAL,
  p_currency TEXT,
  p_transaction_hash TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_transaction_id UUID;
  v_ticket_ids UUID[];
  v_ticket_id UUID;
  v_ticket_data JSON;
  v_transaction_data JSON;
  v_result JSON;
  v_ticket_numbers TEXT[];
BEGIN
  -- Begin the transaction
  BEGIN
    -- Create the transaction record first
    INSERT INTO transactions (
      user_id,
      transaction_type,
      amount,
      currency,
      transaction_hash,
      status
    ) VALUES (
      p_user_id,
      'purchase',
      p_purchase_price,
      p_currency,
      p_transaction_hash,
      CASE WHEN p_transaction_hash IS NULL THEN 'pending' ELSE 'completed' END
    )
    RETURNING id INTO v_transaction_id;

    -- Update the transaction completed_at if it's completed
    IF p_transaction_hash IS NOT NULL THEN
      UPDATE transactions
      SET completed_at = NOW()
      WHERE id = v_transaction_id;
    END IF;

    -- Create each ticket
    FOR i IN 1..array_length(p_ticket_numbers, 1) LOOP
      v_ticket_numbers := p_ticket_numbers[i];

      INSERT INTO tickets (
        user_id,
        draw_id,
        ticket_type_id,
        ticket_numbers,
        purchase_price,
        currency,
        transaction_hash
      ) VALUES (
        p_user_id,
        p_draw_id,
        p_ticket_type_id,
        v_ticket_numbers,
        p_purchase_price / array_length(p_ticket_numbers, 1), -- Divide total cost by number of tickets
        p_currency,
        p_transaction_hash
      )
      RETURNING id INTO v_ticket_id;
      
      -- Add to the array of ticket IDs
      v_ticket_ids := array_append(v_ticket_ids, v_ticket_id);
      
      -- Update the transaction with the ticket ID for the first ticket
      IF i = 1 THEN
        UPDATE transactions
        SET ticket_id = v_ticket_id
        WHERE id = v_transaction_id;
      END IF;
    END LOOP;

    -- Get the created tickets data
    SELECT json_agg(t) INTO v_ticket_data
    FROM tickets t
    WHERE t.id = ANY(v_ticket_ids);

    -- Get the transaction data
    SELECT row_to_json(t) INTO v_transaction_data
    FROM transactions t
    WHERE t.id = v_transaction_id;

    -- Prepare the result
    v_result := json_build_object(
      'tickets', v_ticket_data,
      'transaction', v_transaction_data
    );

    RETURN v_result;
  EXCEPTION WHEN OTHERS THEN
    -- Roll back the transaction
    RAISE;
  END;
END;
$$ LANGUAGE plpgsql; 