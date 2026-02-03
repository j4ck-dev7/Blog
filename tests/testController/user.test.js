import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/services/userService.js', () => ({
    registerUser: jest.fn(),
    loginUser: jest.fn()    
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
    default: {
        sign: jest.fn().mockReturnValue('fake-token')
    }
}));

const { default: jwt } = await import('jsonwebtoken')
const { registerUser, loginUser } = await import('../../src/services/userService.js');
const { signIn, signUp } = await import('../../src/controllers/user/userController.js')

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
        expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully' });
    });
});

describe('User Controller signIn', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    test('Deve retornar status 401 ao tentar logar com um email inexistente', async () => {
        loginUser.mockRejectedValue(new Error('Incorrect email or password'));

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
        expect(res.json).toHaveBeenCalledWith({ message: 'Incorrect email or password' });
    });

    test('Deve retornar status 401 ao tentar logar com senha incorreta', async () => {
        loginUser.mockRejectedValue(new Error('Incorrect email or password'))

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
        expect(res.json).toHaveBeenCalledWith({ message: 'Incorrect email or password' });
    });

    test('Deve retornar status 200 ao fazer login com sucesso', async () => {
        loginUser.mockResolvedValue({
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
    });
})