import swagger from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Blog',
            version: '1.0.0',
            description: 'A simple Blog',
            contact: {
                name: 'Jackson',
                email: 'j4ckson7dev@gmail.com',
            }
        }
    },
    servers: [
        {
            url: 'http://localhost:5000',
            description: 'Development server'
        }
    ],
    components: {
        securitySchemes: {
            cookieAuth: {
                type: 'apiKey',
                in: 'cookie',
                name: 'userAuth',
                description: 'Autenticação via cookie. Envie o cookie "userAuth" com o token de autenticação para acessar as rotas protegidas.'
            }
        },
    },
    security: [
        {
            cookieAuth: []
        }
    ],
    apis: ['./src/routes/*.js', './src/utils/schemasSwagger.js']
};

const swaggerSpec = swagger(options);
export default swaggerSpec;
