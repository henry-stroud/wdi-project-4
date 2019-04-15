import React from 'react'
import axios from 'axios'
import { Link, Redirect } from 'react-router-dom'


import Auth from '../lib/auth'
import Moment from 'react-moment'


class Portfolio extends React.Component {
  constructor() {
    super()
    this.state = {
      redirect: false
    }

    this.handleClick = this.handleClick.bind(this)
    this.handleSellClick = this.handleSellClick.bind(this)

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
      console.log(array, 'this is the array of objects')
      this.setState({...this.state, ownedVideoData: array}, () => console.log(this.state))
      const result = this.state.userProfile.owned_videos.map(ownedVideo => ({...array.find(data => ownedVideo.id === data.id), ...ownedVideo}))
      console.log(result, 'final object my guy')
      const userProfile = {...this.state.userProfile}
      userProfile.owned_videos = result
      this.setState({userProfile}, () => console.log(this.state, 'new prof'))
    }
  }

  getSpecificVideoData(id) {
    axios.post('/api/videos/localvideo', { videoId: id.toString() })
      .then((res) => this.setState({videoInfo: res.data}))
      .then(() => this.setState({redirect: !this.state.redirect}))
  }

  handleClick(video) {
    this.setState({videoData: video}, () => this.getSpecificVideoData(video.videoId))
  }

  handleSellClick(video) {
    console.log(video)
    axios.post('/api/transactions', { buy: false, videoId: video.videoId.toString() }, { headers: { Authorization: `Bearer ${Auth.getToken()}`} })
      .then((res) => console.log(res))
      .then(() => this.grabUserData())
      .catch((err) => console.log(err.response))
  }



  render() {
    {this.state && console.log(this.state)}
    return (
      <div>
        {this.state.userProfile &&
        <div>
          <h3 className="top-head">Cash Balance: <span className="price">${this.state.userProfile.balance.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span></h3>
          {this.state.holdingsValue &&
          <div>
            <h3>Holdings Value: <span className="price">${this.state.holdingsValue.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span></h3>

            <h3>Total Portfolio Value: <span className="price">${(this.state.userProfile.balance + this.state.holdingsValue).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span></h3>
            <h2>Video Portfolio:</h2>

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
          </div>
          }
        </div>
        }
      </div>
    )
  }
}

export default Portfolio
