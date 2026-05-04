import { updateUserSubscription } from '../repositories/userRepository.js';
import jwt from 'jsonwebtoken';
import stripe from "../config/stripe.js";

export const webhook = async (req, res) => {
    let sig = req.headers['stripe-signature'];
    
    try {
        let event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        if(event.type === 'checkout.session.completed'){ // Verifica se o evento é de checkout completo para 
            const session = event.data.object; // O session tem os dados da compra
            const userId = session.metadata.userId; // O metadata foi definido na criação da sessão de checkout
            const plan = session.metadata.plan;

            const update = await updateUserSubscription(userId, plan);

            let token = jwt.sign( { _id : update.id, subscription: update.subscriptionPlan, expiresAt: update.subscriptionExpiresAt, email: update.email }, process.env.SECRET )
            res.cookie('userAuth', token, { secure: true, httpOnly: true, expires: new Date(Date.now() + 2 * 3600000) })

            return res.status(200).json({ received: true }) // Importante, diz ao stripe que o webhook foi recebido
        }

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.error(error);
    }
}