// Importat dependencias, modulos y servicvio de jwt
const bcrypt = require('bcryptjs');
const user = require("../models/user");
const jwt = require("../services/jwt");
const mongoosePagination = require("mongoose-pagination");
const { use } = require("../routes/user");
const fs = require("fs");
const path = require("path");
const followService = require("../services/followService");
const follow = require("../models/follow");
const publication = require("../models/publication");

// Acciones de prueba

const pruebaUser = (req, res) => {
  return res.status(200).send({
    messsage: "mensaje enviado desde el controlador de usuario",
    usuario: req.user,
  });
};

// registro de usuarios

const register = async (req, res) => {
  // recoger datos de la peticion
  let params = req.body;

  // comprobar que llegan bien + validacion
  if (!params.name || !params.email || !params.password || !params.nick) {
    return res.status(400).json({
      status: "error",
      message: "Faltan datos",
    });
  }

  // control de usuarios duplicados
  try {
    let users = await user
      .find({
        $or: [
          { email: params.email.toLowerCase() },
          { nick: params.nick.toLowerCase() },
        ],
      })
      .exec();

    if (users && users.length >= 1) {
      return res.status(400).json({
        status: "error",
        message: "Usuario duplicado",
      });
    }

    // cifrar contraseña
    let pwd = await bcrypt.hash(params.password, 10);
    params.password = pwd;

    // crear objeto de usuario
    let userSave = new user(params);

    // guardar usuario en la base de datos
    try {
      let savedUser = await userSave.save();
      return res.status(200).json({
        status: "success",
        message: "Registro de usuario correcto",
        user: savedUser,
      });
    } catch (err) {
      return res.status(500).json({
        status: "error",
        message: "Error al guardar el usuario",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error en la petición",
    });
  }
};


const login = (req, res) => {
  // recoger datos de la peticion
  let params = req.body;
  if (!params.email || !params.password) {
    return res.status(400).send({
      status: "error",
      messsage: "faltan datos",
    });
  }
  //buscar usuario en la base de datos
  user
    .findOne({ email: params.email })
    //.select("-password")
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          status: "error",
          messsage: "Usuario no encontrado",
        });
      }
      //comprbar su contraseña
      const pwd = bcrypt.compareSync(params.password, user.password);

      if (!pwd) {
        return res.status(404).send({
          status: "error",
          messsage: "Contraseña incorrecta",
        });
      }

      //generar token de autenticacion
      const token = jwt.createToken(user);

      //elimianr pass del objeto

      //datos usuario
      return res.status(200).send({
        status: "success",
        messsage: "Login correcto",
        user: {
          id: user._id,
          name: user.name,
          nick: user.nick,
        },
        token,
      });
    })
    .catch((err) => {
      // handle error
      console.error(err);
    });
};

const profile = async (req, res) => {
  // recibir el parametro del id de usuario por la url
  const id = req.params.id;

  try {
    // consultar para sacar los datos del usuario
    const userProfile = await user.findById(id).select("-password -role");

    if (!userProfile) {
      return res.status(404).send({
        status: "error",
        messsage: "No se ha encontrado el usuario",
      });
    }

    //info seguimiento
    const followInfo = await followService.followThisUser(req.user.id, id);


    // devolver resultado
    return res.status(200).send({
      status: "success",
      user: userProfile,
      following: followInfo.following,
      follower: followInfo.follower,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      messsage: "Error al buscar el usuario",
    });
  }
};

const list = async (req, res) => {
  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }
  page = parseInt(page);
  let itemsPerPage = 5;
  try {
    const users = await user
      .find().select("-password -role -__v -email")
      .sort("_id")
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);

    if (!users) {
      return res.status(404).send({
        status: "error",
        messsage: "Error en la peticion o no hay usuarios disponibles",
      });
    }

    //coge el numero total de usuarios en la bd
    const totalUsers = await user.countDocuments();
    let followUserIds = await followService.followUserIds(req.user.id);

    return res.status(200).send({
      status: "success",
      page,
      itemsPerPage,
      total: totalUsers,
      users,
      pages: Math.ceil(totalUsers / itemsPerPage),
      users_following: followUserIds.following,
      users_follower: followUserIds.follower,
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      messsage: "Error en la peticion",
      err,
    });
  }
};

