const Validator = require('better-validator');

const validation = {
  isEntity: (data) => {
    const validator = new Validator();
    validator(data)
      .required()
      .isObject((obj) => {
        obj('name').required().isString();
      });

    return validator.run();
  },
  isRecord: (data) => {
    const validator = new Validator();
    validator(data)
      .required()
      .isObject((obj) => {
        obj('id').required().isString();
      });

    return validator.run();
  },
};
module.exports = { validation };
