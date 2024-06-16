//importar modelo de follow y usuartios
const follow = require("../models/follow");
const user = require("../models/user");
const mongoosePaginate = require("mongoose-pagination");

const followService = require("../services/followService");

const pruebaFollow = (req, res) => {
  return res.status(200).send({
    messsage: "prueba follow",
  });
};

// accion de guardar un follow

const save = async (req, res) => {
  // conseguir datos por body
  const params = req.body;

  //sacar id del usuario
  const identity = req.user;

  // crear objeto con modelo follow
  let userToFollow = new follow({
    user: identity.id,
    followed: params.followed,
  });

  //guardar objeto en bd
  try {
    const followStored = await userToFollow.save();
    return res.status(200).send({
      status: "success",
      identity: req.user,
      follow: followStored,
    });
  } catch (err) {
    return res.status(404).send({
      status: "error",
      message: "el follow no se ha guardado",
    });
  }
};

// accion de borrar follow
const unfollow = async (req, res) => {
  //sacar id del usuario del usuario logueado
  const userId = req.user.id;

  //sacar id del usuario a dejar de seguir
  const followId = req.params.id;
  try {
    // find de las conincidencias
    const followStored = await follow.find({
      user: userId,
      followed: followId,
    });

    // borrar el follow
    if (followStored.length > 0) {
      await follow.deleteOne({
        _id: followStored[0]._id,
      });
    }

    return res.status(200).send({
      status: "success",
      message: "follow eliminado",
    });
  } catch (err) {
    // handle error here
    return res.status(404).send({
      status: "error",
      message: "el follow no se ha eliminado",
    });
  }
};


// accion de listar gente que sigo
const following = async (req, res) => {
  // sacar id de usuario logueado
  let userId = req.user.id;

  // comprobar si llega el id por parametro de la url
  if (req.params.id) {
    userId = req.params.id;
  }

  // comprobar que llega la pagina, si no la pagina 1
  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }

  // cuantos usuarios por pagina se muestran
  const itemsPerPage = 5;

  try {
    // find a follow, populate data of the users and paginate with mongoose paginate
    const followsTotales = await follow
      .find({ user: userId })
      .populate("user followed", "-password -role -__v -email");
      
    const follows = await follow
      .find({ user: userId })
      .populate("user followed", "-password -role -__v -email")
      .limit(itemsPerPage)
      .skip((page - 1) * itemsPerPage);

    // devolver un array de follows
    let followUserIds = await followService.followUserIds(req.user.id);

    return res.status(200).send({
      message: "listado de following",
      follows,
      total: followsTotales.length,
      pages: Math.ceil(followsTotales.length / itemsPerPage),
      users_following: followUserIds.following,
      users_follower: followUserIds.follower,
    });
  } catch (err) {
    console.log(err);
  }
};

// accion de listar gente que me sigue
const followers = async (req, res) => {
  let userId = req.user.id;

  // comprobar si llega el id por parametro de la url
  if (req.params.id) {
    userId = req.params.id;
  }

  // comprobar que llega la pagina, si no la pagina 1
  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }

  // cuantos usuarios por pagina se muestran
  const itemsPerPage = 5;

  try {
    // find a follow, populate data of the users and paginate with mongoose paginate
    const followsTotales = await follow
      .find({ followed: userId})
      .populate("user followed", "-password -role -__v -email");


    const follows = await follow
    .find({ followed: userId })
      .populate("user followed", "-password -role -__v -email")
      .limit(itemsPerPage)
      .skip((page - 1) * itemsPerPage);

    // devolver un array de follows
    let followUserIds = await followService.followUserIds(req.user.id);

    return res.status(200).send({
      message: "listado de followers",
      follows,
      total: followsTotales.length,
      pages: Math.ceil(followsTotales.length / itemsPerPage),
      users_following: followUserIds.following,
      users_follower: followUserIds.follower,
    });
  } catch (err) {
    console.log(err);
  }

};

// exportar acciones

module.exports = {
  pruebaFollow,
  save,
  unfollow,
  following,
  followers,
};
