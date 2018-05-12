import React from 'react'

import './SectionHeader.css'

const SectionHeader = ({ children }) => (
  <section className='grid-container full'>
    <div className='grid-x grid-margin-x'>
      <div className='cell auto medium-shrink'>
        <h3 className='section-header'>
          {children}
        </h3>
      </div>
    </div>
  </section>

)

export default SectionHeader
