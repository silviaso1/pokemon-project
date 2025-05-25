import React from 'react';
import pokemonsImg from '../assets/pokemons.png';
import gcea from '../assets/gcea.png'
import fundoImg from '../assets/fundo.png'

<img src={pokemonsImg} alt="plano-de-fundo" width="780" />


const Home: React.FC = () => {
  return (
    <div
      className="m-0 p-0 bg-cover bg-center bg-no-repeat h-screen flex flex-col justify-center items-center"
    style={{
    fontFamily: "'VT323', serif",
    backgroundColor: '#1e2a38',
    color: '#ecf0f1',
    backgroundImage: `url(${fundoImg})`,
      }}
    >
      <head>
        <title>SquadMaker</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Exo+2&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>

      <div className="flex justify-center pt-10">
        <img src={pokemonsImg} alt="plano-de-fundo" width="780px" />
      </div>
      <div className="flex justify-center relative bottom-20">
        <img src={gcea} alt="logo" />
      </div>
      <p className="text-5xl text-white text-center relative bottom-[90px]">SquadMaker</p>

      <div className="flex justify-center relative bottom-[65px]">
        <button
          onClick={() => (window.location.href = 'pokemon.html')}
          className="bg-gray-800 text-white text-2xl px-16 py-4 rounded-3xl border-2 border-blue-400"
        >
          Iniciar
        </button>
      </div>
    </div>
  );
};

export default Home;
