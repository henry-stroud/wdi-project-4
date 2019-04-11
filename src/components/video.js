import React, { Component } from 'react'
import axios from 'axios'
import { Redirect } from 'react-router-dom'

class Video extends Component {
  constructor() {
    super()
    this.state = {}
  }

  componentDidMount() {
    console.log(this.props.location.state)
  }


  render() {
    return (
      <div>
        {this.props.location.state.videoData &&
          <div>
            <h1>{this.props.location.state.videoData.title} </h1>
            <iframe width="560" height="315" src={`https://www.youtube.com/embed/${this.props.location.state.videoData.videoId}`} frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            <h3>View Count : {this.props.location.state.videoData.view_count.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')} </h3>
            <div>
              <p><span id='description'>Description: </span>{this.props.location.state.specificVideo.snippet.description} </p>
            </div>
            <h3 className="price"><span>Current Price :</span> ${this.props.location.state.videoData.price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')} </h3>
          </div>
        }
      </div>
    )
  }
}


export default Video
