// Test script for PDF text extraction
const { visionService } = require('./lib/google-cloud');
const fs = require('fs');
const path = require('path');

async function testPDFExtraction() {
  try {
    console.log('🧪 Testing PDF text extraction...');
    
    // Check if there are any PDF files in Company Data directory
    const companyDataPath = path.join(__dirname, 'Company Data');
    
    if (!fs.existsSync(companyDataPath)) {
      console.log('❌ Company Data directory not found');
      return;
    }
    
    const companies = fs.readdirSync(companyDataPath);
    console.log(`📁 Found ${companies.length} companies in Company Data`);
    
    // Test with the first PDF found
    for (const company of companies) {
      const companyPath = path.join(companyDataPath, company);
      if (fs.statSync(companyPath).isDirectory()) {
        const files = fs.readdirSync(companyPath);
        const pdfFile = files.find(file => file.toLowerCase().endsWith('.pdf'));
        
        if (pdfFile) {
          console.log(`📄 Testing with: ${pdfFile}`);
          const filePath = path.join(companyPath, pdfFile);
          const buffer = fs.readFileSync(filePath);
          
          const extractedText = await visionService.extractTextFromDocument(buffer, pdfFile);
          
          console.log(`✅ Extracted ${extractedText.length} characters`);
          console.log('📝 First 200 characters:');
          console.log(extractedText.substring(0, 200) + '...');
          
          return; // Test with just one file
        }
      }
    }
    
    console.log('❌ No PDF files found for testing');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPDFExtraction();