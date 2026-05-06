import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/repositories/userRepository.js', () => ({
    verifyUserExistsByEmail: jest.fn(),
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
    updateUserSubscription: jest.fn(),
    findUserBySub: jest.fn(),
    verifyUserExistsBySub: jest.fn(),
    findUserById: jest.fn(),
    changeUserStatusActive: jest.fn(),
    createUserWithOauth: jest.fn()
}))

jest.unstable_mockModule('google-auth-library', () => {
    const __mock = {
        generateAuthUrl: jest.fn(),
        getToken: jest.fn(),
        verifyIdToken: jest.fn()
    };

    class OAuth2Client { // Outra forma de mockar usando classes.
        constructor(clientId, clientSecret, redirectUrl) {
            this.clientId = clientId;
            this.clientSecret = clientSecret;
            this.redirectUrl = redirectUrl;
        }
        generateAuthUrl() { return __mock.generateAuthUrl(); }
        async getToken(code) { return __mock.getToken(code); }
        async verifyIdToken(opts) { return __mock.verifyIdToken(opts); }
    }

    return { OAuth2Client, __mock };
})

jest.unstable_mockModule('../../src/config/logger.js', () => ({
    logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }
}));

jest.unstable_mockModule('../../src/config/nodemailer.js', () => ({
    transporter: { sendMail: jest.fn().mockResolvedValue(true) }
}));

jest.unstable_mockModule('bcryptjs', () => ({
    default: {
        hash: jest.fn().mockReturnValue('$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y'),
        compare: jest.fn().mockResolvedValue(true)
    }
}))

const { default: bcryptjs } = await import('bcryptjs')
const { verifyUserExistsByEmail, findUserByEmail, createUser, verifyUserExistsBySub, findUserBySub, createUserWithOauth } = await import('../../src/repositories/userRepository.js');
const { registerUser, loginUser, getUrlForOauthSignIn, getUrlForOauthSignUp, registerUserByOauth, loginUserByOauth } = await import('../../src/services/userService.js');
const { OAuth2Client, __mock } = await import('google-auth-library')

describe('User Service verifyEmail', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('should throw when token is absent', async () => {
        await expect((await import('../../src/services/userService.js')).verifyEmail()).rejects.toThrow('Token ausente');
    });

    test('should throw when token invalid (jwt.verify throws)', async () => {
        const jwt = await import('jsonwebtoken');
        jwt.default.verify = jest.fn(() => null);

        await expect((await import('../../src/services/userService.js')).verifyEmail('bad')).rejects.toThrow('Token inválido');
    });

    test('should throw when user not found', async () => {
        const { findUserById } = await import('../../src/repositories/userRepository.js');
        const jwt = await import('jsonwebtoken');
        jwt.default.verify = jest.fn().mockReturnValue({ id: 'notfound', email: 'no@one.com' });
        findUserById.mockResolvedValue(undefined);

        await expect((await import('../../src/services/userService.js')).verifyEmail('tok')).rejects.toThrow('Usuário não encontrado');
    });

    test('should verify and return user on success', async () => {
        const { findUserById, changeUserStatusActive } = await import('../../src/repositories/userRepository.js');
        const jwt = await import('jsonwebtoken');
        const user = { id: '100', email: 'u@ex.com', name: 'U', isEmailVerified: false, subscriptionPlan: 'FREE', subscriptionExpiresAt: null };
        jwt.default.verify = jest.fn().mockReturnValue({ id: '100', email: 'u@ex.com' });
        findUserById.mockResolvedValue(user);
        changeUserStatusActive.mockResolvedValue(true);

        const result = await (await import('../../src/services/userService.js')).verifyEmail('goodtok');
        expect(changeUserStatusActive).toHaveBeenCalledWith('100');
        expect(result).toEqual(user);
    })
})

describe('User Service Tests Register', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        process.env.EMAIL_VERIFICATION_SECRET = 'test-email-secret';
    });

    test('Register User - Failure when user already exists', async () => {
        verifyUserExistsByEmail.mockResolvedValue({
            id: '1',
            email: 'teste@gmail.com',
            password: '$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y'
        });

        await expect(
            registerUser('Teste', 'teste@gmail.com', '12345678')
        ).rejects.toThrow('Email already exists');

        expect(verifyUserExistsByEmail).toHaveBeenCalledWith('teste@gmail.com');
        expect(createUser).not.toHaveBeenCalled();
    });

    test('Register User - Should register user with password hashed', async () => {
        verifyUserExistsByEmail.mockResolvedValue(undefined);
        createUser.mockResolvedValue({
            id: 2,
            email: 'ana@gmail.com',
            name: 'Ana',
            password: '$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y', // 12345678
            subscriptionPlan: 'FREE',
            subscriptionExpiresAt: null
        });

        const result = await registerUser('Ana', 'ana@gmail.com', '123456789');

        expect(bcryptjs.hash).toHaveBeenCalledWith('123456789', 10);
        expect(createUser).toHaveBeenCalledWith('Ana', 'ana@gmail.com', expect.not.stringContaining('12345678'));
        expect(result).toEqual({
            id: 2,
            email: 'ana@gmail.com',
            name: 'Ana',
            password: '$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y',
            subscriptionPlan: 'FREE',
            subscriptionExpiresAt: null
        }); 
    });
})

