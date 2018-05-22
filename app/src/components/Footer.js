import React from 'react'

import Emoji from './Emoji'

import './Footer.css'

const Footer = () => (
  <footer className='grid-x grid-padding-x space-between flex-center'>
  	<div>
  		<a target="_blank" href="https://github.com/zeppelinos/crafty">
  			<img alt='Github' className='github' src='./images/github.svg'/>
  		</a>
  	</div>
    <div className='cell auto'>
      <p>
        <Emoji e='🎈' /> An <a target="_blank" href='https://XLNT.co'>XLNT</a> project
        by <a target="_blank" href='https://zeppelin.solutions'>Zeppelin</a>
      </p>
    </div>
  </footer>
)

export default Footer
