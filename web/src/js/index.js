/* eslint-disable no-unused-vars */
/* eslint-disable default-case */
/* eslint-disable no-alert */
/* eslint-disable no-undef */

let mode = 'barriers';
let cells = [];
const mapContainer = document.querySelector('.map-container');
const widthInput = document.querySelector('#mapWidth');
const heightInput = document.querySelector('#mapHeight');
const modeArea = document.querySelector('#mode');

class Cell {
  element;
  mode;
  pointName;
  webhookUrl;

  constructor(x) {
    this.element = document.createElement('div');
    this.element.classList.add('cell');
    this.element.dataset.x = x;
  }
}

(function () {
  widthInput.addEventListener('change', generateMap);
  heightInput.addEventListener('change', generateMap);
})();

function generateMap() {
  const mapWidth = Number(widthInput.value);
  const mapHeight = Number(heightInput.value);

  // Clear existing cells
  mapContainer.innerHTML = '';

  // Generate cells
  for (let y = 0; y < mapHeight; y++) {
    const row = document.createElement('div');
    row.classList.add('row');
    row.dataset.y = y;
    mapContainer.append(row);

    const cellRow = [];

    for (let x = 0; x < mapWidth; x++) {
      const cell = new Cell(x);
      cellRow.push(cell);
      row.append(cell.element);
    }

    cells.push(cellRow);
  }
}

mapContainer.addEventListener('click', (event) => {
  if (!event.target.classList.contains('cell')) return;

  const x = event.target.dataset.x;

  const row = event.target.closest('.row');
  const y = row.dataset.y;

  switch (mode) {
    case 'points':
      return markAsPoint(cells[y][x]);
    case 'barriers':
      return markAsBarrier(cells[y][x]);
    case 'base':
      return markAsBase(cells[y][x]);
  }
});

/**
 * @param {Cell} cell
 */
function markAsPoint(cell) {
  cell.element.classList.remove('barrier', 'base');
  cell.element.classList.add('point');
  cell.mode = 'point';
  cell.pointName = prompt('Enter point name');
  cell.webhookUrl = prompt('Enter webhook url');
}

/**
 * @param {Cell} cell
 */
function markAsBarrier(cell) {
  cell.element.classList.remove('point', 'base');
  cell.element.classList.add('barrier');
  cell.mode = 'barrier';
}

/**
 * @param {Cell} cell
 */
function markAsBase(cell) {
  if (cells.flat().some((cell) => cell.mode === 'base')) {
    alert('Base already exists');
    return;
  }

  cell.element.classList.remove('point', 'barrier');
  cell.element.classList.add('base');
  cell.mode = 'base';
  cell.pointName = prompt('Enter base name');
}

// Optionally, clear all points when regenerating the map
function regenerateMap() {
  const mapContainer = document.querySelector('.map-container');
  mapContainer.innerHTML = ''; // Clear existing cells
  cells = [];
  generateMap(); // Call the original generateMap function to recreate the map
}

function selectMode(newMode) {
  if (['points', 'barriers', 'base'].includes(newMode)) {
    mode = newMode;
    modeArea.textContent = newMode;
  }
}

async function saveMap() {
  const mapRequest = {
    name: 'test',
    rows: cells.length,
    columns: cells[0].length,
    points: [],
    barriers: [],
  };

  for (const [y, cell_] of cells.entries()) {
    for (const [x, cell] of cell_.entries()) {
      switch (cell.mode) {
        case 'point':
          mapRequest.points.push({
            x,
            y,
            name: cell.pointName,
            webhookUrl: cell.webhookUrl,
          });
          break;
        case 'barrier':
          mapRequest.barriers.push({ x, y });
          break;
        case 'base':
          mapRequest.base = { x, y, name: cell.pointName };
          break;
      }
    }
  }

  console.log(mapRequest);

  await fetch('http://localhost:3000/maps', {
    method: 'POST',
    body: JSON.stringify(mapRequest),
  });
}

generateMap();
