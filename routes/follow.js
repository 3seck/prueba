const express = require('express');
const check = require('../middleware/auth');
const router = express.Router();
const followController = require('../controllers/follow');


// definir rutas

router.get('/prueba-follow', followController.pruebaFollow);
router.post('/save', check.auth, followController.save);
router.delete('/unfollow/:id', check.auth, followController.unfollow);
router.get('/following/:id?/:page?',check.auth , followController.following);
router.get('/followers/:id?/:page?', check.auth ,followController.followers);

// exportar rutas

module.exports = router;