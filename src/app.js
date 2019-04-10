import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'

import './style.scss'

class App extends React.Component {
  constructor() {
    super()
    this.state = { }
  }

  componentDidMount() {
    this.getSpecificVideoData()
    this.getTopVideos()
    this.searchByQuery()
    axios.get('/api/videos')
      .then((res)=> this.setState({data: res.data}))
      .then(()=> console.log(this.state.data, 'hello'))
      .catch((err) => console.log(err))
  }

  getSpecificVideoData() {
    axios.post('/api/videos/localvideo', { videoId: 'mWRLepUjE3U' })
      .then((res) => this.setState({videoInfo: res.data}, () => axios.post('/api/videos/localvideo/post', {data: res.data})
        .then((res) => this.setState({returnedVidInfo: res.data}))
        .catch((err) => console.log(err))))
  }

  getTopVideos() {
    axios.get('https://www.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&regionCode=US&key=AIzaSyDS1LMh04tC5Gn3FXzqEuIIHa149w61vno')
      .then((res) => this.setState({topVids: res.data}))
  }

  searchByQuery() {
    axios.get('https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=7%20rings&key=AIzaSyDS1LMh04tC5Gn3FXzqEuIIHa149w61vno')
      .then((res) => this.setState({searchResults: res.data}))
  }

  render() {
    {this.state && console.log(this.state)}
    return (
      <div>
        {this.state.data && this.state.data.map((video, i ) => (
          <div key={i}>
            <h1>Video Title: {video.title}</h1>
            <h2>Video Publish Date: {video.published_at}</h2>
            <h3>View Count: {video.view_count}</h3>
            <h4>Video Id: {video.videoId}</h4>
            <h5>Comments: {video.comments.map((comment, i) => (
              <p key={i}> {comment.content}</p>
            ))} </h5>
          </div>
        ))}
      </div>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
)
