const morgan = require('morgan');  

const logMiddleware = morgan('[:date[iso]] :method :url :status :res[content-length] - :response-time ms');

module.exports = logMiddleware;
