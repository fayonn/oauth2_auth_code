const deleteListItem = (element) => {
  const parent = element.parentNode;
  if (element.dataset.notEmpty) {
    const items = parent.parentNode.querySelectorAll(`.${element.className}`);
    if (items.length <= 1) return;
  }
  console.log('element.parentNode.id', element.parentNode.id);
  const item = document.querySelector(`#${element.parentNode.id}`);
  item.parentNode.removeChild(item);
};

module.exports = deleteListItem;
