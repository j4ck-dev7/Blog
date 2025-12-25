import { prisma } from '../../lib/prisma.js';
import jwt from 'jsonwebtoken';
import stripe from "../../config/stripe.js";

export const webhook = async (req, res) => {
    let sig = req.headers['stripe-signature'];
    
    try {
        let event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        if(event.type === 'checkout.session.completed'){
        const session = event.data.object;
        const userId = session.metadata.userId;
        const plan = session.metadata.plan;

        const update = await prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionPlan: plan,
                subscriptionExpiresAt: new Date(Date.now() + 120_000)
            }
        });

        let token = jwt.sign( { _id : update.id, subscription: update.subscriptionPlan, expiresAt: update.subscriptionExpiresAt, email: update.email }, process.env.SECRET )
        res.cookie('userAuth', token, { secure: true, httpOnly: true, expires: new Date(Date.now() + 2 * 3600000) })

        res.status(200).json({ received: true }) // Importante, diz ao stripe que o webhook foi recebido
    }

    } catch (error) {
        console.error(error);
    }
}