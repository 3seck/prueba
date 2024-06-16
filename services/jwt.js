// importar dependencias
const jwt = require("jwt-simple");
const moment = require("moment");

//clave secreta

const secret = "claveSecreta";


// crear una funcion para generar token
const createToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, "days").unix(),
        
    }
    // devolver jwt token cifrado
    return jwt.encode(payload, secret);
}


module.exports = { createToken, secret };



