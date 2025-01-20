import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Opciones de configuración de Swagger
const options = {
    definition: {
      openapi: '3.1.0',
      info: {
        title: 'API de GIPIT',
        version: '1.0.0',
        description: 'Documentación de la API con App Router',
      },
      servers: [
        {
          url: `${process.env.NEXT_PUBLIC_API_URL}/api`, // URL base de tu API
        },
      ],
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string' },
              avatar: { type: 'string', nullable: true },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' },
            },
          },
          Company: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              logo: { type: 'string', nullable: true },
              description: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            }
          },
          Management: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              description: { type: 'string' },
              company_id: { type: 'integer' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' },
            },
          },
          UserManagement: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              user_id: { type: 'integer' },
              management_id: { type: 'integer' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' },
            },
          },
          Process: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              job_offer: { type: 'string' },
              job_offer_description: { type: 'string' },
              company_id: { type: 'integer' },
              opened_at: { type: 'string', format: 'date-time', nullable: true },
              closed_at: { type: 'string', format: 'date-time', nullable: true },
              pre_filtered: { type: 'boolean' },
              status: { type: 'string' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' }
            }
          },
          CandidateManagement: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              candidate_id: { type: 'integer' },
              management_id: { type: 'integer' },
              status: { type: 'string' },
              start_date: { type: 'string', format: 'date' },
              end_date: { type: 'string', format: 'date' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' }
            }
          },
          PreInvoice: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              estimated_date: { type: 'string', format: 'date' },
              expiration_date: { type: 'string', format: 'date' },
              total_value: { type: 'number' },
              description: { type: 'string' },
              status: { type: 'string' },
              company_id: { type: 'integer' },
              pre_invoice_items: {
                type: 'array',
                items: { $ref: '#/components/schemas/PreInvoiceItem' },
              },
            },
          },
          PreInvoiceItem: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              pre_invoice_id: { type: 'integer' },
              candidate_id: { type: 'integer' },
              service: { type: 'string' },
              rate: { type: 'string' },
              hours: { type: 'number' },
              subtotal: { type: 'number' },
              vat: { type: 'number' },
              total: { type: 'number' },
              description: { type: 'string' },
            },
          },
          Error: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          }
        },
      },
    },
    apis: ['./app/api/**/*.ts'],
  };
  
  const swaggerSpec = swaggerJsdoc(options);
  
  export { swaggerUi, swaggerSpec };