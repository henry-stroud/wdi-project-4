import React from 'react'
import axios from 'axios'
import { Redirect } from 'react-router-dom'


import Auth from '../lib/auth'
import Moment from 'react-moment'


class Portfolio extends React.Component {
  constructor() {
    super()
    this.state = {
      redirect: false,
      portfolio: true,
      transactionHistory: false,
      transactionVids: []
    }

    this.handleClick = this.handleClick.bind(this)
    this.handleSellClick = this.handleSellClick.bind(this)
    this.portfolioClick = this.portfolioClick.bind(this)
    this.transactionClick = this.transactionClick.bind(this)

  }

  componentDidMount() {
    this.grabUserData()
  }

  grabUserData() {
    axios.get('/api/currentuser', { headers: { Authorization: `Bearer ${Auth.getToken()}`} })
      .then((res) => this.setState({userProfile: res.data}, () => this.calculateHoldings(this.state.userProfile)))
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
            videoTransactions.push([{id: video.id, price_at_deal: transaction.price_of_deal, view_count_at_deal: transaction.view_count_at_deal, date_of_deal: transaction.created_at}])
          }
        })
        const latest = videoTransactions.reduce(function (r, a) {
          return r.date_of_deal > a.date_of_deal ? r : a
        })
        const newArray = {...latest[0]}
        array.push(newArray)
      })
      this.setState({...this.state, ownedVideoData: array})
      const result = this.state.userProfile.owned_videos.map(ownedVideo => ({...array.find(data => ownedVideo.id === data.id), ...ownedVideo}))
      const userProfile = {...this.state.userProfile}
      const sortedResult = result.sort(this.compareDeal)
      userProfile.owned_videos = sortedResult
      this.setState({userProfile}, () => this.getTransactionData(userProfile))
    }
  }

  handleClickTransaction(transaction) {
    axios.get(`/api/videos/${transaction.videos}`)
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err))
  }

  getTransactionData(userProfile) {
    if (userProfile.user_transaction.length) {
      const newObject = userProfile.user_transaction
      newObject.forEach(x => {
        axios.get(`/api/videos/${x.videos}`)
          .then((res) => x.videoDataNew = res.data)
          .catch((err) => console.log(err))

      })
      const newTransactionsObject = newObject.sort(this.compare)
      this.setState({newTransactionsObject})
    }
  }

  compare(a,b) {
    if (a.created_at > b.created_at)
      return -1
    if (a.created_at < b.created_at)
      return 1
    return 0
  }

  compareDeal(a,b) {
    if (a.date_of_deal > b.date_of_deal)
      return -1
    if (a.date_of_deal < b.date_of_deal)
      return 1
    return 0
  }


  getSpecificVideoData(id) {
    axios.post('/api/videos/localvideo', { videoId: id.toString() })
      .then((res) => this.setState({videoInfo: res.data}))
      .then(() => this.setState({redirect: !this.state.redirect}))
      .catch((err) => console.log(err))
  }

  handleClick(video) {
    this.setState({videoData: video}, () => this.getSpecificVideoData(video.videoId))
  }

  handleSellClick(video) {
    axios.post('/api/transactions', { buy: false, videoId: video.videoId.toString() }, { headers: { Authorization: `Bearer ${Auth.getToken()}`} })
      .then(() => this.grabUserData())
      .catch((err) => console.log(err.response))
  }

  portfolioClick() {
    this.setState({transactionHistory: false, portfolio: true})
  }

  transactionClick() {
    this.setState({transactionHistory: true, portfolio: false})
  }

  render() {
    return (
      <div>
        {this.state.userProfile &&
        <div>
          <h3 className="top-head">Cash Balance: <span className="price">${this.state.userProfile.balance.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span></h3>
          {this.state.holdingsValue &&
          <div>
            <h3>Holdings Value: <span className="price">${this.state.holdingsValue.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span></h3>

            <h3>Total Portfolio Value: <span className="price">${(this.state.userProfile.balance + this.state.holdingsValue).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span></h3>
            <button onClick={this.portfolioClick}>Video Portfolio</button>
            <button onClick={this.transactionClick}>Transaction History</button>
            {this.state.portfolio &&
            <table className="u-full-width">
              <thead>
                <tr>
                  <th>Video Title</th>
                  <th>Video Publish Date</th>
                  <th>Date Purchased</th>
                  <th>Price Purchased At</th>
                  <th>Current Price</th>
                  <th>View Count at Purchase</th>
                  <th>Current View Count</th>
                  <th>Profit/Loss($)</th>
                  <th>Profit/Loss(%)</th>
                  <th>Sell</th>
                </tr>
              </thead>
              <tbody>
                {(this.state.userProfile.owned_videos.length && this.state.userProfile.owned_videos[0].view_count_at_deal) &&
              this.state.userProfile.owned_videos.map((video, i) => (
                <tr key={i}>
                  <td className="video-link"onClick={() => this.handleClick(video)}>{this.state.redirect && <Redirect to={{
                    pathname: '/video',
                    state: {
                      videoData: this.state.videoData,
                      specificVideo: this.state.videoInfo.items[0]
                    }
                  }} ></Redirect>}{video.title}</td>
                  <td><Moment date={video.published_at}
                    durationFromNow
                  /> ago</td>
                  <td><Moment date={video.date_of_deal}
                    durationFromNow
                  /> ago</td>
                  <td>${video.price_at_deal.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</td>
                  <td>${video.price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</td>
                  <td>{video.view_count_at_deal.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</td>
                  <td>{video.view_count.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')} </td>
                  <td className={(video.price - video.price_at_deal >= 0 || video.price - video.price_at_deal === 0) ? 'profit-loss-profit' : 'profit-loss-loss'}>
                    {(video.price - video.price_at_deal >= 0 || video.price - video.price_at_deal === 0) ? '+' : '-'}
                    ${Math.abs(video.price - video.price_at_deal).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                  </td>

                  <td className={((((video.price - video.price_at_deal > 0) / video.price_at_deal) * 100) || (((video.price - video.price_at_deal) / video.price_at_deal) * 100) === 0) ? 'profit-loss-profit' : 'profit-loss-loss'}>
                    {((((video.price - video.price_at_deal) / video.price_at_deal) * 100) >= 0 || (((video.price - video.price_at_deal) / video.price_at_deal) * 100) === 0) ? '+' : '-'}
                    {Math.abs((((video.price - video.price_at_deal) / video.price_at_deal) * 100)).toFixed(2)}%
                  </td>
                  <td className="sell-button"><button onClick={() => this.handleSellClick(video)} className="btn btn-primary mb1 bg-red sellButton">Sell</button></td>
                </tr>
              ))
                }
              </tbody>
            </table>
            }
            {this.state.transactionHistory &&
            <table className="u-full-width">
              <thead>
                <tr>
                  <th>Video Title</th>
                  <th>Video Publish Date</th>
                  <th>Date Of Transaction</th>
                  <th>Buy/Sell</th>
                  <th>Price Of Transaction</th>
                  <th>View Count at Transaction</th>
                  <th>Current Price</th>
                  <th>Current View Count</th>
                </tr>
              </thead>
              <tbody>
                {(this.state.newTransactionsObject && this.state.newTransactionsObject[0].videoDataNew.title) &&
              this.state.newTransactionsObject.map((transaction, i) => (
                <tr key={i}>
                  <td className="video-link"onClick={() => this.handleClick(transaction.videoDataNew)}>{this.state.redirect && <Redirect to={{
                    pathname: '/video',
                    state: {
                      videoData: this.state.videoData,
                      specificVideo: this.state.videoInfo.items[0]
                    }
                  }} ></Redirect>}{transaction.videoDataNew.title}</td>
                  <td><Moment date={transaction.videoDataNew.published_at}
                    durationFromNow
                  /> ago</td>
                  <td><Moment date={transaction.created_at}
                    durationFromNow
                  /> ago</td>
                  <td className={transaction.buy ? 'buy-color' : 'sell-color'}>{transaction.buy ?
                    'Buy' : 'Sell'
                  }</td>
                  <td>${transaction.price_of_deal.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</td>
                  <td>{transaction.view_count_at_deal.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</td>
                  <td>${transaction.videoDataNew.price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</td>
                  <td>{transaction.videoDataNew.view_count.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</td>
                </tr>
              ))
                }
              </tbody>
            </table>
            }
          </div>
          }
        </div>
        }
      </div>
    )
  }
}

export default Portfolio
