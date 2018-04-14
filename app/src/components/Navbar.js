import React from 'react'
import { NavLink } from 'react-router-dom'

import './NavBar.css'

const NavBar = ({ className }) => (
  <div className={`${className} nav-bar`}>
    <NavLink
      className='nav-item with-border'
      to={'/'}
    >
      Featured
    </NavLink>
    <NavLink
      className='nav-item with-border'
      to={'/discover'}
    >
      Discover
    </NavLink>
    <NavLink
      className='nav-item with-border'
      to={'/craft'}
    >
      + Build a Craftable Token
    </NavLink>
  </div>
)

export default NavBar
