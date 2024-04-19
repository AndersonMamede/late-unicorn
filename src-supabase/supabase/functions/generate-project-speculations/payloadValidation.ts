import {
  firstMessages,
  isString,
  required,
  validate,
} from "https://deno.land/x/validasaur/mod.ts";

export const payloadValidation = async (payload: {
  method: string;
  projectId: string;
}) => {
  const [passes, errors] = await validate(payload, {
    projectId: [required, isString],
  });

  return {
    passes,
    errors: firstMessages(errors),
  };
};
