import Validator from 'better-validator';

export default {
  isUser: (data) => {
    const validator = new Validator();
    validator(data)
      .required()
      .isObject((obj) => {
        obj('displayName').isString();
        obj('email').isString();
        obj('googleId').isString();
        obj('accessToken').isString();
        obj('phoneNumber').isString();
      });

    return validator.run();
  },
  isEntity: (data) => {
    const validator = new Validator();
    validator(data)
      .required()
      .isObject((obj) => {
        obj('name').required().isString();
        obj('prompt').isString();
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
  isAi: (data) => {
    const validator = new Validator();
    validator(data)
      .required()
      .isObject((obj) => {
        obj('prompt').required().isString();
        obj().strict();
      });

    return validator.run();
  },
  isSMS: (data) => {
    const validator = new Validator();
    validator(data)
      .required()
      .isObject((obj) => {
        obj('message').required().isString();
        obj('to').required().isString();
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
