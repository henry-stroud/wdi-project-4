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
      .then((res) => this.setState({userProfile: res.data}, () => console.log(this.state.userProfile)))
      .catch((err) => console.log(err))
  }

  render() {
    return (
      <div>
        {this.state.userProfile &&
        <div>
          <h1>Cash Balance: <span className="price">${this.state.userProfile.balance.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span></h1>
          <h2>Video Portfolio:</h2>
          {this.state.userProfile.owned_videos.length &&
            this.state.userProfile.owned_videos.map((video, i) => (
              <div key={i}>
              
              </div>
            ))
          }
        </div>
        }
      </div>
    )
  }
}



export default Portfolio
