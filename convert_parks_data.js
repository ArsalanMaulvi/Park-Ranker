import fs from 'fs';

// Read parks data from the JSON file
const parksData = JSON.parse(fs.readFileSync('parks_data.json', 'utf8'));

// Convert to the format needed for our application
const formattedParks = parksData.map((park) => {
  // Format according to our schema
  return {
    name: park.name,
    location: park.location,
    description: park.description,
    imageUrl: park.imageUrl,
    score: 1500, // Starting ELO score
    previousRanking: null, // No previous ranking initially
  };
});

// Save to server/national-parks-data.ts
const outputContent = `import { InsertPark } from '../shared/schema';

export const nationalParksData: InsertPark[] = ${JSON.stringify(formattedParks, null, 2)};
`;

fs.writeFileSync('server/national-parks-data.ts', outputContent);

console.log(`Converted ${formattedParks.length} national parks to the application format.`);