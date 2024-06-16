
const follow = require("../models/follow");


const followUserIds = async (identityUserId) => {
  try {
    // Obtiene los usuarios que el usuario identificado sigue.
    let following = await follow
      .find({ user: identityUserId }) 
      .select({ "followed": 1, "_id": 0 }) 
      .exec(); // Ejecuta la consulta.

    // Obtiene los usuarios que siguen al usuario identificado.
    let follower = await follow
      .find({ followed: identityUserId })
      .select({ "user": 1, "_id": 0 }) 
      .exec(); 

    // Procesa los resultados para obtener solo los IDs.
    let followingClean = [];
    following.forEach((follow) => {
      followingClean.push(follow.followed); // Añade cada ID de 'followed' al array followingClean.
    });

    let followerClean = [];
    follower.forEach((follow) => {
      followerClean.push(follow.user); // Añade cada ID de 'user' al array followerClean.
    });

    // Devuelve un objeto con los arrays de IDs de usuarios seguidos y seguidores.
    return {
      following: followingClean,
      follower: followerClean,
    };
  } catch (error) {
 
    return {};
  }
};

const followThisUser = async (identityUserId, profileUserId) => {
  try {
    // Comprueba si el user identificado sigue al usuario del perfil.
    let following = await follow
      .findOne({ user: identityUserId, followed: profileUserId }) 

  
    let follower = await follow
      .findOne({ followed: profileUserId, user: identityUserId }) 

    // Devuelve un objeto con los documentos encontrados.
    return {
      following: following,
      follower: follower,
    };
  } catch (error) {
   
    return {};
  }
};

module.exports = { followUserIds, followThisUser };
