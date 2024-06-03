/* eslint-disable no-undef */
/* eslint-disable no-alert */

/**
 * @param {string} url
 * @param {Record<string, unknown>} body
 */
export function post(url, body) {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (!response.ok) throw response;

      return response.json();
    })
    .catch(async (error) => {
      const body = await error.json();
      const message = Array.isArray(body.message)
        ? body.message.join('\n')
        : body.message;
      alert(message);
    });
}

/**
 * @param {string} url
 * @param {Record<string, unknown>} body
 */
export function put(url, body) {
  return fetch(url, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (!response.ok) throw response;

      return response.json();
    })
    .catch(async (error) => {
      const body = await error.json();
      const message = Array.isArray(body.message)
        ? body.message.join('\n')
        : body.message;
      alert(message);
    });
}

/**
 * @param {string} url
 */
export function get(url) {
  return fetch(url, { method: 'GET' })
    .then((response) => {
      if (!response.ok) throw response;

      return response.json();
    })
    .catch(async (error) => {
      const body = await error.json();
      const message = Array.isArray(body.message)
        ? body.message.join('\n')
        : body.message;
      alert(message);
    });
}

/**
 *
 * @param {string} selector
 * @param {string[]} classes
 */
export function createElement(selector, classes, parent) {
  const element = document.createElement(selector);
  element.classList.add(...classes);
  if (parent) parent.append(element);
  return element;
}

export function formatDate(date) {
  return date?.toISOString().split('T')[0];
}

export function formatPeriod(start, end) {
  const startDate = new Date(start);
  const endDate = end && new Date(end);
  const formattedStart = formatDate(startDate);
  const formattedEnd = formatDate(endDate);

  const minuteDifference =
    ((endDate?.getTime() ?? Date.now()) - startDate.getTime()) / 60 / 1000;

  if (!formattedEnd) {
    return `${formattedStart} (${minuteDifference.toFixed(2)} m)`;
  }

  if (formattedStart !== formattedEnd) {
    return `${formattedStart} - ${formattedEnd} (${minuteDifference.toFixed(2)} m)`;
  }

  return `${formattedEnd} (${minuteDifference.toFixed(2)} m)`;
}
