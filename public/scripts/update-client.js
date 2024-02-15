const updateClient = (event, action) => {
  const body = {};

  const left = document.querySelector('.form-left');
  const right = document.querySelector('.form-right');

  const leftLabeledInputs = left.querySelectorAll(`.labeled-input`);
  leftLabeledInputs.forEach((labeledInput) => {
    const input = labeledInput.querySelector(`input`);
    body[`${input.name}`] = input.value || undefined;
  });

  let clientId = undefined;
  if (left.dataset.clientId) {
    clientId = left.dataset.clientId;
  }
  body['id'] = clientId;

  const redirectUris = left.querySelectorAll(`.redirect-uri-item`);
  const bodyRedirectUris = [];
  redirectUris.forEach((uri) => {
    const input = uri.querySelector(`input`);
    bodyRedirectUris.push(input.value || undefined);
  });
  body.redirectUris = bodyRedirectUris;

  const scopes = right.querySelectorAll(`.scope-item`);
  const bodyScopes = [];
  scopes.forEach((scope) => {
    const titleInput = scope.querySelector(`.title`);
    const descriptionInput = scope.querySelector(`.description`);

    let id = undefined;
    if (scope.dataset.dbId) {
      id = scope.dataset.dbId;
    }

    bodyScopes.push({
      id: id,
      title: titleInput.value || undefined,
      description: descriptionInput.value || undefined,
    });
  });
  body.scopes = bodyScopes;

  fetch(action, {
    method: 'PUT',
    redirect: 'follow',
    body: JSON.stringify(body),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  }).then(async (response) => {
    if (response.redirected) {
      window.location.href = response.url;
      return;
    }

    try {
      const res = await response.json();
      if (res.error) {
        document.body.innerHTML = res.html;
      }
    } catch (e) {
      console.log('error', e);
    }
  });
};
// https://www.google.com/
module.exports = updateClient;
