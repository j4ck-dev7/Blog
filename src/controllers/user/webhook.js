import User from "../../models/User.js";
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

        const update = await User.findByIdAndUpdate(userId, { // O findByIdAndUpdate é justificável nesse caso pois será necessário atualizar o cookie userAuth
            'subscription.plan': plan,
            'subscription.expiresAt': new Date(Date.now() + 120_000)
        }, { new: true }) // Retorna o documento atualizado, como se fosse um find()

        let token = jwt.sign( { _id : update._id, subscription: update.subscription, email: update.email }, process.env.SECRET )
        res.cookie('userAuth', token, { secure: true, httpOnly: true, expires: new Date(Date.now() + 2 * 3600000) })

        res.status(200).json({ received: true }) // Importante, diz ao stripe que o webhook foi recebido
    }

    } catch (error) {
        console.error(error);
    }
}