import React, { useEffect, useState, useRef } from 'react';
import './squad.css';

interface Pokemon {
  id: number;
  name: string;
  image: string;
  abilities: string[];
  generation: string;
  genNumber: string;
}

const geracoes: Record<number, [number, number]> = {
  1: [1, 151], 2: [152, 251], 3: [252, 386], 4: [387, 493],
  5: [494, 649], 6: [650, 721], 7: [722, 809], 8: [810, 898], 9: [899, 1010]
};

function descobrirGeracao(id: number): string {
  for (const gen in geracoes) {
    const [inicio, fim] = geracoes[parseInt(gen)];
    if (id >= inicio && id <= fim) return `Geração ${gen}`;
  }
  return 'Desconhecida';
}

const chunkSize = 20;

const SquadMaker: React.FC = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantidade, setQuantidade] = useState(3);
  const [time, setTime] = useState<Pokemon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [geracoesSelecionadas, setGeracoesSelecionadas] = useState<number[]>([1,2,3,4,5,6,7,8,9]);
  const [genFilterDropdownOpen, setGenFilterDropdownOpen] = useState(false);
  const genDropdownRef = useRef<HTMLDivElement>(null);

  // Carregar Pokemons em chunks paralelos ao montar o componente e ao mudar gerações selecionadas
  useEffect(() => {
    setPokemons([]);
    setLoading(true);

    async function carregarPokemons() {
      const idsParaBuscar: number[] = [];
      geracoesSelecionadas.forEach(gen => {
        const [inicio, fim] = geracoes[gen];
        for (let id = inicio; id <= fim; id++) idsParaBuscar.push(id);
      });

      for (let i = 0; i < idsParaBuscar.length; i += chunkSize) {
        const chunk = idsParaBuscar.slice(i, i + chunkSize);

        try {
          const chunkPokemons = await Promise.all(chunk.map(async (id) => {
            try {
              const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
              if (!res.ok) throw new Error('Falha no fetch');
              const data = await res.json();
              return {
                id: data.id,
                name: data.name[0].toUpperCase() + data.name.slice(1),
                image: data.sprites.front_default,
                abilities: data.abilities.map((ab: any) => ab.ability.name.replace('-', ' ')),
                generation: descobrirGeracao(data.id),
                genNumber: (geracoesSelecionadas.find(g => {
                  const [inicio, fim] = geracoes[g];
                  return data.id >= inicio && data.id <= fim;
                }) ?? 0).toString()
              } as Pokemon;
            } catch {
              return null;
            }
          }));

          const pokemonsValidos = chunkPokemons.filter((p): p is Pokemon => p !== null);

          setPokemons(prev => [...prev, ...pokemonsValidos]);
        } catch {
          // Em caso de erro no chunk inteiro, pode tentar continuar
        }
      }

      setLoading(false);
    }

    carregarPokemons();
  }, [geracoesSelecionadas]);

  // Atualiza o time gerado
  function gerarTime() {
    const candidatos = pokemons.filter(p => geracoesSelecionadas.includes(Number(p.genNumber)));
    const timeGerado: Pokemon[] = [];
    const copiaCandidatos = [...candidatos];

    while (timeGerado.length < quantidade && copiaCandidatos.length > 0) {
      const index = Math.floor(Math.random() * copiaCandidatos.length);
      timeGerado.push(copiaCandidatos.splice(index, 1)[0]);
    }

    setTime(timeGerado);
  }

  // Filtra pokemons para a Pokédex baseando-se no termo e gerações filtradas no dropdown
  const pokemonsFiltrados = pokemons.filter(pokemon => {
    const nomeMatch = pokemon.name.toLowerCase().includes(searchTerm.toLowerCase());
    const genMatch = geracoesSelecionadas.includes(Number(pokemon.genNumber));
    return nomeMatch && genMatch;
  });

  // Toggle seleção das gerações para o filtro dropdown
  function toggleGeracaoFiltro(gen: number) {
    setGeracoesSelecionadas(prev => {
      if (prev.includes(gen)) {
        return prev.filter(g => g !== gen);
      } else {
        return [...prev, gen];
      }
    });
  }

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (genDropdownRef.current && !genDropdownRef.current.contains(event.target as Node)) {
        setGenFilterDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#1e2a38] text-[#ecf0f1] font-['Exo_2',serif] px-4">
      <nav className="bg-gray-900/90 shadow-md sticky top-0 z-50 backdrop-blur py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
          <h1 className="text-6xl sm:text-3xl md:text-6xl text-purple-400 drop-shadow-sm font-cursive pokemon-title">SquadMaker</h1>
        </div>
      </nav>

      <header className="text-center py-12">
        <h2 className="text-5xl font-extrabold text-indigo-300 mb-4 drop-shadow-sm font-cursive pokemon-title">Monte seu Time de Pokémon</h2>
        <p className="text-lg text-gray-300 max-w-xl mx-auto">
          Escolha as gerações, defina a quantidade de integrantes e visualize seus Pokémon com habilidades incríveis.
        </p>
      </header>

      <section className="flex flex-col xl:flex-row justify-center items-center xl:items-start gap-10 max-w-7xl mx-auto mb-16">
        <div className="w-full max-w-md xl:sticky xl:top-20 bg-white/10 rounded-2xl shadow-lg p-8 md:p-10 border border-indigo-100 h-fit">
          <h2 className="text-4xl font-extrabold text-indigo-300 mb-8 text-center pokemon-title">Filtros</h2>

          <div className="mb-8">
            <label className="block font-semibold mb-3 text-gray-300 text-lg">Gerações:</label>
            <div className="flex flex-wrap gap-3 justify-center">
              {[1,2,3,4,5,6,7,8,9].map(gen => (
                <label key={gen} className="cursor-pointer">
                  <input
                    type="checkbox"
                    className="geracao"
                    value={gen}
                    checked={geracoesSelecionadas.includes(gen)}
                    onChange={() => toggleGeracaoFiltro(gen)}
                  /> Gen {gen}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block font-semibold mb-3 text-gray-300 text-lg">Quantidade:</label>
            <input
              type="range"
              min={1}
              max={6}
              value={quantidade}
              className="w-full accent-indigo-600"
              onChange={e => setQuantidade(Number(e.target.value))}
            />
            <p className="text-center mt-2 text-indigo-300 font-semibold">Quantidade: {quantidade}</p>
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={gerarTime}
              className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-8 rounded-full text-lg shadow-lg transition duration-300"
              disabled={loading || pokemons.length === 0}
              title={loading ? 'Aguarde o carregamento dos Pokémons' : undefined}
            >
              🎲 Gerar Time Aleatório
            </button>
          </div>
        </div>

        <section id="time" className="text-center w-full xl:max-w-4xl">
          <h2 className="text-4xl font-bold text-indigo-300 mb-8 pokemon-title">Seu Time</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {time.map(pokemon => (
              <div key={pokemon.id} className="bg-gray-900 border border-purple-400 rounded-xl shadow-lg p-4 w-60 text-center">
                <p className="text-sm text-purple-300 font-medium mb-2">{pokemon.generation}</p>
                <img src={pokemon.image} alt={pokemon.name} className="mx-auto w-20 h-20 mb-2 drop-shadow" />
                <h3 className="text-md font-semibold text-purple-200">#{pokemon.id} - {pokemon.name}</h3>
                <div className="mt-2">
                  {pokemon.abilities.map((hab, idx) => (
                    <div key={idx}>
                      <p className="text-sm text-gray-300 mb-1">{hab}</p>
                      <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                        <div
                          className="bg-purple-400 h-2 rounded-full"
                          style={{ width: `${Math.floor(Math.random() * 80) + 20}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>

      <div className="mb-12 max-w-7xl mx-auto px-4">
        <h2 className="text-center text-3xl text-indigo-300 mb-6 font-bold pokemon-title">Pokédex</h2>

        <div className="flex justify-center gap-4 mb-6 max-w-md mx-auto">
          <input
            type="search"
            placeholder="Buscar Pokémon"
            className="rounded px-4 py-2 w-full text-gray-900"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />

          <div className="relative" ref={genDropdownRef}>
            <button
              onClick={() => setGenFilterDropdownOpen(!genFilterDropdownOpen)}
              className="bg-purple-500 px-4 rounded text-white font-semibold hover:bg-purple-600 transition"
              title="Filtrar por gerações"
            >
              Filtrar Gerações
            </button>

            {genFilterDropdownOpen && (
              <div className="absolute right-0 mt-2 bg-gray-900 border border-purple-400 rounded-md p-4 w-48 z-50 shadow-lg">
                {[1,2,3,4,5,6,7,8,9].map(gen => (
                  <label key={gen} className="flex items-center mb-2 cursor-pointer text-purple-200 hover:text-purple-400">
                    <input
                      type="checkbox"
                      checked={geracoesSelecionadas.includes(gen)}
                      onChange={() => toggleGeracaoFiltro(gen)}
                      className="mr-2 accent-purple-500"
                    />
                    Geração {gen}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 justify-items-center max-h-[500px] overflow-auto">
          {loading ? (
            <p className="text-center text-purple-300 col-span-full">Carregando Pokémons...</p>
          ) : (
            pokemonsFiltrados.map(pokemon => (
              <div
                key={pokemon.id}
                className="bg-gray-900 border border-purple-600 rounded-xl p-2 flex flex-col items-center cursor-pointer hover:bg-purple-700 transition"
                onClick={() => setTime(prev => [...prev, pokemon].slice(-quantidade))}
                title={`Adicionar ${pokemon.name} ao time`}
              >
                <img src={pokemon.image} alt={pokemon.name} className="w-16 h-16" />
                <p className="text-sm text-purple-300 mt-1">#{pokemon.id}</p>
                <p className="text-sm font-semibold text-purple-400">{pokemon.name}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SquadMaker;
