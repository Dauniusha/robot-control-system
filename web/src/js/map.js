/* eslint-disable default-case */
/* eslint-disable no-alert */
/* eslint-disable no-undef */

import * as utils from './utils.js';

const parameters = new URLSearchParams(window.location.search);

const mapId = parameters.get('id');
let mode = 'barriers';
let cells = [];
const mapContainer = document.querySelector('.map-container');
const controlContainer = document.querySelector('.control-container');
const widthInput = document.querySelector('#mapWidth');
const heightInput = document.querySelector('#mapHeight');
const modeArea = document.querySelector('#mode');
const barriersModeButton = document.querySelector('#barriersMode');
const pointsModeButton = document.querySelector('#pointsMode');
const baseModeButton = document.querySelector('#baseMode');
const robotSerialNumberInput = document.querySelector('#robotSerialNo');
const saveButton = document.querySelector('#saveBtn');
const regenerateButton = document.querySelector('#regenerateBtn');

class Cell {
  toPoint(pointName, webhookUrl) {
    this.element.classList.remove('barrier', 'base');
    this.element.classList.add('point');
    this.mode = 'point';
    this.pointName = pointName ?? prompt('Enter point name');
    this.webhookUrl = webhookUrl ?? prompt('Enter webhook url');
  }

  toBarrier() {
    this.element.classList.remove('point', 'base');
    this.element.classList.add('barrier');
    this.mode = 'barrier';
    console.log(this.element);
  }

  toBase(pointName) {
    this.element.classList.remove('point', 'barrier');
    this.element.classList.add('base');
    this.mode = 'base';
    this.pointName = pointName ?? prompt('Enter base name');
  }

  toPathPoint(position) {
    const pointElement =
      this.element.querySelector('.path-point') ??
      utils.createElement('div', ['path-point'], this.element);

    pointElement.textContent = [pointElement.textContent, position + 1]
      .filter(Boolean)
      .join(', ');
  }

  toTargetPoint(position) {
    if (this.mode === 'point') {
      this.element.textContent = position + 1;
    }
  }

  placeRobot() {
    if (!Cell.robotElement) {
      Cell.robotElement = utils.createElement(
        'div',
        ['robot-position'],
        this.element,
      );
      return;
    }

    Cell.robotElement.remove();
    this.element.append(Cell.robotElement);
  }

  static robotElement;
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

  barriersModeButton.addEventListener('click', () => selectMode('barriers'));
  pointsModeButton.addEventListener('click', () => selectMode('points'));
  baseModeButton.addEventListener('click', () => selectMode('base'));
  saveButton.addEventListener('click', () => saveMap());
  regenerateButton.addEventListener('click', () => regenerateMap());
})();

function generateMap(mapWidth, mapHeight) {
  // Clear existing cells
  mapContainer.innerHTML = '';
  cells = [];

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
      cells[y][x].toPoint();
      break;
    case 'barriers':
      cells[y][x].toBarrier();
      break;
    case 'base':
      if (cells.flat().some((cell) => cell.mode === 'base')) {
        alert('Base already exists');
        return;
      }

      cells[y][x].toBase();
      break;
  }
});

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
    robotSerialNumber: robotSerialNumberInput.value,
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

  await (mapId
    ? utils.put(`http://localhost:3000/schemas/${mapId}`, mapRequest)
    : post('http://localhost:3000/schemas', mapRequest));
}

