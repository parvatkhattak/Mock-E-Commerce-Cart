import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { action, sessionId, productId, quantity, cartItemId } = await req.json();

    console.log('Cart operation:', { action, sessionId, productId, quantity, cartItemId });

    switch (action) {
      case 'add': {
        // Check if item already exists in cart
        const { data: existingItem } = await supabaseClient
          .from('cart_items')
          .select('*')
          .eq('session_id', sessionId)
          .eq('product_id', productId)
          .single();

        if (existingItem) {
          // Update quantity
          const { data, error } = await supabaseClient
            .from('cart_items')
            .update({ quantity: existingItem.quantity + (quantity || 1) })
            .eq('id', existingItem.id)
            .select()
            .single();

          if (error) throw error;
          return new Response(JSON.stringify({ success: true, data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // Insert new item
          const { data, error } = await supabaseClient
            .from('cart_items')
            .insert({
              session_id: sessionId,
              product_id: productId,
              quantity: quantity || 1,
            })
            .select()
            .single();

          if (error) throw error;
          return new Response(JSON.stringify({ success: true, data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      case 'update': {
        const { data, error } = await supabaseClient
          .from('cart_items')
          .update({ quantity })
          .eq('id', cartItemId)
          .eq('session_id', sessionId)
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ success: true, data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'remove': {
        const { error } = await supabaseClient
          .from('cart_items')
          .delete()
          .eq('id', cartItemId)
          .eq('session_id', sessionId);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get': {
        const { data: cartItems, error } = await supabaseClient
          .from('cart_items')
          .select(`
            *,
            products (*)
          `)
          .eq('session_id', sessionId);

        if (error) throw error;

        const total = cartItems.reduce((sum, item) => {
          return sum + (item.products.price * item.quantity);
        }, 0);

        return new Response(
          JSON.stringify({ success: true, data: { items: cartItems, total } }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'clear': {
        const { error } = await supabaseClient
          .from('cart_items')
          .delete()
          .eq('session_id', sessionId);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Cart operation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
