import fs from 'fs';
import * as cheerio from 'cheerio';

// Read the HTML file
const html = fs.readFileSync('wikipedia_parks.html', 'utf8');
const $ = cheerio.load(html);

// Find the main table containing the parks
const parks = [];

// Find all table rows in the main national parks table
$('table.wikitable.sortable.plainrowheaders tbody tr').each((i, element) => {
  // Skip the first header row that defines the table structure
  if (i === 0) return;
  
  // Handle park name - could be in th or td with scope=row
  let nameElement = $(element).find('th').first();
  if (!nameElement.length) {
    nameElement = $(element).find('td[scope="row"]').first();
    if (!nameElement.length) return; // Skip if no name element found
  }
  
  const name = nameElement.find('a').first().text().trim();
  if (!name) return; // Skip if no name found
  
  const columns = $(element).find('td');
  if (columns.length < 5) return; // Skip if not enough data columns
  
  // Determine if we're using a th or td for name to adjust indices
  const usingTdForName = nameElement.is('td');
  
  // Determine column index offsets based on structure
  const imgIndex = usingTdForName ? 1 : 0;
  const locationIndex = usingTdForName ? 2 : 1;
  const descriptionIndex = 5; // Description is always at index 5
  
  // Get image URL
  let imageUrl = '';
  const imgElement = $(columns[imgIndex]).find('img').first();
  if (imgElement.length) {
    // Get the src attribute
    const src = imgElement.attr('src');
    if (src) {
      // Fix the URL if it's a relative path
      if (src.startsWith('//')) {
        imageUrl = 'https:' + src;
      } else if (src.startsWith('/')) {
        imageUrl = 'https://en.wikipedia.org' + src;
      } else {
        imageUrl = src;
      }
    }
  }
  
  // Parse location - clean up to just get the state/territory name
  let location = $(columns[locationIndex]).text().trim();
  
  // Extract just the state name (before any coordinates)
  const stateMatch = location.match(/^([A-Za-z\s]+)/);
  if (stateMatch && stateMatch[1]) {
    location = stateMatch[1].trim();
  }
  
  // Parse description - make sure it exists before accessing
  let description = '';
  if (columns.length > descriptionIndex) {
    description = $(columns[descriptionIndex]).text().trim();
    
    // Make sure description is actual text, not just a number
    if (/^\d+(\.\d+)?$/.test(description) || description.length < 20) {
      // If it's just a number, try to find description in other columns
      for (let i = 0; i < columns.length; i++) {
        if (i !== imgIndex && i !== locationIndex && i !== descriptionIndex) {
          const text = $(columns[i]).text().trim();
          if (text.length > 50) {  // Assuming real descriptions are longer
            description = text;
            break;
          }
        }
      }
    }
  }
  
  // Add to parks array
  parks.push({
    name,
    imageUrl,
    location,
    description
  });
});

// Save the parks to a JSON file
fs.writeFileSync('parks_data.json', JSON.stringify(parks, null, 2));

console.log(`Extracted ${parks.length} national parks.`);