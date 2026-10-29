import { useState } from 'react'
import {Routes, Route, useNavigate} from 'react-router-dom'
import {NavBar} from './Components/NavBar'
import { Timeline } from './Components/Timeline'
import {About} from './Components/About'
import { RuntimeWrapper } from './Components/RuntimeWrapper'
import { Workspace } from './Components/Workspace'

import './App.css'

function App() {

  return (
    <>
      <NavBar/>
      <Routes>
        <Route path='/' element={<Timeline/>}/>
        <Route path='about' element={<About/>}/>
        <Route path=':wrapperId' element={<RuntimeWrapper wrapperType={'ContentPost'}/>}/>
        <Route path='Template' >
          <Route path=':wrapperId' element={<RuntimeWrapper wrapperType={'Template'}/>}/>
        </Route>
        <Route path='Workspace'>
          <Route path=':wrapperId' element={<RuntimeWrapper wrapperType={'Workspace'}/>}/>
        </Route>
      </Routes>
    </>

  )
}

export default App
