import { validate, ValidatorOptions } from 'class-validator';
import { BadRequestError } from '../../Errors';
import { ClassConstructor, plainToInstance } from 'class-transformer';

export async function validateInput<T, V>(cls: ClassConstructor<T>, plain: V[], validatorOptions?: ValidatorOptions)
export async function validateInput<T, V>(cls: ClassConstructor<T>, plain: V, validatorOptions?: ValidatorOptions) {
  const object = plainToInstance(cls, plain);
  // @ts-ignore
  const errors = await validate(object, validatorOptions);

  if (errors?.length > 0) {
    const errorText = [];
    errors.forEach((err) => errorText.push(err.constraints));

    throw new BadRequestError(errorText as any);
  }
}
