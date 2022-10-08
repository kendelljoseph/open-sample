const Validator = require('better-validator');

module.exports = {
  isEntity: (data) => {
    const validator = new Validator();
    validator(data)
      .required()
      .isObject((obj) => {
        obj('name').required().isString();
        obj().strict();
      });

    return validator.run();
  },
  isRecord: (data) => {
    const validator = new Validator();
    validator(data)
      .required()
      .isObject((obj) => {
        obj('id').required().isString();
        obj().strict();
      });

    return validator.run();
  },
};
