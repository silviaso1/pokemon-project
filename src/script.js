const pokemons = [];
    const todosContainer = document.getElementById('todosContainer');
    const timeContainer = document.getElementById('timeContainer');
    const qtdSpan = document.getElementById('qtdExibida');
    const rangeInput = document.getElementById('quantidadeRange');
    const searchInput = document.getElementById('searchInput');
    const genDropdown = document.getElementById('genDropdown');
  
    rangeInput.addEventListener('input', () => {
      qtdSpan.textContent = rangeInput.value;
    });
  
    const geracoes = {
      1: [1, 151], 2: [152, 251], 3: [252, 386], 4: [387, 493],
      5: [494, 649], 6: [650, 721], 7: [722, 809], 8: [810, 898], 9: [899, 1010]
    };
  
    function descobrirGeracao(id) {
      for (const gen in geracoes) {
        const [inicio, fim] = geracoes[gen];
        if (id >= inicio && id <= fim) return `Geração ${gen}`;
      }
      return 'Desconhecida';
    }
  
    async function carregarPokemons() {
      for (let gen = 1; gen <= 9; gen++) {
        const [inicio, fim] = geracoes[gen];
        for (let id = inicio; id <= fim; id++) {
          try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const data = await res.json();
            const pokemon = {
              id: data.id,
              name: data.name[0].toUpperCase() + data.name.slice(1),
              image: data.sprites.front_default,
              abilities: data.abilities.map(ab => ab.ability.name.replace('-', ' ')),
              generation: descobrirGeracao(data.id),
              genNumber: gen.toString()
            };
            pokemons.push(pokemon);
            renderPokemon(pokemon);
          } catch {}
        }
      }
    }
  
    function renderPokemon(pokemon) {
      const card = document.createElement('div');
      card.className = "bg-gray-800/90 border border-indigo-300 rounded-xl shadow-md p-4 w-60 text-center";
      card.innerHTML = `
        <p class="text-sm text-indigo-400 font-medium mb-2">${pokemon.generation}</p>
        <img src="${pokemon.image}" alt="${pokemon.name}" class="mx-auto w-20 h-20 mb-2 drop-shadow">
        <h3 class="text-md font-semibold text-indigo-200">#${pokemon.id} - ${pokemon.name}</h3>
        <div class="mt-2">
          ${pokemon.abilities.map(hab => `
            <p class="text-sm text-gray-300 mb-1">${hab}</p>
            <div class="w-full bg-gray-600 rounded-full h-2 mb-2">
              <div class="bg-indigo-400 h-2 rounded-full" style="width:${Math.floor(Math.random() * 80) + 20}%"></div>
            </div>
          `).join('')}
        </div>
      `;
      todosContainer.appendChild(card);
    }
  
    function gerarTime() {
      const selecionadas = Array.from(document.querySelectorAll('.geracao:checked')).map(cb => Number(cb.value));
      const [start, end] = selecionadas.reduce(([min, max], gen) => {
        const [inicio, fim] = geracoes[gen];
        return [Math.min(min, inicio), Math.max(max, fim)];
      }, [Number.MAX_VALUE, 0]);
  
      const candidatos = pokemons.filter(p => p.id >= start && p.id <= end);
      const quantidade = Number(rangeInput.value);
      const time = [];
  
      while (time.length < quantidade && candidatos.length > 0) {
        const index = Math.floor(Math.random() * candidatos.length);
        time.push(candidatos.splice(index, 1)[0]);
      }
  
      timeContainer.innerHTML = '';
      time.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = "bg-gray-900 border border-purple-400 rounded-xl shadow-lg p-4 w-60 text-center";
        card.innerHTML = `
          <p class="text-sm text-purple-300 font-medium mb-2">${pokemon.generation}</p>
          <img src="${pokemon.image}" alt="${pokemon.name}" class="mx-auto w-20 h-20 mb-2 drop-shadow">
          <h3 class="text-md font-semibold text-purple-200">#${pokemon.id} - ${pokemon.name}</h3>
          <div class="mt-2">
            ${pokemon.abilities.map(hab => `
              <p class="text-sm text-gray-300 mb-1">${hab}</p>
              <div class="w-full bg-gray-600 rounded-full h-2 mb-2">
                <div class="bg-purple-400 h-2 rounded-full" style="width:${Math.floor(Math.random() * 80) + 20}%"></div>
              </div>
            `).join('')}
          </div>
        `;
        timeContainer.appendChild(card);
      });
    }
  
    function filtrarPokemon() {
      const termo = searchInput.value.toLowerCase();
      const selecionadas = Array.from(document.querySelectorAll('.gen-filter:checked')).map(opt => opt.value);
      
      todosContainer.innerHTML = '';
      
      pokemons
        .filter(p => {
          const nomeMatch = p.name.toLowerCase().includes(termo);
          const genMatch = selecionadas.includes(p.genNumber);
          return nomeMatch && genMatch;
        })
        .forEach(p => renderPokemon(p));
    }
    
    function toggleDropdown() {
      genDropdown.classList.toggle('show');
    }

    window.onclick = function(event) {
      if (!event.target.matches('.dropdown-btn')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
          const openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
          }
        }
      }
    }

    document.querySelectorAll('.gen-filter').forEach(checkbox => {
      checkbox.addEventListener('change', filtrarPokemon);
    });

    document.querySelectorAll('.gen-filter, .gen-filter + label').forEach(element => {
      element.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    });
    carregarPokemons();