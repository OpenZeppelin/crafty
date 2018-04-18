import React from 'react'

import './Subtitle.css'

const Subtitle = ({ children, className }) => (
  <section className='grid-container'>
    <div className={`'grid-x grid-margin-x' ${className}`}>
      <div className='cell small-12 align-center-middle text-center'>
        <div className='subtitle'>{children}</div>
      </div>
    </div>
  </section>
)

export default Subtitle
