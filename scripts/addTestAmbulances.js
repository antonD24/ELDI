// Test script to add some ambulances to the database
// This is just for testing the real-time map functionality

const { Amplify } = require('aws-amplify');
const { generateClient } = require('aws-amplify/data');

// This would need to be run with proper Amplify configuration
// For now, this is just a reference for the data structure

const testAmbulances = [
  {
    name: "Ambulance Alpha",
    location: {
      lat: -33.8688,
      long: 151.2093
    },
    status: "available"
  },
  {
    name: "Ambulance Beta", 
    location: {
      lat: -33.8650,
      long: 151.2100
    },
    status: "busy"
  },
  {
    name: "Ambulance Gamma",
    location: {
      lat: -33.8700,
      long: 151.2080
    },
    status: "available"
  }
];

// Example of how to create ambulances programmatically
async function createTestAmbulances() {
  try {
    const client = generateClient();
    
    for (const ambulanceData of testAmbulances) {
      const result = await client.models.Ambulance.create(ambulanceData);
      console.log('Created ambulance:', result);
    }
  } catch (error) {
    console.error('Error creating test ambulances:', error);
  }
}

// Uncomment to run:
// createTestAmbulances();

console.log('Test ambulance data structure:', testAmbulances);
