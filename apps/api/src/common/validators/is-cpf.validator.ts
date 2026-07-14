import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator";

export function IsCPF(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isCPF",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== "string") return false;

          // Remove non-digit characters
          const cleanCPF = value.replace(/[^\d]/g, "");

          // Check if cleanCPF has 11 digits or consists of identical numbers
          if (cleanCPF.length !== 11 || /^(\d)\1+$/.test(cleanCPF)) {
            return false;
          }

          // Validate first digit
          let sum = 0;
          for (let i = 0; i < 9; i++) {
            sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
          }
          let checkDigit1 = 11 - (sum % 11);
          if (checkDigit1 >= 10) checkDigit1 = 0;

          if (checkDigit1 !== parseInt(cleanCPF.charAt(9))) {
            return false;
          }

          // Validate second digit
          sum = 0;
          for (let i = 0; i < 10; i++) {
            sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
          }
          let checkDigit2 = 11 - (sum % 11);
          if (checkDigit2 >= 10) checkDigit2 = 0;

          if (checkDigit2 !== parseInt(cleanCPF.charAt(10))) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} deve ser um CPF válido no formato 000.000.000-00 ou contendo apenas 11 números.`;
        },
      },
    });
  };
}
