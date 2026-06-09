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
                scheme: 'cookie',
                name: 'userAuth'
            }
        },
        schemas: {
            Like: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        example: 'cuid1234567890'
                    },
                    articleSlug: {
                        type: 'string',
                        example: 'article-slug-example'
                    }
                },
                required: ['id', 'articleSlug']
            },
            Error: {
                type: 'object',
                properties: {
                    statusCode: {
                        type: 'integer',
                        example: 400,
                        description: 'Código de status HTTP do erro'
                    },
                    message: {
                        type: 'string',
                        example: 'Descrição detalhada do erro',
                        description: 'Mensagem de erro explicativa'
                    },
                    details: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                field: {
                                    type: 'string',
                                    example: 'email',
                                    message: {
                                        type: 'string',
                                        example: 'Email is required'
                                    }
                                },
                            }
                        },
                        description: 'Lista de detalhes adicionais sobre o erro, como campos específicos que causaram o problema'
                    }                        
                },
                required: ['statusCode', 'message']
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
