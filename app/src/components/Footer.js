import React from 'react'

import './Footer.css'

const Footer = () => (
  <footer className='grid-x grid-padding-x space-between flex-center'>
  	<div className='flex-center'>
  		<a target='_blank' href='https://github.com/zeppelinos/crafty' rel='noopener noreferrer'>
  			<img alt='Github' className='github' src='./images/github.svg'/>
  		</a>
  		<div>
	  		<span className='light'>Last block:</span>
	  		<span className='strong'> #3212515 (mined 21 seconds ago)</span>
  		</div>
  	</div>
    <div className='cell auto'>
      <p className='light'>
        Powered by <a target='_blank' href='https://XLNT.co' rel='noopener noreferrer'>XLNT</a> and <a target='_blank' href='http://zeppelinos.org/' rel='noopener noreferrer'>ZeppelinOS</a>
      </p>
    </div>
  </footer>
)

export default Footer
