const addListItem = (itemClassName, listObjectClassName) => {
  const item = Array.from(document.querySelectorAll(`.${itemClassName}`)).pop();
  const list = document.querySelector(`.${listObjectClassName} .list .list-items`);

  if (item) {
    const clone = item.cloneNode(true);
    clone.id = `${clone.id.split('_')[0]}_${Number(clone.id.split('_')[1]) + 1}`;

    const inputs = clone.querySelectorAll(`input`);
    inputs.forEach((input) => {
      input.value = '';
    });
    clone.dataset.dbId = '';
    list.appendChild(clone);
  } else {
    if (listObjectClassName === 'scopes') {
      const element = document.createElement('div');
      element.id = 'scope-item_1';
      element.className = 'scope-item';
      element.innerHTML = `
        <input class="title" name="title" type="text" required placeholder="example">
        <input class="description" name="scope" type="text" required placeholder="example description">

        <button type="button" onclick="deleteListItem(this)" class="btn-remove">Remove</button>
      `;

      list.appendChild(element);
    }
  }
};

module.exports = addListItem;
