import bcrypt from 'bcryptjs';
import { findUserByEmail, verifyUserExistsByEmail, createUser, updateUserSubscription } from "../repositories/userRepository.js";

export const registerUser = async (name, email, password) => {
    const existingUser = await verifyUserExistsByEmail(email);
    if (existingUser) {
        throw new Error('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await createUser(name, email, passwordHash);
    return newUser;
}

export const loginUser = async (email, password) => {
    const userVerify = await verifyUserExistsByEmail(email);
    if (!userVerify) {
        throw new Error('Invalid email or password');
    }

    const user = await findUserByEmail(email);

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw new Error('Invalid email or password');
    }

    return user;
}

export const subscribeUser = async (userId, plan) => {
    const updatedUser = await updateUserSubscription(userId, plan);

    return updatedUser;
}