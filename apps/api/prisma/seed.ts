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
  RecruitmentStatus,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcrypt";

const isProduction = process.env.DATABASE_URL?.includes("render.com");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : undefined,
});
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

  console.log("Banco de dados limpo. Criando registros realistas em grande escala...");

  // Password for all seeded users
  const hashedPassword = await bcrypt.hash("Senha@123", 10);

  // 1. Departamentos (15 no total)
  const departmentsData = [
    { name: "Tecnologia", code: "TECH" },
    { name: "Recursos Humanos", code: "RH" },
    { name: "Financeiro", code: "FIN" },
    { name: "Marketing", code: "MKT" },
    { name: "Vendas", code: "VEN" },
    { name: "Operações", code: "OPE" },
    { name: "Jurídico", code: "JUR" },
    { name: "Comercial", code: "COM" },
    { name: "Suporte Técnico", code: "SUP" },
    { name: "Produto e Design", code: "PROD" },
    { name: "Garantia de Qualidade", code: "QA" },
    { name: "Segurança da Informação", code: "SEC" },
    { name: "Infraestrutura e Redes", code: "INFRA" },
    { name: "Atendimento ao Cliente", code: "SAC" },
    { name: "Administrativo", code: "ADM" },
  ];

  const departments = [];
  for (const dep of departmentsData) {
    const createdDep = await prisma.department.create({
      data: { name: dep.name, code: dep.code, active: true },
    });
    departments.push(createdDep);
  }
  const depTech = departments.find((d) => d.code === "TECH")!;
  const depRH = departments.find((d) => d.code === "RH")!;
  const depFin = departments.find((d) => d.code === "FIN")!;
  const depMkt = departments.find((d) => d.code === "MKT")!;
  const depProd = departments.find((d) => d.code === "PROD")!;
  const depQA = departments.find((d) => d.code === "QA")!;

  // 2. Cargos (Positions - 25+ no total)
  const positionsData = [
    { title: "Chief Technology Officer", dep: depTech, min: 18000, max: 28000 },
    { title: "Tech Lead", dep: depTech, min: 11000, max: 15000 },
    { title: "Desenvolvedor Senior", dep: depTech, min: 8200, max: 12000 },
    { title: "Desenvolvedor Pleno", dep: depTech, min: 5300, max: 8000 },
    { title: "Desenvolvedor Junior", dep: depTech, min: 3200, max: 5000 },
    { title: "Diretor de RH", dep: depRH, min: 12000, max: 18000 },
    { title: "Recrutador Senior", dep: depRH, min: 5500, max: 8000 },
    { title: "Analista de DP Pleno", dep: depRH, min: 4200, max: 6000 },
    { title: "Gerente Financeiro", dep: depFin, min: 9500, max: 15000 },
    { title: "Analista Financeiro Sr", dep: depFin, min: 6500, max: 9000 },
    { title: "Diretor de Marketing", dep: depMkt, min: 11000, max: 17000 },
    { title: "Analista de Growth", dep: depMkt, min: 4500, max: 7000 },
    { title: "Product Designer Pleno", dep: depProd, min: 5500, max: 8500 },
    { title: "Analista de QA Automation", dep: depQA, min: 5000, max: 7800 },
    { title: "DevOps Engineer Sr", dep: depTech, min: 9000, max: 13500 },
    {
      title: "Gerente Comercial",
      dep: departments.find((d) => d.code === "COM")!,
      min: 8000,
      max: 13000,
    },
    {
      title: "Analista Jurídico Pleno",
      dep: departments.find((d) => d.code === "JUR")!,
      min: 5000,
      max: 7500,
    },
    {
      title: "Analista de Suporte Jr",
      dep: departments.find((d) => d.code === "SUP")!,
      min: 2800,
      max: 4000,
    },
    {
      title: "Coordenador de Operações",
      dep: departments.find((d) => d.code === "OPE")!,
      min: 7000,
      max: 10500,
    },
    {
      title: "Atendente de SAC",
      dep: departments.find((d) => d.code === "SAC")!,
      min: 2200,
      max: 3000,
    },
    {
      title: "Auxiliar Administrativo",
      dep: departments.find((d) => d.code === "ADM")!,
      min: 2200,
      max: 3100,
    },
  ];

  const positions = [];
  for (const pos of positionsData) {
    const createdPos = await prisma.position.create({
      data: {
        title: pos.title,
        departmentId: pos.dep.id,
        salaryRangeMin: pos.min,
        salaryRangeMax: pos.max,
        active: true,
      },
    });
    positions.push(createdPos);
  }
  const posCTO = positions.find((p) => p.title === "Chief Technology Officer")!;
  const posDiretorRH = positions.find((p) => p.title === "Diretor de RH")!;
  const posTechLead = positions.find((p) => p.title === "Tech Lead")!;
  const posDevSr = positions.find((p) => p.title === "Desenvolvedor Senior")!;
  const posDevPl = positions.find((p) => p.title === "Desenvolvedor Pleno")!;
  const posRecrutador = positions.find((p) => p.title === "Recrutador Senior")!;

  // 3. Usuários Admin e Managers Principais
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
      salary: 19500.0,
      userId: userManagerTech.id,
      departmentId: depTech.id,
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

  // Vincula gestores aos departamentos
  await prisma.department.update({ where: { id: depTech.id }, data: { managerId: empCTO.id } });
  await prisma.department.update({ where: { id: depRH.id }, data: { managerId: empHR.id } });

  // 4. Gerar 30+ Colaboradores programaticamente
  console.log("Gerando mais de 30 colaboradores realistas...");
  const firstNames = [
    "Juliana",
    "Mateus",
    "Amanda",
    "Felipe",
    "Larissa",
    "Thiago",
    "Camila",
    "Rodrigo",
    "Aline",
    "Bruno",
    "Patricia",
    "Jessica",
    "Gabriel",
    "Milena",
    "Lucas",
    "Carla",
    "Pedro",
    "Roberto",
    "Mariana",
    "Gustavo",
    "Fernanda",
    "Ricardo",
    "Vanessa",
    "Daniel",
    "Sofia",
    "André",
    "Beatriz",
    "Vinicius",
    "Alexandre",
    "Luana",
    "Fábio",
    "Renata",
  ];
  const lastNames = [
    "Santos",
    "Oliveira",
    "Costa",
    "Alves",
    "Souza",
    "Silva",
    "Pereira",
    "Lima",
    "Rodrigues",
    "Ferreira",
    "Mendes",
    "Pinheiro",
    "Henrique",
    "Rossi",
    "Barbosa",
    "Duarte",
    "Gomes",
    "Carvalho",
    "Araujo",
    "Martins",
    "Ribeiro",
    "Cardoso",
    "Teixeira",
    "Vieira",
    "Moreira",
    "Marques",
    "Rocha",
    "Dias",
    "Machado",
    "Pinto",
  ];

  const createdEmployees = [];
  for (let i = 0; i < 32; i++) {
    const fName = firstNames[i % firstNames.length];
    const lName = lastNames[(i * 3) % lastNames.length];
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@atlas.com`;
    const cpf = `111.222.333-${i.toString().padStart(2, "0")}`;
    const phone = `(11) 9${(70000 + i * 17).toString().slice(0, 4)}-${(1000 + i * 29).toString().slice(0, 4)}`;

    // Distribuir entre posições e departamentos
    const posIndex = i % positions.length;
    const pos = positions[posIndex];
    const posOriginal = positionsData[posIndex];
    const dep = departments.find((d) => d.id === pos.departmentId)!;
    const salary = Math.round(posOriginal.min + (posOriginal.max - posOriginal.min) * 0.4);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: UserRole.EMPLOYEE,
        firstName: fName,
        lastName: lName,
        isActive: true,
      },
    });

    const employee = await prisma.employee.create({
      data: {
        firstName: fName,
        lastName: lName,
        email,
        phone,
        status: EmployeeStatus.ACTIVE,
        hireDate: new Date("2024-02-15"),
        salary,
        userId: user.id,
        departmentId: dep.id,
        positionId: pos.id,
        personalData: {
          create: {
            cpf,
            rg: `RG-${i * 1421}`,
            birthDate: new Date("1995-04-12"),
            gender: i % 2 === 0 ? "Feminino" : "Masculino",
            maritalStatus: "Solteiro",
          },
        },
        address: {
          create: {
            cep: "01310-000",
            street: "Alameda Santos",
            number: `${100 + i}`,
            neighborhood: "Cerqueira César",
            city: "São Paulo",
            state: "SP",
          },
        },
        bankAccount: {
          create: {
            bankCode: "033",
            bankAgency: "1234",
            bankAccount: `ACC-${i * 987}`,
            accountType: "CORRENTE",
          },
        },
        emergencyContacts: {
          create: {
            name: `Contato Urgência ${fName}`,
            phone,
            relationship: "Familiar",
            isPrimary: true,
          },
        },
      },
    });
    createdEmployees.push(employee);
  }
  console.log(`${createdEmployees.length} colaboradores criados com sucesso.`);

  // 5. Férias (25+ solicitações)
  console.log("Criando histórico amplo de Férias...");
  const vacationStatuses = [
    VacationStatus.APPROVED,
    VacationStatus.PENDING,
    VacationStatus.REJECTED,
  ];
  for (let i = 0; i < 28; i++) {
    const emp = createdEmployees[i % createdEmployees.length];
    const status = vacationStatuses[i % vacationStatuses.length];
    const start = new Date("2026-08-01");
    start.setDate(start.getDate() + i * 5);
    const end = new Date(start);
    end.setDate(end.getDate() + 15);

    await prisma.vacation.create({
      data: {
        employeeId: emp.id,
        startDate: start,
        endDate: end,
        status,
        approvedById: status === VacationStatus.APPROVED ? empHR.id : null,
      },
    });
  }

  // 6. Atestados e Afastamentos (20+ registros)
  console.log("Criando histórico amplo de Atestados...");
  const leaveTypes = [LeaveType.MEDICAL, LeaveType.LEGAL, LeaveType.PARENTAL, LeaveType.OTHER];
  const leaveStatuses = [LeaveStatus.APPROVED, LeaveStatus.PENDING, LeaveStatus.REJECTED];
  for (let i = 0; i < 22; i++) {
    const emp = createdEmployees[(i * 2) % createdEmployees.length];
    const type = leaveTypes[i % leaveTypes.length];
    const status = leaveStatuses[i % leaveStatuses.length];
    const start = new Date("2026-04-01");
    start.setDate(start.getDate() + i * 8);
    const end = new Date(start);
    end.setDate(end.getDate() + 2);

    await prisma.leave.create({
      data: {
        employeeId: emp.id,
        type,
        customType: type === LeaveType.OTHER ? "Curso Especialização " + i : null,
        startDate: start,
        endDate: end,
        description: `Justificativa/Descrição detalhada para afastamento do índice ${i}.`,
        status,
        approvedById: status === LeaveStatus.APPROVED ? empHR.id : null,
        attachmentUrl: i % 2 === 0 ? `https://utfs.io/f/atestado_doc_${i}.pdf` : null,
      },
    });
  }

  // 7. Vagas e Recrutamento (20+ vagas)
  console.log("Criando mais de 20 vagas de emprego para testes de paginação...");
  const jobsData = [
    {
      title: "Desenvolvedor React Pleno",
      desc: "React, Next.js, Tailwind",
      type: EmploymentType.CLT,
      sen: Seniority.MID,
      work: WorkModel.HYBRID,
      pos: posDevPl,
    },
    {
      title: "Analista de Recrutamento Tech",
      desc: "Recrutamento técnico de engenharia",
      type: EmploymentType.CLT,
      sen: Seniority.MID,
      work: WorkModel.REMOTE,
      pos: posRecrutador,
    },
    {
      title: "Tech Lead Backend",
      desc: "NodeJS, PostgreSQL, Prisma, AWS",
      type: EmploymentType.CLT,
      sen: Seniority.LEAD,
      work: WorkModel.REMOTE,
      pos: posTechLead,
    },
    {
      title: "Desenvolvedor Backend Sr",
      desc: "Liderança técnica, arquitetura de APIs",
      type: EmploymentType.CLT,
      sen: Seniority.SENIOR,
      work: WorkModel.ONSITE,
      pos: posDevSr,
    },
    {
      title: "Analista Financeiro Pleno",
      desc: "Contas a pagar, reports financeiros",
      type: EmploymentType.CLT,
      sen: Seniority.MID,
      work: WorkModel.ONSITE,
      pos: positions.find((p) => p.title === "Analista Financeiro Sr")!,
    },
    {
      title: "UX Designer Jr",
      desc: "Figma, wireframes, user testing",
      type: EmploymentType.CLT,
      sen: Seniority.JUNIOR,
      work: WorkModel.HYBRID,
      pos: positions.find((p) => p.title === "Product Designer Pleno")!,
    },
    {
      title: "QA Engineer Pleno",
      desc: "Automação de testes em Cypress/Playwright",
      type: EmploymentType.CLT,
      sen: Seniority.MID,
      work: WorkModel.REMOTE,
      pos: positions.find((p) => p.title === "Analista de QA Automation")!,
    },
    {
      title: "DevOps Engineer Pleno",
      desc: "CI/CD, Terraform, Kubernetes",
      type: EmploymentType.PJ,
      sen: Seniority.MID,
      work: WorkModel.REMOTE,
      pos: positions.find((p) => p.title === "DevOps Engineer Sr")!,
    },
    {
      title: "Gerente Comercial B2B",
      desc: "Gestão do pipeline comercial",
      type: EmploymentType.CLT,
      sen: Seniority.MID,
      work: WorkModel.ONSITE,
      pos: positions.find((p) => p.title === "Gerente Comercial")!,
    },
    {
      title: "Analista de Marketing Digital",
      desc: "Campanhas pagas, SEO, redes sociais",
      type: EmploymentType.CLT,
      sen: Seniority.MID,
      work: WorkModel.HYBRID,
      pos: positions.find((p) => p.title === "Analista de Growth")!,
    },
  ];

  const recruitments = [];
  for (let i = 0; i < 22; i++) {
    const jobInfo = jobsData[i % jobsData.length];
    const rec = await prisma.recruitment.create({
      data: {
        title: `${jobInfo.title} #${i + 1}`,
        slug: `${jobInfo.title.toLowerCase().replace(/ /g, "-")}-${i}`,
        description: `${jobInfo.desc}. Requisitos completos para a vaga #${i + 1}.`,
        salaryMin: 4000 + i * 200,
        salaryMax: 6000 + i * 300,
        status: i % 4 === 0 ? RecruitmentStatus.DRAFT : RecruitmentStatus.OPEN,
        employmentType: jobInfo.type,
        seniority: jobInfo.sen,
        departmentId: jobInfo.pos.departmentId,
        positionId: jobInfo.pos.id,
        createdById: userHR.id,
        workModel: jobInfo.work,
      },
    });
    recruitments.push(rec);
  }

  // 8. Candidatos e Inscrições (35+ candidaturas)
  console.log("Inserindo amplo volume de candidatos e inscrições...");
  const candidateNames = [
    "Alice",
    "Bob",
    "Clara",
    "Daniel",
    "Eduarda",
    "Filipe",
    "Giovanna",
    "Hugo",
    "Isabela",
    "João",
    "Karina",
    "Leonardo",
    "Manuela",
    "Nathan",
    "Olívia",
    "Paulo",
    "Raquel",
    "Samuel",
    "Tânia",
    "Vitor",
    "Yasmin",
    "Zeca",
    "Adriano",
    "Bianca",
    "Caio",
    "Diana",
    "Emílio",
    "Flávia",
    "Geraldo",
    "Helena",
    "Igor",
    "Júlia",
    "Kátia",
    "Lorena",
    "Murilo",
  ];
  const candidateLastNames = [
    "Mendes",
    "Pinheiro",
    "Henrique",
    "Rossi",
    "Barbosa",
    "Duarte",
    "Gomes",
    "Carvalho",
    "Araujo",
    "Martins",
    "Ribeiro",
    "Cardoso",
    "Teixeira",
    "Vieira",
    "Moreira",
    "Marques",
    "Rocha",
    "Dias",
    "Machado",
    "Pinto",
    "Azevedo",
    "Cunha",
    "Nascimento",
    "Barros",
    "Correia",
    "Campos",
    "Moraes",
    "Guimarães",
    "Miranda",
  ];

  const appStatuses = [
    ApplicationStatus.SCREENING,
    ApplicationStatus.HR_INTERVIEW,
    ApplicationStatus.TECHNICAL_TEST,
    ApplicationStatus.OFFER,
    ApplicationStatus.HIRED,
    ApplicationStatus.REJECTED,
  ];

  for (let i = 0; i < 35; i++) {
    const firstName = candidateNames[i % candidateNames.length];
    const lastName = candidateLastNames[(i * 2) % candidateLastNames.length];
    const email = `candidato.${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@exemplo.com`;
    const phone = `(11) 99000-${i.toString().padStart(4, "0")}`;
    const status = appStatuses[i % appStatuses.length];
    const job = recruitments[i % recruitments.length];

    const candidate = await prisma.candidate.create({
      data: { firstName, lastName, email, phone },
    });

    await prisma.application.create({
      data: {
        candidateId: candidate.id,
        recruitmentId: job.id,
        status,
        resumeUrl: `https://utfs.io/f/curriculo_${firstName.toLowerCase()}_${lastName.toLowerCase()}.pdf`,
        coverLetter: `Me candidato para a vaga #${i + 1}.`,
      },
    });
  }

  // 9. Marcações de Ponto (Juliana - Colaboradora regular)
  console.log("Criando marcações de ponto e relatórios diários...");
  const targetEmployee = createdEmployees[0];
  const baseDate = new Date();
  for (let i = 10; i >= 1; i--) {
    const recordDate = new Date(baseDate);
    recordDate.setDate(baseDate.getDate() - i);
    const dateStr = recordDate.toISOString().split("T")[0];

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
          employeeId: targetEmployee.id,
          type: rec.type as any,
          timestamp: recTimestamp,
          source: "WEB",
        },
      });
    }

    await prisma.timeDaySummary.create({
      data: {
        employeeId: targetEmployee.id,
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
