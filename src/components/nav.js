import React from 'react'
import ResponsiveMenu from 'react-responsive-navbar'
import { FaBars, FaRegWindowClose } from 'react-icons/fa'
import { Link, withRouter } from 'react-router-dom'
import axios from 'axios'

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

  componentDidMount() {
    this.grabUserData()
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.userProfile) {
      if(prevState.userProfile === this.state.userProfile) {
        this.grabUserData()
        console.log('navbar grabbing user data')
      }
    }
  }

  grabUserData() {
    axios.get('/api/currentuser', { headers: { Authorization: `Bearer ${Auth.getToken()}`} })
      .then((res) => this.setState({userProfile: res.data}))
      .catch((err) => console.log(err))
  }

  render() {
    (this.state && console.log(this.state, 'NAVBAR STATE'))
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
                  <Link to="/topvideos">Top Videos</Link>
                </li>
                <li>
                  <Link to="/leaderboard">Leaderboard</Link>
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
                {(this.state.userProfile !== undefined && this.state.userProfile.balance) &&
                <>
                  {Auth.isAuthenticated() &&
                <li>
                  <Link to="/portfolio"><span className="price"><span>Balance:</span> ${this.state.userProfile.balance.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span></Link>
                </li>
                  }
                </>
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
