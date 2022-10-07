const jwt = require('jsonwebtoken');
const { Authz } = require('../models');

module.exports = () => {
  return async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const key = authHeader && authHeader.split(' ')[1];
    if (!key) return res.sendStatus(401);
    
    const token = jwt.sign({key}, process.env.ACCESS_TOKEN_SECRET);
    await Authz.findOrCreate({where: {key}});
    await Authz.update({token}, {where: {key}});
    const record = await Authz.findOne({where: {token}});

    const authz = record.dataValues;
    
    await jwt.verify(authz.token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      res.set('x-app-auth-token', authz.token)
      req.authz = authz;
      req.user = user;
      next()
    })

  }
}