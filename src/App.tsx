import { useState } from 'react'
import SquadMaker from './components/SquadMaker'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <SquadMaker/>
    </>
  )
}

export default App
