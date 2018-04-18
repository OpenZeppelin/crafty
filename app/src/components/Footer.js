import React from 'react'

import Emoji from './Emoji'

import './Footer.css'

const Footer = () => (
  <footer className='grid-x grid-padding-x align-bottom'>
    <div className='cell auto'>
      <p>
        <Emoji e='🎈' /> An <a href='https://XLNT.co'>XLNT</a> project
        by <a href='https://zeppelin.solutions'>Zeppelin</a>
      </p>
    </div>
  </footer>
)

export default Footer
