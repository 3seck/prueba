const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('../controllers/user');
const check = require('../middleware/auth');

// configuracion de subida con multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/avatars");
    },
    filename: (req, file, cb) => {
        cb(null, "avatar-" + Date.now() + "-" + file.originalname);
    }
});

const uploads = multer({ storage: storage });



// definir rutas

router.get('/prueba-usuario', check.auth, userController.pruebaUser);
router.post('/register', userController.register);  
router.post('/login', userController.login); 
router.get("/profile/:id", check.auth, userController.profile);
router.get("/list/:page?", check.auth, userController.list);
router.put("/update", check.auth, userController.update);
router.post("/upload",  [check.auth, uploads.single("file0")], userController.upload);
router.get("/avatar/:file" , userController.avatar);
router.get("/counter/:id?", check.auth, userController.counter);

// exportar rutas

module.exports = router;