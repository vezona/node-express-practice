// const swaggerAutogen = require('swagger-autogen')();

// const doc = {
//   tags: [ 
//     {
//       name: "Index",
//       description: "首頁 router"
//     },
//     {
//       name: "Users",
//       description: "使用者 router"
//     },
//   ],
// }

// const outputFile = './swagger-output.json';
// const endpointsFiles = ['./app.js'];

// swaggerAutogen(outputFile, endpointsFiles, doc);


const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger_output.json';
const endpointsFiles = ['./app.js'];

swaggerAutogen(outputFile, endpointsFiles);