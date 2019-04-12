import React from 'react'
import ResponsiveMenu from 'react-responsive-navbar'
import { FaBars, FaRegWindowClose } from 'react-icons/fa'
import { Link, withRouter } from 'react-router-dom'

import Auth from '../lib/auth'



class Nav extends React.Component {
  constructor() {
    super()

    this.state = {}
    this.logout = this.logout.bind(this)
  }

  logout() {
    Auth.logout()
    this.props.history.push('/')
  }

  render() {
    return (
      <div>
        <ResponsiveMenu
          menuOpenButton={<FaBars size={30} color="black" />}
          menuCloseButton={<FaRegWindowClose size={30} color="black" />}
          changeMenuOn="500px"
          largeMenuClassName="large-menu"
          smallMenuClassName="small-menu"
          menu={
            <div className='navbar-items'>
              <ul>
                <li>
                  <Link to="/">YouBet</Link>
                </li>
                {!Auth.isAuthenticated() &&
                <li>
                  <Link to="/register">Register</Link>
                </li>
                }
                {!Auth.isAuthenticated() &&
                <li>
                  <Link to="/login">Login</Link>
                </li>
                }
                {Auth.isAuthenticated() &&
                <li>
                  <Link to="/portfolio">My Portfolio</Link>
                </li>
                }
                {Auth.isAuthenticated() &&
                <li>
                  <Link to="/balance">My Balance</Link>
                </li>
                }
                {Auth.isAuthenticated() &&
                <li onClick={this.logout}>
                  <Link to="/">Logout</Link>
                </li>
                }
              </ul>
            </div>
          }
        />
      </div>
    )
  }
}

export default withRouter(Nav)
