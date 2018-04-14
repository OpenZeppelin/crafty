import React from 'react'
import { withRouter, NavLink } from 'react-router-dom'

import './NavBar.css'

const NavBar = withRouter(({ className }) => (
  <div className={`${className} nav-bar`}>
    <NavLink
      className='nav-item with-border'
      exact
      to={'/'}
    >
      Featured
    </NavLink>
    <NavLink
      className='nav-item with-border'
      exact
      to={'/discover'}
    >
      Discover
    </NavLink>
    <NavLink
      className='nav-item with-border'
      exact
      to={'/craft'}
    >
      + Build a Craftable Token
    </NavLink>
  </div>
))

export default NavBar