const update = async (req, res) => {
  // recoger info del usuario a actualizar
  let userIdentity = req.user;
  let userToUpdate = req.body;

  // eliminar campos sobrantes
  delete userToUpdate.iat;
  delete userToUpdate.exp;
  delete userToUpdate.role;

  // comprobar si el usuario ya existe
  try {
    let users = await user
      .find({
        $or: [
          { email: userToUpdate.email.toLowerCase() },
          { nick: userToUpdate.nick.toLowerCase() },
        ],
      })
      
    let userIsset = false;
    users.forEach((user) => {
      if (user && user._id != userIdentity.id) {
        userIsset = true;
      }
    });

    if (userIsset) {
      return res.status(200).send({
        status: "success",
        messsage: "Usuario duplicado",
      });
    }

    // cifrar contraseña
    if (userToUpdate.password) {
      let pwd = await bcrypt.hash(userToUpdate.password, 10);
      userToUpdate.password = pwd;
    } else {
      delete userToUpdate.password;
    }

    // buscar y actualizar

    let userUpdated = await user.findByIdAndUpdate(
      userIdentity.id,
      userToUpdate,
      { new: true }
    );

    if (!userUpdated) {
      return res.status(500).send({
        status: "error",
        messsage: "Error al actualizar el usuario",
      });
    }

    return res.status(200).send({
      status: "success",
      messsage: "Usuario actualizado correctamente el usuario",
      user: userUpdated,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      messsage: "Error en la actualizacion del usuario",
      error: error.message,
    });
  }
};

const upload = async (req, res) => {
  // recoger el fichero de imagen y comprobar que existe
  if (!req.file) {
    return res.status(404).send({
      status: "error",
      message: "No se ha subido ninguna imagen",
    });
  }

  // conseguir el nombre del archivo
  let image = req.file.originalname;

  // sacar la extension del archivo
  const imageSplit = image.split(".");
  const extension = imageSplit[imageSplit.length - 1];

  // comprobar extension
  if (
    extension != "png" &&
    extension != "jpg" &&
    extension != "jpeg" &&
    extension != "gif"
  ) {
    // borrar el archivo subido
    const filePath = req.file.path;
    const fileDeleted = fs.unlinkSync(filePath);

    return res.status(400).send({
      status: "error",
      message: "La extension del archivo no es valida",
      fileDeleted,
    });
  }

  // si es correcta guardar imagen en la bd
  try {
    console.log(req.user.id);
    const userUpdated = await user.findByIdAndUpdate(
      req.user.id,
      { image: req.file.filename },
      { new: true }
    );

    if (!userUpdated) {
      return res.status(500).send({
        status: "error",
        message: "Error al guardar la imagen del usuario1211",
      });
    }

    // devolver respuesta
    return res.status(200).send({
      status: "success",
      user: userUpdated,
      file: req.file,
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      message: "Error al guardar la imagen del usuario",
    });
  }
};

const avatar = (req, res) => {
  // sacar el parametro de la url
  const file = req.params.file;

  // montar el path real de  la imagen

  const filePath = "./uploads/avatars/" + file;

  //comprobar que existe
  fs.stat(filePath, (error, exists) => {
    if (!exists) {
      return res.status(404).send({
        status: "error",
        message: "La imagen no existe",
      });
    }
    return res.sendFile(path.resolve(filePath));
  });

  //devolver un file
};

const counter = async (req, res) => {
  // sacar el parametro de la url
  let userId = req.user.id;

  if (req.params.id) {
    userId = req.params.id;
    console.log(userId);
  }

  // comprobar que existe
  try {
    
    const following = await follow.countDocuments({"user": userId});
    console.log(following);
    const follower = await follow.countDocuments({"followed": userId});
    console.log(follower);
    const publications = await publication.countDocuments({"user": userId});
    console.log(publications);

    return res.status(200).send({
      status: "success",
      userId: userId,
      following,
      follower,
      publications,
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      status: "error",
      message: "Error al obtener el usuario",
    });
  }
}

// exportar acciones

module.exports = {
  pruebaUser,
  register,
  login,
  profile,
  list,
  update,
  upload,
  avatar,
  counter
};
