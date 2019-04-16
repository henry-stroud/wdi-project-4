import React from 'react'
import axios from 'axios'
import { Redirect } from 'react-router-dom'
import Moment from 'react-moment'

import Auth from '../lib/auth'

class Video extends React.Component {
  constructor() {
    super()
    this.state = {}

    this.handleClick = this.handleClick.bind(this)
  }

  componentDidMount() {
    console.log(this.props.location.state)
    console.log('hello')
  }

  handleClick(boolean) {
    const videoId = this.props.location.state.videoData.videoId
    console.log(videoId, 'this is the video ID')
    axios.post('/api/transactions', { buy: boolean, videoId: videoId.toString() }, { headers: { Authorization: `Bearer ${Auth.getToken()}`} })
      .then((res) => console.log(res))
      .then(() => this.props.history.push('/portfolio'))
      .catch((err) => this.setState({errors: err.response.data.message}))
  }

  render() {
    return (
      <div>
        {this.props.location.state.videoData &&
          <div className="video-page-container">
            <h1 className="video-heading">{this.props.location.state.videoData.title} </h1>
            <iframe className="video-frame" width="560" height="315" src={`https://www.youtube.com/embed/${this.props.location.state.videoData.videoId}`} frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            <h3>View Count : {this.props.location.state.videoData.view_count.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')} </h3>
            <h4>Posted: <Moment date={this.props.location.state.videoData.published_at}
              durationFromNow
            /> ago </h4>
            <div className="desc-cont">
              <div className="description-box">
                <p><span id='description'>Description: </span>{this.props.location.state.specificVideo.snippet.description} </p>
              </div>
            </div>
            <h3 className="price"><span>Current Price :</span> ${this.props.location.state.videoData.price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')} </h3>
            <div className="buttons-and-error">
              {Auth.isAuthenticated() &&
              <button className="buyButton" onClick={() => this.handleClick('True')}>Buy</button>
              }
              {Auth.isAuthenticated() &&
            <button className="sellButton" onClick={() => this.handleClick('False')}>Sell</button>
              }
            </div>
            <div className="error-message">
              <p>{this.state.errors && this.state.errors}</p>
            </div>
          </div>
        }
      </div>
    )
  }
}


export default Video
