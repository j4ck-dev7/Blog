import stripe from "../../config/stripe.js";

export const subscribe = async (req, res) => {
    const plan = req.body.subscription;
    const userId = req.user._id;
    if(userId === 'freeAccess') return res.status(401).json({ message: 'User not authenticated, please login or register' });

    try {
        let amount;
        switch(plan) { // switch case para definir o valor conforme o plano escolhido
            case 'BASIC': amount = 500; break;
            case 'INTERMEDIATE': amount = 700; break;
            case 'PREMIUM': amount = 1000; break;
            default: return res.status(400).json({ message: 'Invalid plan' })
        };
        
        const session = await stripe.checkout.sessions.create({ // Cria a sessão de checkout na stripe com os dados necessários para o pagamento
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: req.user.email,
            line_items: [{
                price_data: {
                    currency: 'brl',
                    product_data: { name: `Plano ${plan}` },
                    unit_amount: amount,
                    recurring: { interval: "month" }
                },
                quantity: 1
            }],
            success_url: `http://localhost:5000/api/user/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:5000/api/user/cancel?plan=${plan}&user=${userId}`,
            metadata: { userId, plan } // Define o metatdata para identificar o usuário e o plano na hora do webhook para efetuar a assinatura (Modificar o usuário no banco de dados)
        })

        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}