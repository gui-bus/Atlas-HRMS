import * as dotenv from "dotenv";
dotenv.config();

import {
  PrismaClient,
  UserRole,
  EmployeeStatus,
  LeaveType,
  LeaveStatus,
  VacationStatus,
  WorkModel,
  ApplicationStatus,
  EmploymentType,
  Seniority,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcrypt";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Iniciando limpeza do banco de dados...");

  // Delete in correct order to respect constraints
  await prisma.application.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.recruitment.deleteMany();
  await prisma.vacation.deleteMany();
  await prisma.leave.deleteMany();
  await prisma.document.deleteMany();
  await prisma.timeRecord.deleteMany();
  await prisma.timeDaySummary.deleteMany();
  await prisma.hourBankLedger.deleteMany();
  await prisma.timeCorrectionRequest.deleteMany();
  await prisma.overtimeApprovalRequest.deleteMany();
  await prisma.emergencyContact.deleteMany();
  await prisma.employeeBankAccount.deleteMany();
  await prisma.employeeAddress.deleteMany();
  await prisma.employeePersonalData.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
  await prisma.position.deleteMany();
  await prisma.department.deleteMany();

  console.log("Banco de dados limpo. Criando registros realistas...");

  // Password for all seeded users
  const hashedPassword = await bcrypt.hash("Senha@123", 10);

  // 1. Departamentos
  const depTecnologia = await prisma.department.create({
    data: { name: "Tecnologia", code: "TECH", active: true },
  });
  const depRH = await prisma.department.create({
    data: { name: "Recursos Humanos", code: "RH", active: true },
  });
  const depFinanceiro = await prisma.department.create({
    data: { name: "Financeiro", code: "FIN", active: true },
  });
  const depMarketing = await prisma.department.create({
    data: { name: "Marketing", code: "MKT", active: true },
  });

  // 2. Cargos (Positions)
  const posCTO = await prisma.position.create({
    data: {
      title: "Chief Technology Officer",
      departmentId: depTecnologia.id,
      salaryRangeMin: 15000,
      salaryRangeMax: 25000,
      active: true,
    },
  });
  const posTechLead = await prisma.position.create({
    data: {
      title: "Tech Lead",
      departmentId: depTecnologia.id,
      salaryRangeMin: 10000,
      salaryRangeMax: 14000,
      active: true,
    },
  });
  const posDevSenior = await prisma.position.create({
    data: {
      title: "Desenvolvedor Senior",
      departmentId: depTecnologia.id,
      salaryRangeMin: 8000,
      salaryRangeMax: 11000,
      active: true,
    },
  });
  const posDevPleno = await prisma.position.create({
    data: {
      title: "Desenvolvedor Pleno",
      departmentId: depTecnologia.id,
      salaryRangeMin: 5000,
      salaryRangeMax: 7800,
      active: true,
    },
  });
  const posDiretorRH = await prisma.position.create({
    data: {
      title: "Diretor de RH",
      departmentId: depRH.id,
      salaryRangeMin: 12000,
      salaryRangeMax: 18000,
      active: true,
    },
  });
  const posRecrutador = await prisma.position.create({
    data: {
      title: "Recrutador",
      departmentId: depRH.id,
      salaryRangeMin: 4000,
      salaryRangeMax: 6500,
      active: true,
    },
  });
  await prisma.position.create({
    data: {
      title: "Gerente Financeiro",
      departmentId: depFinanceiro.id,
      salaryRangeMin: 9000,
      salaryRangeMax: 14000,
      active: true,
    },
  });
  await prisma.position.create({
    data: {
      title: "Analista Financeiro",
      departmentId: depFinanceiro.id,
      salaryRangeMin: 4500,
      salaryRangeMax: 7000,
      active: true,
    },
  });
  const posAnalistaMkt = await prisma.position.create({
    data: {
      title: "Analista de Marketing",
      departmentId: depMarketing.id,
      salaryRangeMin: 4200,
      salaryRangeMax: 6800,
      active: true,
    },
  });

  // 3. Usuários Puros / Administradores
  await prisma.user.create({
    data: {
      email: "admin@atlas.com",
      password: hashedPassword,
      role: UserRole.ADMIN,
      firstName: "Guilherme",
      lastName: "Administrador",
      isActive: true,
    },
  });

  // 4. Colaboradores com Usuários
  // -- RH Manager
  const userHR = await prisma.user.create({
    data: {
      email: "rh@atlas.com",
      password: hashedPassword,
      role: UserRole.HR,
      firstName: "Fernanda",
      lastName: "Souza",
      isActive: true,
    },
  });
  const empHR = await prisma.employee.create({
    data: {
      firstName: "Fernanda",
      lastName: "Souza",
      email: "rh@atlas.com",
      phone: "(11) 98888-1111",
      status: EmployeeStatus.ACTIVE,
      hireDate: new Date("2024-01-10"),
      salary: 13500.0,
      userId: userHR.id,
      departmentId: depRH.id,
      positionId: posDiretorRH.id,
      personalData: {
        create: {
          cpf: "123.456.789-01",
          rg: "12.345.678-9",
          birthDate: new Date("1988-06-25"),
          gender: "Feminino",
          maritalStatus: "Casada",
        },
      },
      address: {
        create: {
          cep: "01310-100",
          street: "Avenida Paulista",
          number: "1000",
          complement: "Apto 151",
          neighborhood: "Bela Vista",
          city: "São Paulo",
          state: "SP",
        },
      },
      bankAccount: {
        create: {
          bankCode: "341",
          bankAgency: "0100",
          bankAccount: "12345-6",
          accountType: "CORRENTE",
        },
      },
    },
  });

  // -- Gestor Tecnologia (CTO)
  const userManagerTech = await prisma.user.create({
    data: {
      email: "gestor.tech@atlas.com",
      password: hashedPassword,
      role: UserRole.MANAGER,
      firstName: "Carlos",
      lastName: "Eduardo",
      isActive: true,
    },
  });
  const empCTO = await prisma.employee.create({
    data: {
      firstName: "Carlos",
      lastName: "Eduardo",
      email: "gestor.tech@atlas.com",
      phone: "(11) 98888-2222",
      status: EmployeeStatus.ACTIVE,
      hireDate: new Date("2023-05-15"),
      salary: 19000.0,
      userId: userManagerTech.id,
      departmentId: depTecnologia.id,
      positionId: posCTO.id,
      personalData: {
        create: {
          cpf: "234.567.890-12",
          rg: "23.456.789-0",
          birthDate: new Date("1983-12-04"),
          gender: "Masculino",
          maritalStatus: "Casado",
        },
      },
      address: {
        create: {
          cep: "04571-010",
          street: "Rua Berrini",
          number: "500",
          complement: "Bloco B",
          neighborhood: "Cidade Monções",
          city: "São Paulo",
          state: "SP",
        },
      },
      bankAccount: {
        create: {
          bankCode: "001",
          bankAgency: "3200",
          bankAccount: "98765-4",
          accountType: "CORRENTE",
        },
      },
    },
  });

  // Set Manager for Technology Department
  await prisma.department.update({
    where: { id: depTecnologia.id },
    data: { managerId: empCTO.id },
  });
  await prisma.department.update({
    where: { id: depRH.id },
    data: { managerId: empHR.id },
  });

  // -- Funcionários Regulares (EMPLOYEE)
  const employeesData = [
    {
      firstName: "Juliana",
      lastName: "Santos",
      email: "juliana.santos@atlas.com",
      phone: "(11) 97777-1111",
      birth: "1994-08-14",
      gender: "Feminino",
      marital: "Solteira",
      cpf: "345.678.901-23",
      salary: 6200.0,
      posId: posDevPleno.id,
      depId: depTecnologia.id,
    },
    {
      firstName: "Mateus",
      lastName: "Oliveira",
      email: "mateus.oliveira@atlas.com",
      phone: "(11) 97777-2222",
      birth: "1992-03-22",
      gender: "Masculino",
      marital: "Casado",
      cpf: "456.789.012-34",
      salary: 10500.0,
      posId: posTechLead.id,
      depId: depTecnologia.id,
    },
    {
      firstName: "Amanda",
      lastName: "Costa",
      email: "amanda.costa@atlas.com",
      phone: "(11) 97777-3333",
      birth: "1996-11-02",
      gender: "Feminino",
      marital: "Solteira",
      cpf: "567.890.123-45",
      salary: 4900.0,
      posId: posRecrutador.id,
      depId: depRH.id,
    },
    {
      firstName: "Felipe",
      lastName: "Alves",
      email: "felipe.alves@atlas.com",
      phone: "(11) 97777-4444",
      birth: "1990-09-30",
      gender: "Masculino",
      marital: "Divorciado",
      cpf: "678.901.234-56",
      salary: 5800.0,
      posId: posDevPleno.id,
      depId: depTecnologia.id,
    },
    {
      firstName: "Larissa",
      lastName: "Souza",
      email: "larissa.souza@atlas.com",
      phone: "(11) 97777-5555",
      birth: "1997-04-18",
      gender: "Feminino",
      marital: "Solteira",
      cpf: "789.012.345-67",
      salary: 4300.0,
      posId: posAnalistaMkt.id,
      depId: depMarketing.id,
    },
    {
      firstName: "Thiago",
      lastName: "Silva",
      email: "thiago.silva@atlas.com",
      phone: "(11) 97777-6666",
      birth: "1989-07-07",
      gender: "Masculino",
      marital: "Casado",
      cpf: "890.123.456-78",
      salary: 8900.0,
      posId: posDevSenior.id,
      depId: depTecnologia.id,
    },
  ];

  const createdEmployees = [];
  for (const emp of employeesData) {
    const user = await prisma.user.create({
      data: {
        email: emp.email,
        password: hashedPassword,
        role: UserRole.EMPLOYEE,
        firstName: emp.firstName,
        lastName: emp.lastName,
        isActive: true,
      },
    });

    const employee = await prisma.employee.create({
      data: {
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        phone: emp.phone,
        status: EmployeeStatus.ACTIVE,
        hireDate: new Date("2024-03-01"),
        salary: emp.salary,
        userId: user.id,
        departmentId: emp.depId,
        positionId: emp.posId,
        personalData: {
          create: {
            cpf: emp.cpf,
            rg: "32.123.456-7",
            birthDate: new Date(emp.birth),
            gender: emp.gender,
            maritalStatus: emp.marital,
          },
        },
        address: {
          create: {
            cep: "01414-000",
            street: "Alameda Lorena",
            number: "150",
            complement: "Apto 33",
            neighborhood: "Jardins",
            city: "São Paulo",
            state: "SP",
          },
        },
        bankAccount: {
          create: {
            bankCode: "033",
            bankAgency: "1500",
            bankAccount: "54321-0",
            accountType: "CORRENTE",
          },
        },
        emergencyContacts: {
          create: {
            name: "Contato Emergência " + emp.firstName,
            phone: emp.phone,
            relationship: "Familiar",
            isPrimary: true,
          },
        },
      },
    });
    createdEmployees.push(employee);
  }

  console.log(`${createdEmployees.length} colaboradores criados com sucesso.`);

  // 5. Férias (Vacations)
  console.log("Criando solicitações de Férias...");
  // Juliana: Férias passadas (Aprovadas)
  await prisma.vacation.create({
    data: {
      employeeId: createdEmployees[0].id,
      startDate: new Date("2026-01-10"),
      endDate: new Date("2026-01-25"),
      status: VacationStatus.APPROVED,
      approvedById: empHR.id,
    },
  });
  // Mateus: Férias futuras (Pendente)
  await prisma.vacation.create({
    data: {
      employeeId: createdEmployees[1].id,
      startDate: new Date("2026-12-10"),
      endDate: new Date("2026-12-30"),
      status: VacationStatus.PENDING,
    },
  });
  // Thiago: Férias futuras (Aprovada)
  await prisma.vacation.create({
    data: {
      employeeId: createdEmployees[5].id,
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-09-15"),
      status: VacationStatus.APPROVED,
      approvedById: empHR.id,
    },
  });

  // 6. Atestados e Licenças (Leaves)
  console.log("Criando atestados e licenças...");
  // Juliana: Atestado Médico Aprovado (Passado)
  await prisma.leave.create({
    data: {
      employeeId: createdEmployees[0].id,
      type: LeaveType.MEDICAL,
      startDate: new Date("2026-05-12"),
      endDate: new Date("2026-05-13"),
      description: "Atestado médico de 2 dias por amigdalite severa.",
      status: LeaveStatus.APPROVED,
      approvedById: empHR.id,
      attachmentUrl: "https://utfs.io/f/atestado_medico_juliana.pdf",
    },
  });
  // Thiago: Licença Legal Pendente (Futura)
  await prisma.leave.create({
    data: {
      employeeId: createdEmployees[5].id,
      type: LeaveType.LEGAL,
      startDate: new Date("2026-08-10"),
      endDate: new Date("2026-08-13"),
      description: "Solicitação de licença casamento (Gala).",
      status: LeaveStatus.PENDING,
    },
  });
  // Larissa: Outros Afastamentos com customType (Aprovado)
  await prisma.leave.create({
    data: {
      employeeId: createdEmployees[4].id,
      type: LeaveType.OTHER,
      customType: "Curso de Liderança MKT",
      startDate: new Date("2026-07-20"),
      endDate: new Date("2026-07-22"),
      description: "Afastamento aprovado pela diretoria para capacitação externa.",
      status: LeaveStatus.APPROVED,
      approvedById: empHR.id,
    },
  });

  // 7. Vagas e Recrutamento (ATS)
  console.log("Criando vagas de recrutamento, candidatos e candidaturas...");
  const jobFrontend = await prisma.recruitment.create({
    data: {
      title: "Desenvolvedor React Pleno",
      slug: "desenvolvedor-react-pleno",
      description:
        "Buscamos desenvolvedor especialista em React, TypeScript, Next.js e TailwindCSS para atuar no enriquecimento dos nossos produtos internos.",
      salaryMin: 6500.0,
      salaryMax: 8000.0,
      status: "OPEN",
      employmentType: EmploymentType.CLT,
      seniority: Seniority.MID,
      departmentId: depTecnologia.id,
      positionId: posDevPleno.id,
      createdById: userHR.id,
      workModel: WorkModel.HYBRID,
    },
  });

  const jobRecruiter = await prisma.recruitment.create({
    data: {
      title: "Analista de Recrutamento Tech",
      slug: "analista-de-recrutamento-tech",
      description:
        "Profissional de R&S focado em atração de talentos de tecnologia para atuar no crescimento acelerado da equipe de engenharia.",
      salaryMin: 5000.0,
      salaryMax: 6500.0,
      status: "OPEN",
      employmentType: EmploymentType.CLT,
      seniority: Seniority.MID,
      departmentId: depRH.id,
      positionId: posRecrutador.id,
      createdById: userHR.id,
      workModel: WorkModel.REMOTE,
    },
  });

  // Candidatos & Inscrições (Job Applications)
  const candidatos = [
    {
      firstName: "Bruno",
      lastName: "Mendes",
      email: "bruno.mendes@candidato.com",
      phone: "(11) 96111-2222",
      status: ApplicationStatus.SUBMITTED,
      job: jobFrontend,
    },
    {
      firstName: "Jessica",
      lastName: "Pinheiro",
      email: "jessica.p@candidato.com",
      phone: "(11) 96222-3333",
      status: ApplicationStatus.SCREENING,
      job: jobFrontend,
    },
    {
      firstName: "Gabriel",
      lastName: "Henrique",
      email: "gabriel.h@candidato.com",
      phone: "(11) 96333-4444",
      status: ApplicationStatus.TECHNICAL_TEST,
      job: jobFrontend,
    },
    {
      firstName: "Milena",
      lastName: "Rossi",
      email: "milena.rossi@candidato.com",
      phone: "(11) 96444-5555",
      status: ApplicationStatus.TECHNICAL_INTERVIEW,
      job: jobFrontend,
    },
    {
      firstName: "Patricia",
      lastName: "Lima",
      email: "patricia.lima@candidato.com",
      phone: "(11) 96555-6666",
      status: ApplicationStatus.HIRED,
      job: jobFrontend,
    },
    {
      firstName: "Lucas",
      lastName: "Silveira",
      email: "lucas.s@candidato.com",
      phone: "(11) 96666-7777",
      status: ApplicationStatus.REJECTED,
      job: jobFrontend,
    },
    {
      firstName: "Carla",
      lastName: "Barbosa",
      email: "carla.barbosa@candidato.com",
      phone: "(11) 96777-8888",
      status: ApplicationStatus.SUBMITTED,
      job: jobRecruiter,
    },
    {
      firstName: "Pedro",
      lastName: "Duarte",
      email: "pedro.duarte@candidato.com",
      phone: "(11) 96888-9999",
      status: ApplicationStatus.FINAL_INTERVIEW,
      job: jobRecruiter,
    },
  ];

  for (const cand of candidatos) {
    const candidate = await prisma.candidate.create({
      data: {
        firstName: cand.firstName,
        lastName: cand.lastName,
        email: cand.email,
        phone: cand.phone,
      },
    });

    await prisma.application.create({
      data: {
        candidateId: candidate.id,
        recruitmentId: cand.job.id,
        status: cand.status,
        resumeUrl: `https://utfs.io/f/curriculo_${candidate.firstName.toLowerCase()}_${candidate.lastName.toLowerCase()}.pdf`,
        coverLetter: `Olá! Me interesso muito pela vaga de ${cand.job.title} e acredito que tenho as qualificações descritas.`,
      },
    });
  }

  // 8. Registro de Ponto e Banco de Horas (Time Attendance)
  console.log("Criando marcações de ponto históricas...");
  // Let's create some time records for Juliana (createdEmployees[0]) for the last 5 days
  const baseDate = new Date();
  for (let i = 5; i >= 1; i--) {
    const recordDate = new Date(baseDate);
    recordDate.setDate(baseDate.getDate() - i);
    const dateStr = recordDate.toISOString().split("T")[0];

    // Day 1 to 5 records: 08:00, 12:00, 13:00, 17:00
    const records = [
      { type: "ENTRY", hour: 8, minute: 0 },
      { type: "INTERVAL_OUT", hour: 12, minute: 0 },
      { type: "INTERVAL_IN", hour: 13, minute: 0 },
      { type: "EXIT", hour: 17, minute: 0 },
    ];

    for (const rec of records) {
      const recTimestamp = new Date(
        `${dateStr}T${rec.hour.toString().padStart(2, "0")}:${rec.minute.toString().padStart(2, "0")}:00.000Z`,
      );
      await prisma.timeRecord.create({
        data: {
          employeeId: createdEmployees[0].id,
          type: rec.type as any,
          timestamp: recTimestamp,
          source: "WEB",
        },
      });
    }

    // Daily summary for bank of hours (8 hours worked = 0 minutes balance change, assuming 8h workday)
    await prisma.timeDaySummary.create({
      data: {
        employeeId: createdEmployees[0].id,
        date: new Date(dateStr),
        grossMinutes: 540,
        intervalMinutes: 60,
        netMinutes: 480,
        expectedMinutes: 480,
        overtimeMinutes: 0,
        debtMinutes: 0,
      },
    });
  }

  console.log("Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro ao rodar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });
