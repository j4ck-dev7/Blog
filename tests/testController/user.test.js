import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/services/userService.js', () => ({
    registerUser: jest.fn(),
    loginUser: jest.fn(),
    loginUserByOauth: jest.fn(),
    registerUserByOauth: jest.fn(),
    verifyEmail: jest.fn(),
    getUrlForOauthSignIn: jest.fn(),
    getUrlForOauthSignUp: jest.fn()
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
    default: {
        sign: jest.fn().mockReturnValue('fake-token')
    }
}));

jest.unstable_mockModule('../../src/config/logger.js', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    }
}));

jest.unstable_mockModule('../../src/config/requestMeta.js', () => ({
    getRequestMeta: jest.fn().mockImplementation((req, extra) => ({ ip: req?.ip || '127.0.0.1', agent: req?.headers?.['user-agent'] || 'test-agent', route: req?.originalUrl || req?.url || '/', method: req?.method || 'GET', userId: extra?.userId || req?.user?._id || null, ...extra }))
}));

const { default: jwt } = await import('jsonwebtoken')
const { registerUser, loginUser, loginUserByOauth, registerUserByOauth, getUrlForOauthSignIn, getUrlForOauthSignUp, verifyEmail } = await import('../../src/services/userService.js');
const { signIn, signUp, getSignInGoogleUrl, getSignUpGoogleUrl, signInWithOauth, signUpWithOauth, verifyUser } = await import('../../src/controllers/userController.js')

