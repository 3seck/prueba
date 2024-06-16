const publication = require("../models/publication");
const fs = require("fs");
const path = require("path");
const followService = require("../services/followService");

const pruebaPublication = (req, res) => {
  return res.status(200).send({
    messsage: "publicaction",
  });
};

// guardar publicaciones
const save = async (req, res) => {
  // recoger datos del body, si no llegan error
  const params = req.body;
  if (!params.text) {
    return res.status(400).send({
      status: "error",
      message: "debes enviar un texto",
    });
  }
  // crear objeto a guardar
  const newPublication = new publication(params);
  newPublication.user = req.user.id;

  // guardar en la base de datos
  try {
    const publicationStored = await newPublication.save();
    // devolver respuesta
    return res.status(200).send({
      status: "success",
      message: "save hecho",
      publication: publicationStored,
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      message: "error al guardar la publicacion",
    });
  }
};

// sacar una publicacion esxacta

const detail = async (req, res) => {
  // recoger id de la publicacion
  const publicationId = req.params.id;

  // buscar en la base de datos
  try {
    const publicationStored = await publication.findById(publicationId);
    if (!publicationStored) {
      return res.status(404).send({
        status: "error",
        message: "no existe la publicacion",
      });
    }

    // si no existe
    return res.status(200).send({
      status: "success",
      message: "publicacion detallada",
      publication: publicationStored,
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      message: "error la publicacion no existe",
    });
  }
};

// elminar publicaciones

const remove = async (req, res) => {
  // recoger id de la publicacion

  const publicationId = req.params.id;

  // buscar y eliminar en la base de datos

  try {
    const publicationRemoved = await publication.findByIdAndDelete({
      user: req.user.id,
      _id: publicationId,
    });

    if (!publicationRemoved) {
      return res.status(404).send({
        status: "error",
        message: "no se ha podido borrar la publicacion",
      });
    }

    return res.status(200).send({
      status: "success",
      messsage: "publicaction borrada",
      publication: publicationId,
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      message: "error al borrar la publicacion",
    });
  }
};

// listar todas las publicaciones de un usuario
const user = async (req, res) => {
  // recoger id del usuario
  const userId = req.params.id;

  // controlar la pagina
  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }
  const itemsPerPage = 5;

  try {
    const result = await publication
      .find({ user: userId })
      .sort([["created_at", "descending"]])
      .populate("user", "-password -__v, -role")
      .paginate(page, itemsPerPage);

    if (!result) {
      return res.status(404).send({
        status: "error",
        message: "no hay publicaciones disponibles para mostrar",
      });
    }

    return res.status(200).send({
      status: "success",
      user: req.user,
      result,
      page,
      itemsPerPage,
    });
  } catch (err) {
    return res.status(404).send({
      status: "error",
      message: "error en la peticion de las publicaciones",
    });
  }
};

// subir ficheros
const upload = async (req, res) => {
  // recoger id de la publicacion
  const publicationId = req.params.id;

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
    extension != "gif" &&
    extension != "webp"
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
    const publicationUpdated = await publication.findByIdAndUpdate(
      { user: req.user.id, _id: publicationId },
      { file: req.file.filename },
      { new: true }
    );

    if (!publicationUpdated) {
      return res.status(500).send({
        status: "error",
        message: "Error al guardar la publicacion del usuario",
      });
    }

    // devolver respuesta
    return res.status(200).send({
      status: "success",
      user: publicationUpdated,
      file: req.file,
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      message: "Error final al guardar la publicacion del usuario",
    });
  }
};

const media = (req, res) => {
  // sacar el parametro de la url
  const file = req.params.file;

  // montar el path real de  la imagen

  const filePath = "./uploads/publications/" + file;

  //comprobar que existe
  fs.stat(filePath, (error, exists) => {
    if (!exists) {
      return res.status(404).send({
        status: "error",
        message: "La imagen no existe",
      });
    }
    //devolver un file
    return res.sendFile(path.resolve(filePath));
  });

  
};

// listar todas publicaciones feed

const feed = async (req, res) => {
  // sacar la pagina actual
  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }

  // establecer numero de elementos por pagina
  let itemsPerPage = 5;

  try {
    //sacar un array de ids de usuarios que yo sigo como usuario logueado
    const myFollows = await followService.followUserIds(req.user.id);

    // find de las publicaciones de los usuarios que sigo, ordenar . popular y paginar
    const publicationsTotales = await publication
      .find({ user: { $in: myFollows.following } })
      .sort([["created_at", "descending"]])
      .populate("user", "-password -__v -role -email");

    const publications = await publication
      .find({ user: { $in: myFollows.following } })
      .sort([["created_at", "descending"]])
      .populate("user", "-password -__v -role -email")
      .limit(itemsPerPage)
      .skip((page - 1) * itemsPerPage);

    return res.status(200).send({
      status: "success",
      message: "feed",
      myFollows: myFollows.following,
      publications,
      total: publicationsTotales.length,
      pages: Math.ceil(publicationsTotales.length / itemsPerPage),
      page,
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      message: "No hay publicaciones para mostrar",
    });
  }
};

// devolver archivos multimedia

// exportar acciones

module.exports = {
  pruebaPublication,
  save,
  detail,
  remove,
  user,
  upload,
  media,
  feed,
};
