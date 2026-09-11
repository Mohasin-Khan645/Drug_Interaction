import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DrugSafe API - Clinical Medication Safety & Drug Interaction Intelligence Platform',
      version: '1.0.0',
      description:
        'Authoritative Clinical Decision Support API for medication reconciliation, drug-drug interaction detection, disease/allergy safety checks, and grounded pharmacological intelligence.',
      contact: {
        name: 'DrugSafe Clinical Systems Team',
        email: 'support@drugsafe.io',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'Primary API Gateway',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);

