import React from 'react'
import axios from 'axios'
import { Link, Redirect } from 'react-router-dom'

class TopVideos extends React.Component {
  constructor() {
    super()
    this.state = {
      redirect: false
    }
  }

  componentDidMount() {
    this.getTopVideoData()
  }

  getTopVideoData() {
    axios.get('/api/videos')
      .then((res) => {
        const videoArray = res.data
        const sorted = videoArray.sort(this.compare)
        this.setState({topVideos: sorted})
      })
  }

  handleClick(video) {
    this.setState({videoData: video}, () => this.getSpecificVideoData(video.videoId))
  }

  getSpecificVideoData(id) {
    axios.post('/api/videos/localvideo', { videoId: id.toString() })
      .then((res) => this.setState({videoInfo: res.data}))
      .then(() => this.setState({redirect: !this.state.redirect}))
  }

  compare(a,b) {
    if (a.owned_by.length > b.owned_by.length)
      return -1
    if (a.owned_by.length < b.owned_by.length)
      return 1
    return 0
  }

  render() {
    return (
      <div>
        <table className="u-full-width">
          <thead>
            <tr>
              <th>Position</th>
              <th>Title</th>
              <th>Price</th>
              <th>View Count</th>
              <th>Owners</th>
            </tr>
          </thead>
          <tbody>
            {(this.state.topVideos && this.state.topVideos.length) &&
        this.state.topVideos.map((video, i) => (
          <tr key={i}>
            <td>{i+1}</td>
            <td className="video-link"onClick={() => this.handleClick(video)}>{this.state.redirect && <Redirect to={{
              pathname: '/video',
              state: {
                videoData: this.state.videoData,
                specificVideo: this.state.videoInfo.items[0]
              }
            }} ></Redirect>}{video.title}</td>
            <td>${video.price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</td>
            <td>{video.view_count.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</td>
            <td>{video.owned_by.length.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</td>
          </tr>
        ))
            }
          </tbody>
        </table>
      </div>
    )
  }
}

export default TopVideos
