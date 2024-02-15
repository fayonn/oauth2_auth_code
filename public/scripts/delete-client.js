const deleteClient = (url) => {
  console.log('url', url);

  fetch(url, {
    method: 'DELETE',
    body: {},
    redirect: 'follow',
  }).then((response) => {
    console.log('response', response);

    if (response.redirected) {
      window.location.href = response.url;
    }
  });
};

module.exports = deleteClient;
