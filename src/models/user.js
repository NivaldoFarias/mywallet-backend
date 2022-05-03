import Joi from "joi";

export const userSchema = Joi.object({
  name: Joi.string().min(1).max(25).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
