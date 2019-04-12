import React from 'react'
import axios from 'axios'

import Auth from '../lib/auth'


class Portfolio extends React.Component {
  constructor() {
    super()
    this.state = {}

  }

  componentDidMount() {
    axios.get('/api/currentuser', { headers: { Authorization: `Bearer ${Auth.getToken()}`} })
      .then((res) => this.setState({userProfile: res.data}, () => this.calculateHoldings(this.state.userProfile)))
      .then(()=> console.log(this.state, 'STATE'))
      .catch((err) => console.log(err))
  }

  calculateHoldings(profileData) {
    if (profileData.owned_videos.length) {
      const holdings = profileData.owned_videos.map(x => x.price).reduce((acc, cv) => acc+cv)
      this.setState({holdingsValue: holdings}, () => this.calculatePurchasePrices(this.state.userProfile))
    }

  }

  calculatePurchasePrices(profileData) {
    if (profileData.owned_videos.length && profileData.user_transaction.length) {
      const transactions = profileData.user_transaction
      const ownedVideos = profileData.owned_videos
      const array = []
      ownedVideos.forEach(function (video) {
        const videoTransactions = []
        transactions.forEach(function (transaction) {
          if (transaction.buy && video.id === transaction.videos) {
            videoTransactions.push([{id: video.id, price_at_deal: transaction.price_of_deal, view_count_at_deal: transaction.view_count_at_deal, created_at: transaction.created_at}])
          }
        })
        const latest = videoTransactions.reduce(function (r, a) {
          return r.created_at > a.created_at ? r : a
        })
        array.push(latest)
      })
      console.log(array, 'this is the array of objects')    
    }
  }

  render() {
    {this.state && console.log(this.state)}
    return (
      <div>
        {this.state.userProfile &&
        <div>
          <h3>Cash Balance: <span className="price">${this.state.userProfile.balance.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span></h3>
          {this.state.holdingsValue &&
          <div>
            <h3>Holdings Value: <span className="price">${this.state.holdingsValue.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span></h3>

            <h3>Total Portfolio Value: <span className="price">${(this.state.userProfile.balance + this.state.holdingsValue).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span></h3>
            <h2>Video Portfolio:</h2>

            <table className="u-full-width">
              <thead>
                <tr>
                  <th>Video Title</th>
                  <th>Data Purchased</th>
                  <th>Price Purchased At</th>
                  <th>Current Price</th>
                  <th>Current View Count</th>
                  <th>View Count at Purchase</th>
                  <th>Profit/Loss($)</th>
                  <th>Profit/Loss(%)</th>
                </tr>
              </thead>
              <tbody>
                {this.state.userProfile.owned_videos.length &&
              this.state.userProfile.owned_videos.map((video, i) => (
                <tr key={i}>
                  <td>{video.title} </td>
                  <td></td>
                  <td></td>
                  <td>${video.price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</td>
                  <td>{video.view_count.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')} </td>
                  <td> </td>
                </tr>
              ))
                }
              </tbody>
            </table>
          </div>
          }
        </div>
        }
      </div>
    )
  }
}

// <td>{this.state.userProfile.user_transaction.filter((transaction, i) => (
//   <div key={i}>
//     {transaction.videos = video.id}
//   </div>
// )).map((transaction, i) => (
//   <div key={i}>
//     {transaction.price_of_deal}
//   </div>
// ))}</td>

export default Portfolio
