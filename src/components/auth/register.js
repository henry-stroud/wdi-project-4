import React from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

class Register extends React.Component {
  constructor() {
    super()

    this.state = {
      data: {
        username: '',
        email: '',
        password: '',
        password_confirmation: ''
      },

      errors: {}
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleClick = this.handleClick.bind(this)

  }

  handleChange({ target: {name, value} }) {
    const data = {...this.state.data, [name]: value}
    this.setState( { data }, () => {
      console.log(this.state)
      const errors = {...this.state.errors, [name]: ''}
      this.setState({ data, errors })
    } )

  }

  handleSubmit (e) {
    e.preventDefault()
    axios.post('api/register', this.state.data)
      .then(res => {
        this.props.history.push('/login')
        console.log(res.data)
      })
      .catch(err => this.setState({ errors: err.response.data }, () => console.log(this.state.errors)))
  }

  handleClick (e) {
    e.target.value = ''
  }

  render() {
    return (
      <div className="contains-registerForm">
        <form onSubmit={this.handleSubmit} className="registerForm">
          <input className={`registerInput ${this.state.errors.email ? 'error': ''}`}
            name="email"
            placeholder="email"
            value={`${this.state.errors.email ? `${this.state.errors.email[0]}`: `${this.state.data.email}`}`}
            onChange={this.handleChange}
            onClick={this.handleClick}
          />
          <input className={`registerInput ${this.state.errors.username ? 'error': ''}`}
            name="username"
            placeholder="username"
            value={`${this.state.errors.username ? `${this.state.errors.username[0]}`: `${this.state.data.username}`}`}
            onChange={this.handleChange}
            onClick={this.handleClick}
          />
          <input className={`registerInput ${this.state.errors.password ? 'error': ''}`}
            name="password"
            placeholder="Password"
            value={`${this.state.errors.password ? `${this.state.errors.password[0]}`: `${this.state.data.password}`}`}
            onChange={this.handleChange}
            type={`${this.state.errors.password ? 'text': 'password'}`}
            onClick={this.handleClick}
          />
          <input className={`registerInput ${this.state.errors.password_confirmation ? 'error': ''}`}
            name="password_confirmation"
            placeholder="repeat password"
            value={`${this.state.errors.password_confirmation ? `password ${this.state.errors.password_confirmation[0]}`: `${this.state.data.password_confirmation}`}`}
            onChange={this.handleChange}
            type={`${this.state.errors.password_confirmation ? 'text': 'password'}`}
            onClick={this.handleClick}
          />
          <button className="submit-login"> Register </button>
        </form>
        <p> Already signed up? Click <Link to='/login'><span>here</span></Link> to log in! </p>
      </div>
    )
  }
}





export default Register
