import { ApiProperty } from "@nestjs/swagger";
import { EmployeeStatus } from "@prisma/client";

export class PersonalDataResponseDto {
  @ApiProperty({ example: "52219d3e-9bf8-466d-9653-efad87d55986" })
  id!: string;

  @ApiProperty({ example: "123.456.789-00" })
  cpf!: string;

  @ApiProperty({ example: "MG-12.345.678", required: false })
  rg?: string;

  @ApiProperty({ example: "1990-05-15T00:00:00.000Z" })
  birthDate!: Date;

  @ApiProperty({ example: "Masculino", required: false })
  gender?: string;

  @ApiProperty({ example: "Solteiro", required: false })
  maritalStatus?: string;
}

export class AddressResponseDto {
  @ApiProperty({ example: "63219d3e-9bf8-466d-9653-efad87d55987" })
  id!: string;

  @ApiProperty({ example: "30130-010" })
  cep!: string;

  @ApiProperty({ example: "Avenida Afonso Pena" })
  street!: string;

  @ApiProperty({ example: "1500" })
  number!: string;

  @ApiProperty({ example: "Apto 302", required: false })
  complement?: string;

  @ApiProperty({ example: "Centro" })
  neighborhood!: string;

  @ApiProperty({ example: "Belo Horizonte" })
  city!: string;

  @ApiProperty({ example: "MG" })
  state!: string;
}

export class BankAccountResponseDto {
  @ApiProperty({ example: "73219d3e-9bf8-466d-9653-efad87d55988" })
  id!: string;

  @ApiProperty({ example: "341" })
  bankCode!: string;

  @ApiProperty({ example: "0001" })
  bankAgency!: string;

  @ApiProperty({ example: "12345-6" })
  bankAccount!: string;

  @ApiProperty({ example: "CORRENTE" })
  accountType!: string;
}

export class EmergencyContactResponseDto {
  @ApiProperty({ example: "83219d3e-9bf8-466d-9653-efad87d55989" })
  id!: string;

  @ApiProperty({ example: "Maria Silva" })
  name!: string;

  @ApiProperty({ example: "(31) 99999-9999" })
  phone!: string;

  @ApiProperty({ example: "Cônjuge" })
  relationship!: string;

  @ApiProperty({ example: true })
  isPrimary!: boolean;
}

export class EmployeeResponseDto {
  @ApiProperty({ example: "d3b07384-d113-4a0b-bc11-ce1338dfd1d2" })
  id!: string;

  @ApiProperty({ example: "João" })
  firstName!: string;

  @ApiProperty({ example: "Silva" })
  lastName!: string;

  @ApiProperty({ example: "joao.silva@atlas.com" })
  email!: string;

  @ApiProperty({ example: "(31) 98888-8888" })
  phone!: string;

  @ApiProperty({ enum: EmployeeStatus, example: EmployeeStatus.ACTIVE })
  status!: EmployeeStatus;

  @ApiProperty({ example: "2026-07-14T00:00:00.000Z" })
  hireDate!: Date;

  @ApiProperty({ example: "2028-12-31T00:00:00.000Z", required: false })
  terminationDate?: Date;

  @ApiProperty({ example: "5500.00" })
  salary!: string;

  @ApiProperty({ example: "d7b6a4a6-7a13-43ef-b209-efdb17eddfb1", required: false })
  userId?: string;

  @ApiProperty({ example: "a7b6a4a6-7a13-43ef-b209-efdb17eddfb1", required: false })
  departmentId?: string;

  @ApiProperty({ example: "b7b6a4a6-7a13-43ef-b209-efdb17eddfb1", required: false })
  positionId?: string;

  @ApiProperty({ type: PersonalDataResponseDto })
  personalData?: PersonalDataResponseDto;

  @ApiProperty({ type: AddressResponseDto })
  address?: AddressResponseDto;

  @ApiProperty({ type: BankAccountResponseDto })
  bankAccount?: BankAccountResponseDto;

  @ApiProperty({ type: [EmergencyContactResponseDto] })
  emergencyContacts?: EmergencyContactResponseDto[];
}
