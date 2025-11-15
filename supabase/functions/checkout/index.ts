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

    const { sessionId, customerInfo } = await req.json();

    console.log('Processing checkout:', { sessionId, customerInfo });

    // Get cart items with product details
    const { data: cartItems, error: cartError } = await supabaseClient
      .from('cart_items')
      .select(`
        *,
        products (*)
      `)
      .eq('session_id', sessionId);

    if (cartError) throw cartError;

    if (!cartItems || cartItems.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Cart is empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => {
      return sum + (item.products.price * item.quantity);
    }, 0);

    // Get AI recommendations using Lovable AI with Gemini
    let recommendations = [];
    try {
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      
      const productNames = cartItems.map(item => item.products.name).join(', ');
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful shopping assistant. Suggest 2-3 complementary products based on what the customer purchased.',
            },
            {
              role: 'user',
              content: `The customer just bought: ${productNames}. Suggest 2-3 complementary products they might also like. Keep suggestions brief and practical.`,
            },
          ],
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const suggestionText = aiData.choices?.[0]?.message?.content || '';
        recommendations = suggestionText.split('\n').filter((line: string) => line.trim()).slice(0, 3);
      }
    } catch (aiError) {
      console.error('AI recommendation error:', aiError);
      // Continue without recommendations if AI fails
    }

    // Create receipt
    const receipt = {
      orderId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      customer: customerInfo,
      items: cartItems.map(item => ({
        name: item.products.name,
        quantity: item.quantity,
        price: item.products.price,
        subtotal: item.products.price * item.quantity,
      })),
      total: total.toFixed(2),
      recommendations: recommendations.length > 0 ? recommendations : [
        'Check out our bestsellers!',
        'Subscribe for exclusive deals',
        'Follow us on social media'
      ],
    };

    console.log('Checkout successful:', receipt.orderId);

    return new Response(
      JSON.stringify({ success: true, receipt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Checkout failed';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
