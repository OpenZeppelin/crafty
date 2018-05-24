import React from 'react'

import './Loader.css'
import './PacmanLoader.css'
import './BallBeatLoader.css'

const PacmanLoader = () => (
  <div className='cell grid-x align-middle align-center'>
    <div className='pacman hella-spacing'>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
)

const TinyLoader = () => (
  <div className='grid-x align-middle align-center tiny-loader'>
    <div className='ball-beat'>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
)

const Loader = ({ pacman = false, tiny = false }) => {
  if (pacman) {
    return <PacmanLoader />
  } else if (tiny) {
    return <TinyLoader />
  }

  return null
}

export default Loader
