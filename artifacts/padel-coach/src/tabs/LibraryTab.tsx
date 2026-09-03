import { useState } from 'react';

import { ExerciseCard } from '../components/ExerciseCard';
import { ExerciseModal } from '../components/ExerciseModal';
import { CATEGORY_LABEL, EXERCISES, type Exercise } from '../data/exercises';

export function LibraryTab() {
  const [filter, setFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<Exercise | null>(null);

  const cats = Object.keys(CATEGORY_LABEL);
  const filtered = EXERCISES.filter((e) => {
    const matchCat = !filter || e.cats.includes(filter);
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <input
        className="lib-search"
        placeholder="Procurar exercício"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div
        className="chip-row"
        style={{ marginBottom: 16, overflowX: 'auto', flexWrap: 'nowrap' }}
      >
        <span className={`chip ${!filter ? 'selected' : ''}`} onClick={() => setFilter(null)}>
          Todos
        </span>
        {cats.map((c) => (
          <span
            key={c}
            className={`chip ${filter === c ? 'selected' : ''}`}
            onClick={() => setFilter(c)}
          >
            {CATEGORY_LABEL[c]}
          </span>
        ))}
      </div>

      {filtered.length ? (
        filtered.map((e) => <ExerciseCard key={e.id} exercise={e} onClick={() => setOpen(e)} />)
      ) : (
        <div className="empty">Sem resultados.</div>
      )}

      {open && <ExerciseModal exercise={open} onClose={() => setOpen(null)} />}
    </>
  );
}
