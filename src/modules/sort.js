// Ordenación de listas: orden original, alfabético o agrupado por categoría.

const CATEGORY_ORDER = ['Generalistas', 'Noticias', 'Deportes', 'Música', 'Infantil', 'Internacional'];

export const SORT_LABELS = {
  default: 'en el orden original',
  az: 'alfabéticamente',
  category: 'por categoría',
};

export function initSort({ select, list, items, idAttribute, onSort } = {}) {
  const cards = new Map(Array.from(list.children).map((card) => [card.getAttribute(idAttribute), card]));

  function apply() {
    const mode = select.value;
    const ordered = [...items];

    if (mode === 'az') {
      ordered.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
    } else if (mode === 'category') {
      ordered.sort((a, b) => {
        const rankA = CATEGORY_ORDER.indexOf(a.category);
        const rankB = CATEGORY_ORDER.indexOf(b.category);
        const fallback = CATEGORY_ORDER.length;
        return (rankA === -1 ? fallback : rankA) - (rankB === -1 ? fallback : rankB);
      });
    }

    for (const item of ordered) {
      const card = cards.get(item.id);
      if (card) list.append(card);
    }
    list.classList.toggle('is-grouped', mode === 'category');
  }

  select.addEventListener('change', () => {
    apply();
    onSort?.(select.value);
  });

  function setMode(mode) {
    select.value = mode;
    apply();
  }

  setMode(select.value);
  return { setMode, apply };
}
