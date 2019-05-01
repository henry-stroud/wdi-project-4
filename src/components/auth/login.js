import React from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

import Auth from '../../lib/auth'
class Login extends React.Component {
  constructor() {
    super()

    this.state = {
      data: { username: '', password: '' },
      error: ''
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)

  }

  handleChange({ target: {name, value} }) {
    const data = {...this.state.data, [name]: value}
    const error = ''
    this.setState( { data, error })

  }

  handleSubmit (e) {
    e.preventDefault()
    axios.post('api/login', this.state.data)
      .then(res => {
        Auth.setToken(res.data.token)
        this.props.history.push('/')
        console.log(res.data)
      })
      .catch(() => this.setState({ error: 'Invalid Credentials'}))
  }


  render() {
    return (
      <div className="contains-loginForm">
        <form onSubmit={this.handleSubmit} className="loginForm">
          <input className="loginFormInput"
            name="username"
            placeholder="username"
            value={this.state.data.username}
            onChange={this.handleChange}
          />
          <input className="loginFormInput"
            name="password"
            placeholder="Password"
            type="password"
            value={this.state.data.password}
            onChange={this.handleChange}
          />
          <button className="submit-login"> Log in </button>
          <div>
            <br />
            {this.state.error && <small className="tinyError">{this.state.error}</small>}
          </div>
        </form>
        <p> Not signed up? Click <Link to='/register'><span>here</span></Link> to register! </p>
      </div>
    )
  }
}

export default Login
