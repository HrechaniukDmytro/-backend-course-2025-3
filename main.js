const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

const program = new Command();

program
  .option('-i, --input <path>', 'input JSON file')
  .option('-o, --output <path>', 'output file')
  .option('-d, --display', 'display result')
  .option('-v, --variety', 'show flower variety')
  .option('-l, --length <number>', 'show flowers with petal length greater than given');

program.parse(process.argv);
const options = program.opts();

if (!options.input) 
{
  console.error('Please, specify input file');
  process.exit(1);
}

const inputPath = path.resolve(options.input);
if (!fs.existsSync(inputPath)) 
{
  console.error('Cannot find input file');
  process.exit(1);
}


let raw;
try 
{
  raw = fs.readFileSync(inputPath, 'utf8');
} catch (err) 
{
  console.error('Cannot read input file');
  process.exit(1);
}

let data;
try 
{
  data = JSON.parse(raw);
} 
catch (err) 
{
  console.error('Invalid JSON in input file');
  process.exit(1);
}

if (!Array.isArray(data)) 
{
  if (Array.isArray(data.data)) data = data.data;
  else if (Array.isArray(data.rows)) data = data.rows;
  else data = [data];
}

let result = data;

if (options.length) 
{
  const len = parseFloat(options.length);
  if (!Number.isFinite(len)) 
  {
    console.error('Length must be a number');
    process.exit(1);
  }
  result = result.filter(item => 
   {
    const petal = item.petal || item['petal.length'] || item.petal_length || item.petalLength;
    let value;
    if (petal && typeof petal === 'object') value = petal.length;
    else value = petal;
    if (value === undefined || value === null) return false;
    return parseFloat(value) > len;
  });
}

const lines = result.map(item => 
  {
  const petal = item.petal || item['petal.length'] || item.petal_length || item.petalLength;
  let lengthVal, widthVal;
  if (petal && typeof petal === 'object') {
    lengthVal = petal.length;
    widthVal = petal.width;
  } 
  else 
  {
    lengthVal = item['petal.length'] || item.petal_length || item.petalLength || '';
    widthVal = item['petal.width'] || item.petal_width || item.petalWidth || '';
  }
  const variety = item.variety || item.species || '';
  const base = `${lengthVal ?? ''} ${widthVal ?? ''}`.trim();
  return options.variety ? `${base} ${variety}`.trim() : base;
}).filter(line => line && line.length > 0);

const outputText = lines.join('\n');

if (options.output) 
{
  try 
  {
    fs.writeFileSync(options.output, outputText, 'utf8');
  } 
  catch (err) 
  {
    console.error('Cannot write output file');
    process.exit(1);
  }
}
if (options.display) 
{
  if (outputText.length) console.log(outputText);
}


