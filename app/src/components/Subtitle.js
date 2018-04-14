import React from 'react'

import './Subtitle.css'

const Subtitle = ({ children }) => (
  <section className='grid-container'>
    <div className='grid-x grid-margin-x'>
      <div className='cell small-12 align-center-middle text-center'>
        <p className='subtitle'>{children}</p>
      </div>
    </div>
  </section>
)

export default Subtitle
