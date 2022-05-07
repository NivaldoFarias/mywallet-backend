import Joi from "joi";

export const transferSchema = Joi.object({
  to: Joi.string().required(),
  description: Joi.string().required(),
  amount: Joi.number().required(),
});
