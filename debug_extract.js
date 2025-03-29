import fs from 'fs';
import * as cheerio from 'cheerio';

// Read the HTML file
const html = fs.readFileSync('wikipedia_parks.html', 'utf8');
const $ = cheerio.load(html);

// Try different table selectors to find the right one
console.log('Using table.wikitable.sortable.plainrowheaders:');
let count1 = 0;
$('table.wikitable.sortable.plainrowheaders tbody tr').each((i, element) => {
  if ($(element).find('th').length === 0) {
    const name = $(element).find('td:first-child a').first().text().trim();
    if (name) {
      console.log(`- ${name}`);
      count1++;
    }
  }
});
console.log(`Found ${count1} parks`);

console.log('\nUsing first table.wikitable:');
let count2 = 0;
$('table.wikitable:first tbody tr').each((i, element) => {
  if ($(element).find('th').length === 0) {
    const name = $(element).find('td:first-child a').first().text().trim();
    if (name) {
      console.log(`- ${name}`);
      count2++;
    }
  }
});
console.log(`Found ${count2} parks`);

console.log('\nUsing caption containing "List of U.S. national parks":');
let count3 = 0;
$('table.wikitable:has(caption:contains("List of U.S. national parks")) tbody tr').each((i, element) => {
  if ($(element).find('th').length === 0) {
    const name = $(element).find('td:first-child a').first().text().trim();
    if (name) {
      console.log(`- ${name}`);
      count3++;
    }
  }
});
console.log(`Found ${count3} parks`);