async function initMap(id, operationId) {
  if (operationId) {
    const [schema, operation] = await Promise.all([
      utils.get(`http://localhost:3000/schemas/${id}`),
      utils.get(`http://localhost:3000/robots/operations/${operationId}`),
    ]);

    generateMap(schema.rows, schema.columns);

    for (const barrier of schema.barriers) {
      cells[barrier.y][barrier.x].toBarrier();
    }

    cells[schema.base.y][schema.base.x].toBase(schema.base.name);

    for (const point of schema.points) {
      cells[point.y][point.x].toPoint(point.name, point.webhookUrl);
    }

    // Operation specific stuff
    let counter = 0;
    for (const path of operation.paths) {
      for (const pathPoint of path) {
        cells[pathPoint.y][pathPoint.x].toPathPoint(pathPoint.visitNumber);
      }

      cells[path.at(-1).y][path.at(-1).x].toTargetPoint(counter++);
    }

    controlContainer.classList.add('hidden');

    // Information block
    const informationContainer = utils.createElement(
      'div',
      ['information-container'],
      document.body,
    );

    informationContainer.innerHTML = `
      <div class="information-container__map">
        <h2>Map name: <span class="regular-font">${schema.name}</span></h2>
        <h2>Robot serial No: <span class="regular-font">${operation.robotSerialNo}</span></h2>
      </div>
      <div>
        <h2>Operation details:</h2>
        <h3>Id: <span class="regular-font">${operation.id}</span></h3>
        <h3>Operation status: <span class="regular-font" id="operationStatus">${operation.status}</span></h3>
        <h3>Operation duration: <span class="regular-font" id="operationDuration">${utils.formatPeriod(
          operation.createdAt,
          operation.doneAt,
        )}</span></h3>
      </div>
      <br>
      <div class="history-container">
        <div>
          <h2>Computed path:</h2>
          <div class="path-history-list-container">
            <div class="list-header__container">
              <span class="list-header">#</span>
              <span class="list-header">X</span>
              <span class="list-header">Y</span>
              <span class="list-header">Target Point</span>
            </div>
            ${operation.paths
              .flatMap((path) => {
                return path.map(
                  (point) => `
                <div class="path-history-list-item">
                  <span class="list-item">${point.visitNumber + 1}</span>
                  <span class="list-item">${point.x + 1}</span>
                  <span class="list-item">${point.y + 1}</span>
                  <span class="list-item">${point.targetPoint ? 'Yes' : 'No'}</span>
                </div>
              `,
                );
              })
              .join('\n')}
          </div>
        </div>
      </div>
    `;

    if (operation.status !== 'done') {
      const historyContainer =
        informationContainer.querySelector('.history-container');

      const eventsContainer = utils.createElement(
        'div',
        ['events-container'],
        historyContainer,
      );

      const intervalId = setInterval(async () => {
        const events = await utils.get(
          `http://localhost:3000/robots/${schema.robotId}/events`,
        );

        if (!events) {
          return clearInterval(intervalId);
        }

        await updateOperationDetails(operationId);

        eventsContainer.innerHTML = `
          <h2>Live events:</h2>
          <div class="events-history-list-container">
            <div class="list-header__container">
              <span class="list-header">#</span>
              <span class="list-header">Message</span>
              <span class="list-header">Created At</span>
              <span class="list-header">Payload</span>
            </div>
            ${events
              .map((event, index) => {
                const payload = event.payload.point
                  ? `Y: ${event.payload.point.y} X: ${event.payload.point.x}`
                  : 'Object';
                return `
                <div class="events-history-list-item">
                  <span class="list-item">${index + 1}</span>
                  <span class="list-item">${event.message}</span>
                  <span class="list-item">${utils.formatDate(new Date(event.createdAt))}</span>
                  <span class="list-item">${payload}</span>
                </div>
              `;
              })
              .join('\n')}
          </div>
        `;

        const lastReachEvent = events
          .filter((event) => event.message === 'point_reached')
          .at(-1);

        if (lastReachEvent) {
          const { point } = lastReachEvent.payload;
          cells[point.y][point.x].placeRobot();
        }

        if (events.at(-1)?.message === 'operation_finished') {
          clearInterval(intervalId);
        }
      }, 1000);
    }

    return;
  }

  const schema = await utils.get(`http://localhost:3000/schemas/${id}`);
  widthInput.value = schema.rows;
  heightInput.value = schema.columns;

  generateMap(schema.rows, schema.columns);

  for (const barrier of schema.barriers) {
    cells[barrier.y][barrier.x].toBarrier();
  }

  cells[schema.base.y][schema.base.x].toBase(schema.base.name);

  for (const point of schema.points) {
    cells[point.y][point.x].toPoint(point.name, point.webhookUrl);
  }

  robotSerialNumberInput.value = schema.robotSerialNo;
}

async function updateOperationDetails(operationId) {
  const operation = await utils.get(
    `http://localhost:3000/robots/operations/${operationId}`,
  );

  const operationStatus = document.querySelector('#operationStatus');
  const operationDuration = document.querySelector('#operationDuration');

  operationStatus.textContent = operation.status;
  operationDuration.textContent = utils.formatPeriod(
    operation.createdAt,
    operation.doneAt,
  );
}

initMap(mapId, parameters.get('operationId'));
