export function initSearch({ onQuery }) {
  const input = document.querySelector('#console-search');

  input.addEventListener('input', () => onQuery(input.value));

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && input.value) {
      input.value = '';
      onQuery('');
    }
  });
}
