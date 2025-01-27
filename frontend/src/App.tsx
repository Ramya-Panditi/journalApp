import { useState } from 'react'
import './App.css'
import Bottom from './components/Bottom';

function App() {

  

  return (
    <div className="container w-100 ">
      <div className='text-center mx-auto heading'>
        <h1 className="quicksand-first mb-0">Ohhh, tell me about your day.</h1>
        <h2 className="birthstone-bounce-medium mt-0">I wanna hear all about it</h2>
      </div>
      <div className=''>
        <Bottom/>
       
      </div>
    </div>
  )
}

export default App;
