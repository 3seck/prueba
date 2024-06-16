const express = require('express');
const router = express.Router();
const publicationController = require('../controllers/publication');
const check = require('../middleware/auth');
const multer = require('multer');

// configuracion de subida con multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/publications");
    },
    filename: (req, file, cb) => {
        cb(null, "publication-" + Date.now() + "-" + file.originalname);
    }
});

const uploads = multer({ storage: storage });



// definir rutas

router.get('/prueba-publication', publicationController.pruebaPublication);
router.post('/save', check.auth, publicationController.save);
router.get('/detail/:id', check.auth, publicationController.detail);
router.delete('/remove/:id', check.auth, publicationController.remove);
router.get('/user/:id/:page?', check.auth, publicationController.user);
router.post('/upload/:id', [check.auth, uploads.single('file0')], publicationController.upload);
router.get('/media/:file', publicationController.media);
router.get('/feed/:page?', check.auth, publicationController.feed);

// exportar rutas

module.exports = router;