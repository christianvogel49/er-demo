export default async function decorate(block) {
  const itemsWrapper = document.createElement('div');
  itemsWrapper.classList.add('items-wrapper');

  [...block.children].forEach((row) => {
    itemsWrapper.append(row);
  });

  block.append(itemsWrapper);
  const title = itemsWrapper.firstElementChild;
  title.classList.add('title');
  block.prepend(title);
}
