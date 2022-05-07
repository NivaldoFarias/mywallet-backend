import Joi from "joi";

export const transactionSchema = Joi.object({
  type: Joi.string()
    .pattern(new RegExp(/(deposit|withdrawal)/))
    .required(),
  description: Joi.string().required(),
  amount: Joi.number().required(),
});
