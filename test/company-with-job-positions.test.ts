import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from '../src/modules/companies/companies.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreateCompanyWithJobPositionsDto } from '../src/modules/companies/dto/create.dto';

describe('Company with JobPositions Integration Test', () => {
  let companiesService: CompaniesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompaniesService, PrismaService],
    }).compile();

    companiesService = module.get<CompaniesService>(CompaniesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.company_job_position.deleteMany({
      where: { companyId: { gt: 0 } },
    });
    await prisma.company.deleteMany({
      where: { id: { gt: 0 } },
    });
    await prisma.job_position.deleteMany({
      where: { id: { gt: 0 } },
    });
  });

  describe('Company Creation with JobPositions', () => {
    it('should create a company with multiple job positions', async () => {
      // Create job positions first
      const jobPosition1 = await prisma.job_position.create({
        data: { name: 'Software Engineer' },
      });
      const jobPosition2 = await prisma.job_position.create({
        data: { name: 'Project Manager' },
      });
      const jobPosition3 = await prisma.job_position.create({
        data: { name: 'UX Designer' },
      });

      // Create company with job positions
      const createCompanyDto: CreateCompanyWithJobPositionsDto = {
        name: 'Tech Company Ltd.',
        thaiDescription: 'บริษัทเทคโนโลยีชั้นนำ',
        engDescription: 'Leading Technology Company',
        address: '123 Tech Street, Bangkok',
        tel: '02-123-4567',
        email: 'contact@techcompany.com',
        jobPositions: [
          { id: jobPosition1.id },
          { id: jobPosition2.id },
          { id: jobPosition3.id },
        ],
      };

      const company = await companiesService.create(createCompanyDto);

      // Verify company creation
      expect(company).toBeDefined();
      expect(company.name).toBe('Tech Company Ltd.');
      expect(company.thaiDescription).toBe('บริษัทเทคโนโลยีชั้นนำ');
      expect(company.engDescription).toBe('Leading Technology Company');
      expect(company.address).toBe('123 Tech Street, Bangkok');
      expect(company.tel).toBe('02-123-4567');
      expect(company.email).toBe('contact@techcompany.com');

      // Verify job positions relationship
      expect(company.company_job_positions).toBeDefined();
      expect(company.company_job_positions).toHaveLength(3);
      
      const jobPositionNames = company.company_job_positions.map(
        (jp) => jp.jobPosition.name,
      );
      expect(jobPositionNames).toContain('Software Engineer');
      expect(jobPositionNames).toContain('Project Manager');
      expect(jobPositionNames).toContain('UX Designer');
    });

    it('should create a company with no job positions', async () => {
      const createCompanyDto: CreateCompanyWithJobPositionsDto = {
        name: 'Startup Inc.',
        thaiDescription: 'บริษัทสตาร์ทอัพ',
        engDescription: 'Startup Company',
        address: '456 Startup Ave, Bangkok',
        tel: '02-987-6543',
        email: 'hello@startup.com',
        jobPositions: [],
      };

      const company = await companiesService.create(createCompanyDto);

      // Verify company creation
      expect(company).toBeDefined();
      expect(company.name).toBe('Startup Inc.');
      expect(company.company_job_positions).toBeDefined();
      expect(company.company_job_positions).toHaveLength(0);
    });
  });

  describe('Company Update with JobPositions', () => {
    it('should update company details and job positions', async () => {
      // Create initial data
      const jobPosition1 = await prisma.job_position.create({
        data: { name: 'Developer' },
      });
      const jobPosition2 = await prisma.job_position.create({
        data: { name: 'Designer' },
      });
      const jobPosition3 = await prisma.job_position.create({
        data: { name: 'Analyst' },
      });

      const company = await companiesService.create({
        name: 'Original Company',
        thaiDescription: 'บริษัทต้นฉบับ',
        engDescription: 'Original Company',
        address: '789 Original St',
        tel: '02-111-2222',
        email: 'original@company.com',
        jobPositions: [{ id: jobPosition1.id }, { id: jobPosition2.id }],
      });

      // Update company with new job positions
      const updateCompanyDto: CreateCompanyWithJobPositionsDto = {
        name: 'Updated Company Ltd.',
        thaiDescription: 'บริษัทที่อัพเดทแล้ว',
        engDescription: 'Updated Company Limited',
        address: '321 Updated Ave',
        tel: '02-333-4444',
        email: 'updated@company.com',
        jobPositions: [
          { id: jobPosition2.id }, // Keep existing
          { id: jobPosition3.id }, // Add new
        ],
      };

      const updatedCompany = await companiesService.update(
        company.id,
        updateCompanyDto,
      );

      // Verify company details update
      expect(updatedCompany.name).toBe('Updated Company Ltd.');
      expect(updatedCompany.thaiDescription).toBe('บริษัทที่อัพเดทแล้ว');
      expect(updatedCompany.engDescription).toBe('Updated Company Limited');
      expect(updatedCompany.address).toBe('321 Updated Ave');
      expect(updatedCompany.tel).toBe('02-333-4444');
      expect(updatedCompany.email).toBe('updated@company.com');

      // Verify job positions update
      expect(updatedCompany.company_job_positions).toHaveLength(2);
      const jobPositionNames = updatedCompany.company_job_positions.map(
        (jp) => jp.jobPosition.name,
      );
      expect(jobPositionNames).toContain('Designer'); // Kept
      expect(jobPositionNames).toContain('Analyst'); // Added
      expect(jobPositionNames).not.toContain('Developer'); // Removed
    });
  });

  describe('Company Query Operations', () => {
    it('should find company with job positions', async () => {
      // Create test data
      const jobPosition = await prisma.job_position.create({
        data: { name: 'Full Stack Developer' },
      });

      const company = await companiesService.create({
        name: 'Query Test Company',
        thaiDescription: 'บริษัททดสอบการค้นหา',
        engDescription: 'Query Test Company',
        address: '999 Query Blvd',
        tel: '02-555-6666',
        email: 'query@test.com',
        jobPositions: [{ id: jobPosition.id }],
      });

      // Test findOne
      const foundCompany = await companiesService.findOne(company.id);
      expect(foundCompany).toBeDefined();
      expect(foundCompany.name).toBe('Query Test Company');
      expect(foundCompany.company_job_positions).toHaveLength(1);
      expect(foundCompany.company_job_positions[0].jobPosition.name).toBe(
        'Full Stack Developer',
      );

      // Test findAll
      const allCompanies = await companiesService.findAll({
        page: 1,
        limit: 10,
      });
      expect(allCompanies.data).toHaveLength(1);
      expect(allCompanies.data[0].name).toBe('Query Test Company');
      expect(allCompanies.data[0].company_job_positions).toHaveLength(1);
    });

    it('should filter companies by search term', async () => {
      // Create multiple companies
      await companiesService.create({
        name: 'Apple Inc.',
        thaiDescription: 'แอปเปิ้ล',
        engDescription: 'Apple Inc.',
        address: '1 Apple Way',
        tel: '02-111-1111',
        email: 'contact@apple.com',
        jobPositions: [],
      });

      await companiesService.create({
        name: 'Banana Corp',
        thaiDescription: 'บริษักกล้วย',
        engDescription: 'Banana Corporation',
        address: '2 Banana St',
        tel: '02-222-2222',
        email: 'info@banana.com',
        jobPositions: [],
      });

      // Test search by name
      const appleResults = await companiesService.findAll({
        page: 1,
        limit: 10,
        search: 'Apple',
      });
      expect(appleResults.data).toHaveLength(1);
      expect(appleResults.data[0].name).toBe('Apple Inc.');

      // Test search by thai description
      const bananaResults = await companiesService.findAll({
        page: 1,
        limit: 10,
        search: 'กล้วย',
      });
      expect(bananaResults.data).toHaveLength(1);
      expect(bananaResults.data[0].name).toBe('Banana Corp');
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent job position IDs gracefully', async () => {
      const createCompanyDto: CreateCompanyWithJobPositionsDto = {
        name: 'Error Test Company',
        thaiDescription: 'บริษัททดสอบข้อผิดพลาด',
        engDescription: 'Error Test Company',
        address: '777 Error Lane',
        tel: '02-777-7777',
        email: 'error@test.com',
        jobPositions: [{ id: 99999 }], // Non-existent ID
      };

      // Should not throw error, but create company without the invalid job position
      const company = await companiesService.create(createCompanyDto);
      expect(company).toBeDefined();
      expect(company.name).toBe('Error Test Company');
      expect(company.company_job_positions).toHaveLength(0);
    });
  });
});