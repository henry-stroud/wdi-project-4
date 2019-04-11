import React, { Component } from 'react'
import axios from 'axios'
import { Redirect } from 'react-router-dom'


class Home extends Component {
  constructor() {
    super()
    this.state = {
      searchValue: '',
      redirect: false
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleClickTop = this.handleClickTop.bind(this)
  }

  componentDidMount() {
    this.getTopVideos()
    axios.get('/api/videos')
      .then((res)=> this.setState({data: res.data}))
      .then(()=> console.log(this.state.data, 'hello'))
      .catch((err) => console.log(err))
  }

  getSpecificVideoData(id) {
    axios.post('/api/videos/localvideo', { videoId: id.toString() })
      .then((res) => this.setState({videoInfo: res.data}, () => axios.post('/api/videos/localvideo/post', {data: res.data})
        .then((res) => this.setState({returnedVidInfo: res.data}))
        .then(() => this.setState({redirect: !this.state.redirect}))
        .then(() => console.log(this.state))
        .catch((err) => console.log(err))))
  }

  getTopVideos() {
    axios.get('https://www.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&regionCode=US&key=AIzaSyCnnirPLrCc-C-tUYCcZKv3Z2O0yBrcM-g')
      .then((res) => this.setState({topVids: res.data}, () => console.log(this.state.topVids)))
      .catch((err) => console.log(err))
  }

  searchByQuery(query) {
    axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${query}&key=AIzaSyCnnirPLrCc-C-tUYCcZKv3Z2O0yBrcM-g`)
      .then((res) => {
        console.log(res.data)
        const filtered = res.data.items.filter(data => data.id && data.id.kind === 'youtube#video')
        console.log(filtered)
        this.setState({searchResults: filtered}, () => console.log(this.state, 'HELLO'))
      })
  }

  handleChange({ target: { value }}) {
    this.setState({ searchValue: value}, () => console.log(this.state.searchValue))
  }

  handleSubmit(e) {
    e.preventDefault()
    this.searchByQuery(encodeURI(this.state.searchValue))
    this.setState({searchValue: '', topVids: ''})
  }

  handleClick(video) {
    this.setState({specificVideo: video}, () => this.getSpecificVideoData(this.state.specificVideo.id.videoId))
  }

  handleClickTop(video) {
    this.setState({specificVideo: video}, () => this.getSpecificVideoData(this.state.specificVideo.id))
  }

  render() {
    {this.state.topVids && console.log(this.state.topVids.items)}
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <div className="field">
            <div className="control">
              <input onChange={this.handleChange} className="input" type="text" placeholder="Search..." value={this.state.searchValue || ''}/>
            </div>
            <div className="control">
              <button className="button">
              Go!
              </button>
            </div>
          </div>
        </form>
        <div className='video-grid'>
          {this.state.topVids && this.state.topVids.items.map((video, i ) => (
            <div onClick={() => this.handleClickTop(video)} className='video' key={i}>
              {this.state.redirect && <Redirect
                to={{
                  pathname: '/video',
                  state: {
                    videoData: this.state.returnedVidInfo,
                    specificVideo: this.state.specificVideo
                  }
                }}></Redirect>}
              <h2 className='video-title'>{video.snippet.title}</h2>
              <img src={video.snippet.thumbnails.high.url} width='480' height='360'/>
            </div>
          ))}
          {this.state.searchResults && this.state.searchResults.map((video, i ) => (
            <div onClick={() => this.handleClick(video)} className='video' key={i}>
              {this.state.redirect && <Redirect
                to={{
                  pathname: '/video',
                  state: {
                    videoData: this.state.returnedVidInfo,
                    specificVideo: this.state.specificVideo
                  }
                }}></Redirect>}
              <h2 className='video-title'>{video.snippet.title}</h2>
              <img src={video.snippet.thumbnails.high.url} width='480' height='360'/>
            </div>
          ))}
        </div>
      </div>
    )
  }
}




export default Home
