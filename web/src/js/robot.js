/* eslint-disable no-alert */
/* eslint-disable no-undef */

export async function createRobot() {
  const serialNumber = prompt('Enter robot Serial No');
  const model = prompt('Enter robot model');

  await fetch('http://localhost:3000/robots', {
    method: 'POST',
    body: JSON.stringify({
      serialNumber,
      model,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (!response.ok) throw response;

      alert('Done');
    })
    .catch(async (error) => {
      const body = await error.json();
      const message = Array.isArray(body.message)
        ? body.message.join('\n')
        : body.message;
      alert(message);
    });
}