describe('User Service Tests Login', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    test('Login User - Failure when email already is invalid', async () => {
        findUserByEmail.mockResolvedValue(undefined);

        await expect(
            loginUser('bruno@gmail.com', '12345678')
        ).rejects.toThrow('Invalid email or password');
    });

    test('Login User - Failure when password already is invalid', async () => {
        verifyUserExistsByEmail.mockResolvedValue(true)
        findUserByEmail.mockResolvedValue({
            id: '3',
            email: 'carlos@gmail.com',
            password: '$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y',
            name: 'Carlos',
            subscriptionPlan: 'FREE',
            subscriptionExpiresAt: null
        });
        bcryptjs.compare.mockResolvedValue(false)

        await expect(
            loginUser('carlos@gmail.com', '123456789')
        ).rejects.toThrow('Invalid email or password');


        expect(findUserByEmail).toHaveBeenCalledWith('carlos@gmail.com');
        expect(verifyUserExistsByEmail).toHaveBeenCalledWith('carlos@gmail.com')
        expect(bcryptjs.compare).toHaveBeenCalledWith('123456789', '$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y');
    });

    test('Login User - Shold login success and with password hashed', async () => {
        verifyUserExistsByEmail.mockResolvedValue(true)
        findUserByEmail.mockResolvedValue({
            id: '3',
            email: 'carlos@gmail.com',
            password: '$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y',
            name: 'Carlos',
            subscriptionPlan: 'FREE',
            subscriptionExpiresAt: null
        });
        bcryptjs.compare.mockResolvedValue(true)

        const result = await loginUser('carlos@gmail.com', '12345678')
        expect(result).toEqual({
            id: '3',
            email: 'carlos@gmail.com',
            password: '$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y',
            name: 'Carlos',
            subscriptionPlan: 'FREE',
            subscriptionExpiresAt: null
        })
        expect(findUserByEmail).toHaveBeenCalledWith('carlos@gmail.com');
        expect(verifyUserExistsByEmail).toHaveBeenCalledWith('carlos@gmail.com')
        expect(bcryptjs.compare).toHaveBeenCalledWith('12345678', '$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y');
    })
})

describe('User Service OAuth2 Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('getUrlForOauthSignIn should return authorization url', async () => {
        __mock.generateAuthUrl.mockReturnValue('https://accounts.google.com/auth?signin=1')

        const url = await getUrlForOauthSignIn()

        expect(url).toBe('https://accounts.google.com/auth?signin=1')
        expect(__mock.generateAuthUrl).toHaveBeenCalled()
    })

    test('getUrlForOauthSignUp should return authorization url', async () => {
        __mock.generateAuthUrl.mockReturnValue('https://accounts.google.com/auth?signup=1')

        const url = await getUrlForOauthSignUp()

        expect(url).toBe('https://accounts.google.com/auth?signup=1')
        expect(__mock.generateAuthUrl).toHaveBeenCalled()
    })

    test('registerUserByOauth should create new user when sub not exists', async () => {
        __mock.getToken.mockResolvedValue({ tokens: { id_token: 'id-token' } })
        __mock.verifyIdToken.mockResolvedValue({ payload: { email: 'o@auth.com', name: 'Oauth', sub: 'sub-123' } })
        verifyUserExistsBySub.mockResolvedValue(undefined)
        createUserWithOauth.mockResolvedValue({ id: '20', email: 'o@auth.com', name: 'Oauth', subscriptionPlan: 'FREE' })

        // call service
        const user = await registerUserByOauth('code-1')

        expect(__mock.getToken).toHaveBeenCalledWith('code-1')
        expect(__mock.verifyIdToken).toHaveBeenCalled()
        expect(createUserWithOauth).toHaveBeenCalledWith('Oauth', 'o@auth.com', 'sub-123')
        expect(user).toEqual({ id: '20', email: 'o@auth.com', name: 'Oauth', subscriptionPlan: 'FREE' })
    })

    test('registerUserByOauth should throw if user already exists', async () => {
        __mock.getToken.mockResolvedValue({ tokens: { id_token: 'id-token' } })
        __mock.verifyIdToken.mockResolvedValue({ payload: { email: 'o@auth.com', name: 'Oauth', sub: 'sub-123' } })
        verifyUserExistsBySub.mockResolvedValue(true)

        await expect(registerUserByOauth('code-2')).rejects.toThrow('User already exists')
    })

    test('loginUserByOauth should return user when sub exists', async () => {
        __mock.getToken.mockResolvedValue({ tokens: { id_token: 'id-token' } })
        __mock.verifyIdToken.mockResolvedValue({ payload: { sub: 'sub-999' } })
        verifyUserExistsBySub.mockResolvedValue(true)
        findUserBySub.mockResolvedValue({ id: '30', email: 'found@auth.com', name: 'Found' })

        const user = await loginUserByOauth('code-3')

        expect(__mock.getToken).toHaveBeenCalledWith('code-3')
        expect(__mock.verifyIdToken).toHaveBeenCalled()
        expect(findUserBySub).toHaveBeenCalledWith('sub-999')
        expect(user).toEqual({ id: '30', email: 'found@auth.com', name: 'Found' })
    })

    test('loginUserByOauth should throw when account not found', async () => {
        __mock.getToken.mockResolvedValue({ tokens: { id_token: 'id-token' } })
        __mock.verifyIdToken.mockResolvedValue({ payload: { sub: 'sub-notfound' } })
        verifyUserExistsBySub.mockResolvedValue(false)

        await expect(loginUserByOauth('code-4')).rejects.toThrow('Conta não encontrada')
    })
})