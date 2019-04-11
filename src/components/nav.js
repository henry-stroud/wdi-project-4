import React, { Component } from 'react'
import ResponsiveMenu from 'react-responsive-navbar'
import { FaBars, FaRegWindowClose } from 'react-icons/fa'
import { Link, withRouter } from 'react-router-dom'



class Nav extends Component {
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
                <li>
                  <Link to="/register">Register</Link>
                </li>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/portfolio">My Portfolio</Link>
                </li>
                <li>
                  <Link to="/balance">My Balance</Link>
                </li>
              </ul>
            </div>
          }
        />
      </div>
    )
  }
}

export default withRouter(Nav)
