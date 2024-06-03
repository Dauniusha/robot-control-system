/* eslint-disable no-undef */

import { createRobot } from './robot.js';
import * as utils from './utils.js';

(async function () {
  const createRobotButton = document.querySelector('#createRobotBtn');
  createRobotButton.addEventListener('click', () => createRobot());

  const listContainer = document.querySelector('.map-list-container');
  const mapSearchInput = document.querySelector('#mapSearch');

  const parameters = new URLSearchParams();
  if (mapSearchInput.value) parameters.append('search', mapSearchInput.value);

  const result = await utils.get(`http://localhost:3000/schemas?${parameters}`);

  result.items.map((item, index) => {
    const element = utils.createElement('a', ['map-list-item'], listContainer);
    element.href = `./map.html?id=${item.id}`;
    const number = utils.createElement(
      'span',
      ['map-list-item__number'],
      element,
    );
    number.textContent = index + 1;
    const name = utils.createElement('p', ['map-list-item__name'], element);
    name.textContent = item.name;
    const size = utils.createElement('p', ['map-list-item__size'], element);
    size.textContent = `${item.rows} * ${item.columns}`;
    return element;
  });
})();

(async function () {
  // Const createOperationButton = document.querySelector('#createOperationBtn');
  // createOperationButton.addEventListener('click', () => createRobot());

  const listContainer = document.querySelector('.operation-list-container');

  const operations = await utils.get('http://localhost:3000/robots/operations');

  operations.map((item, index) => {
    const element = utils.createElement(
      'a',
      ['operation-list-item'],
      listContainer,
    );
    element.href = `./map.html?id=${item.schemaId}&operationId=${item.id}`;
    const number = utils.createElement('span', ['list-item'], element);
    number.textContent = index + 1;
    const name = utils.createElement('p', ['list-item'], element);
    name.textContent = item.schemaName;
    const status = utils.createElement('p', ['list-item'], element);
    status.textContent = item.status;
    const pointsCount = utils.createElement('p', ['list-item'], element);
    pointsCount.textContent = item.paths.length - 1;
    const start = new Date(item.createdAt);
    const done = item.doneAt && new Date(item.doneAt);
    const period = utils.createElement(
      'p',
      ['list-item', 'list-item__period'],
      element,
    );
    period.textContent = done
      ? utils.formatPeriod(start, done)
      : utils.formatDate(start);
    return element;
  });
})();
