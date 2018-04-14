import React from 'react'

import './SectionHeader.css'

const SectionHeader = ({ children }) => (
  <section className='grid-container full'>
    <div className='grid-x grid-margin-x'>
      <div className='cell shrink'>
        <h2 className='section-header'>
          {children}
        </h2>
      </div>
    </div>
  </section>

)

export default SectionHeader
