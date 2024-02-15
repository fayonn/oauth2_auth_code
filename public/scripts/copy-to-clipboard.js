const copyToClipboard = (value) => {
  navigator.clipboard.writeText(value);

  const button = document.getElementById('copy-public-key');
  button.innerText = 'Copied';
  button.style.backgroundColor = '#385759';

  setTimeout(() => {
    const button = document.getElementById('copy-public-key');
    button.innerText = 'Public key';
    button.style.backgroundColor = 'cadetblue';
  }, 3000);
};

module.exports = copyToClipboard;