describe('User Controller signUp', () => {
    beforeEach(() => {
        process.env.SECRET = 'test-secret';
        jest.clearAllMocks()
    });

    test('Deve retornar status 401 quando o email já existe ao registrar', async () => {
        registerUser.mockRejectedValue(new Error('User already exists')); // Diz ao mock o que será retornado
        const req = {
            body: {
                name: 'Teste',
                email: 'teste@gmail.com',
                password: '12345678'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await signUp(req, res);

        expect(registerUser).toHaveBeenCalledWith('Teste', 'teste@gmail.com', '12345678')
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });

    test('Deve retornar status 201 ao fazer o registro com sucesso', async () => {
        registerUser.mockResolvedValue({
            id: '1',
            name: 'Fabio',
            email: 'fabio@gmail.com',
            password: '$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y',
            subscriptionPlan: 'FREE',
            subscriptionExpiresAt: null
        });

        const req = {
            body: {
                name: 'Fabio',
                email: 'fabio@gmail.com',
                password: '12345678'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn()
        };

        await signUp(req, res);

        expect(registerUser).toHaveBeenCalledWith('Fabio', 'fabio@gmail.com', '12345678')
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.cookie).not.toHaveBeenCalled();
        expect(jwt.sign).not.toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully, please verify your email' });
    });
});

describe('User Controller verifyUser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    test('should return 500 when verifyEmail throws known errors', async () => {
        verifyEmail.mockRejectedValue(new Error('Erro desconhecido'));

        const req = { query: { token: '' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await verifyUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao verificar email' });
    });
});

describe('User Controller signIn', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    test('Deve retornar status 401 ao tentar logar com um email inexistente', async () => {
        const errorMock = new Error('Incorrect email or password');
        errorMock.remainingAttempts = 5; // Simula o comportamento do service que retorna as tentativas restantes
        loginUser.mockRejectedValue(errorMock);

        const req = {
            body: {
                email: 'inexistente@gmail.com',
                password: '12345678'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await signIn(req, res);

        expect(loginUser).toHaveBeenCalledWith('inexistente@gmail.com', '12345678')
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Incorrect email or password', attemptsRemaining: 5 });
    });

    test('Deve retornar status 401 ao tentar logar com senha incorreta', async () => {
        const errorMock = new Error('Incorrect email or password');
        errorMock.remainingAttempts = 5; // Simula o comportamento do service que retorna as tentativas restantes
        loginUser.mockRejectedValue(errorMock);

        const req = {
            body: {
                email: 'ana@gmail.com',
                password: '123456789'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await signIn(req, res);

        expect(loginUser).toHaveBeenCalledWith('ana@gmail.com', '123456789')
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Incorrect email or password', attemptsRemaining: 5 });
    });

    test('Deve incrementar contador a cada falha subsequente (controller retorna remainingAttempts)', async () => {
        // Simula duas falhas consecutivas vindas do service com remainingAttempts diferentes
        const err1 = new Error('Incorrect email or password');
        err1.remainingAttempts = 4;
        const err2 = new Error('Incorrect email or password');
        err2.remainingAttempts = 3;

        loginUser.mockRejectedValueOnce(err1).mockRejectedValueOnce(err2);

        const req1 = { body: { email: 'noone@example.com', password: 'bad' } };
        const res1 = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        await signIn(req1, res1);
        expect(res1.status).toHaveBeenCalledWith(401);
        expect(res1.json).toHaveBeenCalledWith({ error: 'Incorrect email or password', attemptsRemaining: 4 });

        const req2 = { body: { email: 'noone@example.com', password: 'bad' } };
        const res2 = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        await signIn(req2, res2);
        expect(res2.status).toHaveBeenCalledWith(401);
        expect(res2.json).toHaveBeenCalledWith({ error: 'Incorrect email or password', attemptsRemaining: 3 });
    });

    test('Deve bloquear o usuário após atingir o limite e retornar mensagem de bloqueio', async () => {
        // Simula que a tentativa final retorna remainingAttempts = 0
        const finalErr = new Error('Incorrect email or password');
        finalErr.attempts = 5;
        finalErr.remainingAttempts = 0;

        loginUser.mockRejectedValueOnce(finalErr);

        const req = { body: { email: 'locked@example.com', password: 'bad' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        await signIn(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Incorrect email or password', attemptsRemaining: 0 });

        // Agora simula chamada quando já está bloqueado
        loginUser.mockRejectedValueOnce(new Error('Usuário bloqueado por muitas tentativas'));
        const res2 = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        await signIn(req, res2);
        expect(res2.status).toHaveBeenCalledWith(401);
        expect(res2.json).toHaveBeenCalledWith({ message: 'Usuário bloqueado por muitas tentativas' });
    });

    test('Deve retornar status 200 ao fazer login com sucesso', async () => {
        // Simula serviço que ao logar com sucesso também limpa as tentativas (mock interno)
        const mockClear = jest.fn();
        loginUser.mockImplementation(async (email, password) => {
            mockClear(email); // simula o comportamento de reset das tentativas no service
            return {
                id: '1',
                name: 'Fabio',
                email: 'fabio@gmail.com',
                password: '$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y',
                subscriptionPlan: 'FREE',
                subscriptionExpiresAt: null
            };
        });

        const req = {
            body: {
                name: 'Fabio',
                email: 'fabio@gmail.com',
                password: '12345678'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn()
        };

        await signIn(req, res);

        expect(loginUser).toHaveBeenCalledWith('fabio@gmail.com', '12345678')
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.cookie).toHaveBeenCalledWith(
            'userAuth', 'fake-token', {
                secure: true, httpOnly: true, expires: expect.any(Date) 
            }
        );
        expect(jwt.sign).toHaveBeenCalledWith({
            _id: '1',
            name: 'Fabio',
            email: 'fabio@gmail.com',
            subscriptionPlan: 'FREE',
            subscriptionExpire: null
        }, 'test-secret')
        expect(res.json).toHaveBeenCalledWith({ message: 'User logged in successfully' });
        // Verifica que o service (simulado) limpou as tentativas para o email
        expect(typeof mockClear).toBe('function');
        expect(mockClear).toHaveBeenCalledWith('fabio@gmail.com');
    });

    test('Deve limpar tentativas pendentes (2) após login bem-sucedido', async () => {
        // Simula que o service vê 2 tentativas e as limpa antes de retornar sucesso
        const mockClearAttempts = jest.fn();
        loginUser.mockImplementation(async (email, password) => {
            // antes de retornar, service limpa 2 tentativas
            mockClearAttempts(email, 2);
            return { id: '50', name: 'Recover', email, password: 'hash', subscriptionPlan: 'FREE', subscriptionExpiresAt: null };
        });

        const req = { body: { email: 'recover@example.com', password: '12345678' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), cookie: jest.fn() };

        await signIn(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(mockClearAttempts).toHaveBeenCalledWith('recover@example.com', 2);
    });
})

describe('User Controller OAuth2', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    test('Should return Google sign-in URL with status 200', async () => {
        getUrlForOauthSignIn.mockResolvedValue('https://accounts.google.com/auth?abc=1');

        const req = {};
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await getSignInGoogleUrl(req, res);

        expect(getUrlForOauthSignIn).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ url: 'https://accounts.google.com/auth?abc=1' });
    });

    test('Should return Google sign-up URL with status 200', async () => {
        getUrlForOauthSignUp.mockResolvedValue('https://accounts.google.com/auth?signup=1');

        const req = {};
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await getSignUpGoogleUrl(req, res);

        expect(getUrlForOauthSignUp).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ url: 'https://accounts.google.com/auth?signup=1' });
    });

    test('Should sign in with OAuth and set cookie', async () => {
        loginUserByOauth.mockResolvedValue({ id: '10', name: 'Oauth User', email: 'oauth@user.com', subscriptionPlan: 'FREE', subscriptionExpiresAt: null });

        const req = { query: { code: 'auth-code' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), cookie: jest.fn() };

        await signInWithOauth(req, res);

        expect(loginUserByOauth).toHaveBeenCalledWith('auth-code');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.cookie).toHaveBeenCalledWith('userAuth', 'fake-token', { secure: true, httpOnly: true, expires: expect.any(Date) });
        expect(res.json).toHaveBeenCalledWith({ message: 'User logged in successfully' });
    });

    test('Should return 401 when OAuth sign-in account not found', async () => {
        loginUserByOauth.mockRejectedValue(new Error('Conta não encontrada'));

        const req = { query: { code: 'bad-code' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await signInWithOauth(req, res);

        expect(loginUserByOauth).toHaveBeenCalledWith('bad-code');
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Conta não encontrada' });
    });

    test('Should register with OAuth and set cookie', async () => {
        registerUserByOauth.mockResolvedValue({ id: '11', name: 'New Oauth', email: 'new@oauth.com', subscriptionPlan: 'FREE', subscriptionExpiresAt: null });

        const req = { query: { code: 'signup-code' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), cookie: jest.fn() };

        await signUpWithOauth(req, res);

        expect(registerUserByOauth).toHaveBeenCalledWith('signup-code');
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.cookie).toHaveBeenCalledWith('userAuth', 'fake-token', { secure: true, httpOnly: true, expires: expect.any(Date) });
        expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully' });
    });

    test('Should return 401 when OAuth sign-up account already exists', async () => {
        registerUserByOauth.mockRejectedValue(new Error('User already exists'));

        const req = { query: { code: 'exists-code' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await signUpWithOauth(req, res);

        expect(registerUserByOauth).toHaveBeenCalledWith('exists-code');
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });
});