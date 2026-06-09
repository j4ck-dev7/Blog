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
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
    apis: ['./src/routes/*.js']
};

const swaggerSpec = swagger(options);
export default swaggerSpec;
