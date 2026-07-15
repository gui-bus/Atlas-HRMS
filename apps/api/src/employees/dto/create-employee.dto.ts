import { IsString, IsNotEmpty, IsEmail, IsDateString, IsEnum, IsOptional, ValidateNested, IsBoolean, Matches, Length } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { EmployeeStatus } from "@prisma/client";
import { IsCPF } from "../../common/validators/is-cpf.validator";

export class CreatePersonalDataDto {
  @ApiProperty({ description: "CPF do funcionário", example: "123.456.789-00" })
  @IsCPF({ message: "CPF inválido ou em formato incorreto" })
  @IsNotEmpty()
  cpf!: string;

  @ApiProperty({ description: "RG do funcionário", example: "MG-12.345.678", required: false })
  @IsString()
  @IsOptional()
  rg?: string;

  @ApiProperty({ description: "Data de nascimento do funcionário", example: "1990-05-15" })
  @IsDateString({}, { message: "Data de nascimento deve ser uma data válida" })
  @IsNotEmpty()
  birthDate!: string;

  @ApiProperty({ description: "Gênero/Identidade", example: "Masculino", required: false })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({ description: "Estado civil", example: "Solteiro", required: false })
  @IsString()
  @IsOptional()
  maritalStatus?: string;

  @ApiProperty({ description: "URL do avatar do funcionário", example: "https://utfs.io/f/avatar.png", required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

export class CreateAddressDto {
  @ApiProperty({ description: "CEP do endereço", example: "30130-010" })
  @Matches(/^\d{5}-?\d{3}$/, { message: "CEP inválido. Use o formato 00000-000 ou 8 dígitos numéricos" })
  @IsNotEmpty()
  cep!: string;

  @ApiProperty({ description: "Logradouro/Rua", example: "Avenida Afonso Pena" })
  @IsString()
  @IsNotEmpty()
  street!: string;

  @ApiProperty({ description: "Número", example: "1500" })
  @IsString()
  @IsNotEmpty()
  number!: string;

  @ApiProperty({ description: "Complemento do endereço", example: "Apto 302", required: false })
  @IsString()
  @IsOptional()
  complement?: string;

  @ApiProperty({ description: "Bairro", example: "Centro" })
  @IsString()
  @IsNotEmpty()
  neighborhood!: string;

  @ApiProperty({ description: "Cidade", example: "Belo Horizonte" })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ description: "Estado (UF)", example: "MG" })
  @IsString()
  @Length(2, 2, { message: "Estado deve conter exatamente 2 letras" })
  @IsNotEmpty()
  state!: string;
}

export class CreateBankAccountDto {
  @ApiProperty({ description: "Código de compensação do Banco", example: "341" })
  @IsString()
  @IsNotEmpty()
  bankCode!: string;

  @ApiProperty({ description: "Código da Agência Bancária", example: "0001" })
  @IsString()
  @IsNotEmpty()
  bankAgency!: string;

  @ApiProperty({ description: "Número da Conta Bancária", example: "12345-6" })
  @IsString()
  @IsNotEmpty()
  bankAccount!: string;

  @ApiProperty({ description: "Tipo de Conta Bancária", example: "CORRENTE" })
  @IsString()
  @IsNotEmpty()
  accountType!: string;
}

export class CreateEmergencyContactDto {
  @ApiProperty({ description: "Nome do contato de emergência", example: "Maria Silva" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: "Telefone do contato de emergência", example: "(31) 99999-9999" })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ description: "Grau de parentesco ou relacionamento", example: "Cônjuge" })
  @IsString()
  @IsNotEmpty()
  relationship!: string;

  @ApiProperty({ description: "Define se é o contato de emergência prioritário", example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

export class CreateEmployeeDto {
  @ApiProperty({ description: "Primeiro nome", example: "João" })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ description: "Sobrenome", example: "Silva" })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ description: "E-mail corporativo exclusivo", example: "joao.silva@atlas.com" })
  @IsEmail({}, { message: "E-mail inválido" })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: "Telefone de contato", example: "(31) 98888-8888" })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ enum: EmployeeStatus, example: EmployeeStatus.ACTIVE, required: false })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiProperty({ description: "Data de admissão", example: "2026-07-14" })
  @IsDateString({}, { message: "Data de contratação inválida" })
  @IsNotEmpty()
  hireDate!: string;

  @ApiProperty({ description: "Data de rescisão", example: "2028-12-31", required: false })
  @IsDateString()
  @IsOptional()
  terminationDate?: string;

  @ApiProperty({ description: "Salário bruto inicial", example: "5500.00" })
  @IsString()
  @IsNotEmpty()
  salary!: string;

  @ApiProperty({ description: "ID do usuário associado (opcional)", example: "d7b6a4a6-7a13-43ef-b209-efdb17eddfb1", required: false })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ description: "ID do departamento vinculado (opcional)", example: "a7b6a4a6-7a13-43ef-b209-efdb17eddfb1", required: false })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiProperty({ description: "ID do cargo vinculado (opcional)", example: "b7b6a4a6-7a13-43ef-b209-efdb17eddfb1", required: false })
  @IsString()
  @IsOptional()
  positionId?: string;

  @ApiProperty({ type: CreatePersonalDataDto, description: "Informações pessoais adicionais" })
  @ValidateNested()
  @Type(() => CreatePersonalDataDto)
  @IsNotEmpty()
  personalData!: CreatePersonalDataDto;

  @ApiProperty({ type: CreateAddressDto, description: "Endereço residencial" })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  @IsNotEmpty()
  address!: CreateAddressDto;

  @ApiProperty({ type: CreateBankAccountDto, description: "Dados para pagamento" })
  @ValidateNested()
  @Type(() => CreateBankAccountDto)
  @IsNotEmpty()
  bankAccount!: CreateBankAccountDto;

  @ApiProperty({ type: [CreateEmergencyContactDto], description: "Contatos de emergência do funcionário", required: false })
  @ValidateNested({ each: true })
  @Type(() => CreateEmergencyContactDto)
  @IsOptional()
  emergencyContacts?: CreateEmergencyContactDto[];
}
