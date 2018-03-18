var router = require('express').Router();

// route endpoints in ./api through /api
router.use('/api', require('./api'));

module.exports = router;
