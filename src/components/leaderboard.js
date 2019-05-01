import React from 'react'
import axios from 'axios'
import { Redirect } from 'react-router-dom'

class LeaderBoard extends React.Component {
  constructor() {
    super()
    this.state = {
      redirect: false,
      holdings: [],
      newUsers: []
    }

    this.handleClick = this.handleClick.bind(this)
  }

  componentDidMount() {
    this.getAllUserData()
  }

  getAllUserData() {
    axios.get('/api/users')
      .then((res) => this.setState({users: res.data}))
      .then(() => this.state.users.map(profileData => this.calculateHoldings(profileData)))
      .then(() => {
        const sortedArray = [...this.state.newUsers]
        sortedArray.sort(this.compare)
        this.setState({sortedArray})
      })
      .catch((err) => console.log(err))
  }

  calculateHoldings(profileData) {
    if (!profileData.owned_videos.length) {
      const userProfile = {...profileData}
      userProfile.holdings = 0
      userProfile.portfolioValue = Number(userProfile.holdings) + Number(userProfile.balance)
      const joined = this.state.holdings.concat(userProfile)
      this.setState({ newUsers: [...this.state.newUsers, joined[0]]})
    }
    if (profileData.owned_videos.length) {
      const holdings = profileData.owned_videos.map(x => x.price).reduce((acc, cv) => acc+cv)
      const userProfile = {...profileData}
      userProfile.holdings = holdings
      userProfile.portfolioValue = Number(userProfile.holdings) + Number(userProfile.balance)
      const joined = this.state.holdings.concat(userProfile)
      this.setState({ newUsers: [...this.state.newUsers, joined[0]] })
    }
  }

  compare(a,b) {
    if (a.portfolioValue > b.portfolioValue)
      return -1
    if (a.portfolioValue < b.portfolioValue)
      return 1
    return 0
  }

  handleClick(user) {
    this.setState({clickedOnUser: user}, () => this.setState({redirect: !this.state.redirect}))

  }

  render() {
    return (
      <div>
        <table className="u-full-width">
          <thead>
            <tr>
              <th>Position</th>
              <th>Username</th>
              <th>Total Portfolio Value</th>
              <th>Videos Owned</th>
              <th>Number of Transactions</th>
            </tr>
          </thead>
          <tbody>
            {(this.state.sortedArray && this.state.sortedArray) &&
        this.state.sortedArray.map((user, i) => (
          <tr key={i}>
            <td>{i+1}</td>
            <td className="video-link"onClick={() => this.handleClick(user)}>{this.state.redirect && <Redirect to={{
              pathname: '/userportfolio',
              state: {
                userProfile: this.state.clickedOnUser
              }
            }} ></Redirect>}{user.username}</td>
            <td>${user.portfolioValue.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</td>
            <td>{user.owned_videos.length}</td>
            <td>{user.user_transaction.length}</td>
          </tr>
        ))
            }
          </tbody>
        </table>
      </div>
    )
  }
}

export default LeaderBoard
