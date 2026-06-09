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
            url: 'http://localhost:3000',
            description: 'Development server'
        }
    ],
    components: {
        securitySchemes: {
            cookieAuth: {
                type: 'apiKey',
                scheme: 'cookie',
                name: 'userAuth'
            }
        }
    },
    security: [
        {
            cookieAuth: []
        }
    ],
    apis: ['./src/routes/*.js']
};

const swaggerSpec = swagger(options);
export default swaggerSpec;
