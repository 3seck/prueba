// importar las dependencias
const jwt = require("jwt-simple");
const moment = require("moment");

// importar clave secreta
const libjwt = require("../services/jwt");

const secret = libjwt.secret;

// funcion de autenticacion
exports.auth = (req, res, next) => {
  // comporbar si llega la cabecera de authetificancion
  if (!req.headers.authorization) {
    return res.status(403).send({
      status: "error",
      message: "Falta cabecera de autenticacion",
    });
  }
  // decodificar el token
  const token = req.headers.authorization.replace(/['"]+/g, "");

  try {
    let payload = jwt.decode(token, secret);
    console.log(payload);
    // si el token ha expirado
    if (payload.exp <= moment().unix()) {
      return res.status(401).send({
        status: "error",
        message: "Token ha expirado",
      });
    }
    // agregar datos de usuario a requerst

    req.user = payload;
  } catch (error) {
    return res.status(404).send({
      status: "error",
      message: "Token no valido",
      error,
    });
  }

  // pasar a ejecucion de accion
  next();
};
