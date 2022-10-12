import Validator from 'better-validator';

export default {
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
  isGift: (data) => {
    const validator = new Validator();
    validator(data)
      .required()
      .isObject((obj) => {
        obj('name').required().isString();
        obj().strict();
      });

    return validator.run();
  },
  isGrant: (data) => {
    const validator = new Validator();
    validator(data)
      .required()
      .isObject((obj) => {
        obj('name').required().isString();
        obj().strict();
      });

    return validator.run();
  },
  isKey: (data) => {
    const validator = new Validator();
    validator(data).required().isString();

    return validator.run();
  },
};
