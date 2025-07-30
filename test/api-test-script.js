const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const API_TIMEOUT = 10000;

// Test data
const testJobPositions = [
  { name: 'Software Engineer' },
  { name: 'Project Manager' },
  { name: 'UX Designer' },
  { name: 'Data Analyst' },
];

const testCompanies = [
  {
    name: 'Tech Company Ltd.',
    thaiDescription: 'บริษัทเทคโนโลยีชั้นนำ',
    engDescription: 'Leading Technology Company',
    address: '123 Tech Street, Bangkok',
    tel: '02-123-4567',
    email: 'contact@techcompany.com',
  },
  {
    name: 'Startup Inc.',
    thaiDescription: 'บริษัทสตาร์ทอัพ',
    engDescription: 'Startup Company',
    address: '456 Startup Ave, Bangkok',
    tel: '02-987-6543',
    email: 'hello@startup.com',
  },
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAPI() {
  console.log('🚀 Starting Company with JobPositions API Test\n');
  
  try {
    // 1. Test job position creation
    console.log('📝 Creating job positions...');
    const createdJobPositions = [];
    
    for (const jobPos of testJobPositions) {
      try {
        const response = await axios.post(`${BASE_URL}/job-positions`, jobPos, {
          timeout: API_TIMEOUT,
        });
        createdJobPositions.push(response.data);
        console.log(`✅ Created job position: ${response.data.name}`);
      } catch (error) {
        console.log(`⚠️  Job position might already exist: ${jobPos.name}`);
      }
      await delay(500); // Small delay to avoid rate limiting
    }

    // 2. Test company creation with job positions
    console.log('\n🏢 Creating companies with job positions...');
    const createdCompanies = [];
    
    for (const company of testCompanies) {
      const jobPositionsForCompany = createdJobPositions.slice(0, 2).map(jp => ({ id: jp.id }));
      
      const companyData = {
        ...company,
        jobPositions: jobPositionsForCompany,
      };

      try {
        const response = await axios.post(`${BASE_URL}/companies`, companyData, {
          timeout: API_TIMEOUT,
        });
        createdCompanies.push(response.data);
        console.log(`✅ Created company: ${response.data.name}`);
        console.log(`   - Job positions: ${response.data.company_job_positions.length}`);
      } catch (error) {
        console.error(`❌ Failed to create company ${company.name}:`, error.response?.data || error.message);
      }
      await delay(500);
    }

    // 3. Test company retrieval
    console.log('\n🔍 Testing company retrieval...');
    
    if (createdCompanies.length > 0) {
      try {
        // Test get all companies
        const allCompaniesResponse = await axios.get(`${BASE_URL}/companies`, {
          timeout: API_TIMEOUT,
        });
        console.log(`✅ Retrieved ${allCompaniesResponse.data.data.length} companies`);
        
        // Test get single company
        const companyId = createdCompanies[0].id;
        const singleCompanyResponse = await axios.get(`${BASE_URL}/companies/${companyId}`, {
          timeout: API_TIMEOUT,
        });
        console.log(`✅ Retrieved single company: ${singleCompanyResponse.data.name}`);
        console.log(`   - Job positions: ${singleCompanyResponse.data.company_job_positions.length}`);
        
        // Test search functionality
        const searchResponse = await axios.get(`${BASE_URL}/companies?search=Tech`, {
          timeout: API_TIMEOUT,
        });
        console.log(`✅ Search results: ${searchResponse.data.data.length} companies found`);
        
      } catch (error) {
        console.error('❌ Failed to retrieve companies:', error.response?.data || error.message);
      }
    }

    // 4. Test company update
    console.log('\n🔄 Testing company update...');
    
    if (createdCompanies.length > 0) {
      try {
        const companyId = createdCompanies[0].id;
        const updatedCompanyData = {
          name: 'Updated Tech Company Ltd.',
          thaiDescription: 'บริษัทเทคโนโลยีชั้นนำ (อัพเดท)',
          engDescription: 'Updated Leading Technology Company',
          address: '123 Updated Tech Street, Bangkok',
          tel: '02-123-4567',
          email: 'contact@updatedtechcompany.com',
          jobPositions: createdJobPositions.slice(0, 3).map(jp => ({ id: jp.id })),
        };

        const updateResponse = await axios.put(`${BASE_URL}/companies/${companyId}`, updatedCompanyData, {
          timeout: API_TIMEOUT,
        });
        console.log(`✅ Updated company: ${updateResponse.data.name}`);
        console.log(`   - New job positions count: ${updateResponse.data.company_job_positions.length}`);
        
      } catch (error) {
        console.error('❌ Failed to update company:', error.response?.data || error.message);
      }
    }

    // 5. Test error handling
    console.log('\n🚫 Testing error handling...');
    
    try {
      await axios.get(`${BASE_URL}/companies/99999`, {
        timeout: API_TIMEOUT,
      });
      console.log('❌ Should have thrown error for non-existent company');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Correctly handled non-existent company');
      } else {
        console.log('⚠️  Unexpected error for non-existent company:', error.message);
      }
    }

    console.log('\n🎉 API Test completed!');
    
  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Backend server is not running. Please start the server first.');
      console.error('   Run: npm run start:dev');
    }
  }
}

// Run the test
testAPI();