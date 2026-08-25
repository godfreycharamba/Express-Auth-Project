const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "Express Auth API",
            version: "1.0.0",
            description: "API documentation for the Express authentication project"
        },

        servers: [
            {
                url: "http://localhost:8000",
                description: "Local development server"
            },
            {
                url:"https://express-auth-project.onrender.com",
                description:"Production server"
            }
        ]
    },

    apis: ["./routers/*.js", "./controllers/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;