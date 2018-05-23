import React from 'react'

const EmptyState = ({ content }) => (
  <div className='grid-container'>
    <div className='grid-x grid-margin-x hella-spacing'>
      <div className='cell auto'>
        {content}
      </div>
    </div>
  </div>
)

export default EmptyState
