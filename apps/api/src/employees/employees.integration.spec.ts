import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { CommonModule } from "../common/common.module";
import { EmployeesModule } from "./employees.module";
import { PrismaService } from "../common/prisma.service";
import { UserRole, EmployeeStatus } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";

import { AuditModule } from "../audit/audit.module";
import { AuditService } from "../audit/audit.service";

describe("Employees Integration Tests (Supertest)", () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockPrisma = {
    employee: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    employeePersonalData: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrisma)),
  };

  const mockAudit = {
    logAction: jest.fn(),
  };

  let hrToken: string;
  let employeeToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CommonModule, AuditModule, EmployeesModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(AuditService)
      .useValue(mockAudit)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Generate test tokens
    hrToken = jwtService.sign({ sub: "user-hr", role: UserRole.HR });
    employeeToken = jwtService.sign({ sub: "user-emp", role: UserRole.EMPLOYEE });
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /employees", () => {
    it("should allow HR access and return employees", async () => {
      const mockList = [{ id: "emp-1", firstName: "Maria", email: "maria@atlas.com" }];
      mockPrisma.employee.findMany.mockResolvedValue(mockList);

      const response = await request(app.getHttpServer())
        .get("/employees")
        .set("Authorization", `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockList);
    });

    it("should forbid Employee access", async () => {
      const response = await request(app.getHttpServer())
        .get("/employees")
        .set("Authorization", `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("POST /employees", () => {
    const validDto = {
      firstName: "João",
      lastName: "Silva",
      email: "joao.silva@atlas.com",
      phone: "(31) 98888-8888",
      hireDate: "2026-07-14",
      salary: "5500.00",
      personalData: {
        cpf: "12345678909", // Validador customizado CPF aceita sem pontos
        birthDate: "1990-05-15",
      },
      address: {
        cep: "30130-010",
        street: "Rua Afonso Pena",
        number: "100",
        neighborhood: "Centro",
        city: "BH",
        state: "MG",
      },
      bankAccount: {
        bankCode: "341",
        bankAgency: "0001",
        bankAccount: "1234-5",
        accountType: "CORRENTE",
      },
    };

    it("should allow HR to create new employee", async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(null);
      mockPrisma.employeePersonalData.findUnique.mockResolvedValue(null);
      mockPrisma.employee.create.mockResolvedValue({ id: "new-emp", ...validDto });

      const response = await request(app.getHttpServer())
        .post("/employees")
        .set("Authorization", `Bearer ${hrToken}`)
        .send(validDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
    });

    it("should return 400 if CPF is invalid", async () => {
      const invalidCpfDto = {
        ...validDto,
        personalData: {
          ...validDto.personalData,
          cpf: "11111111111", // CPF falso de digito repetido
        },
      };

      const response = await request(app.getHttpServer())
        .post("/employees")
        .set("Authorization", `Bearer ${hrToken}`)
        .send(invalidCpfDto);

      expect(response.status).toBe(400);
    });
  });
});
