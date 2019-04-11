import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Browser, Route, Switch } from 'react-router-dom'
import Nav from './components/nav'
import Home from './components/home'
import Video from './components/video'
import Register from './components/auth/register'
import Login from './components/auth/login'


import './style.scss'

class App extends React.Component {
  constructor() {
    super()
    this.state = { }
  }

  render() {
    return (
      <Browser>
        <div>
          <Nav />
          <Switch>
            <Route exact path="/" component={Home}/>
            <Route path="/video" component={Video}/>
            <Route path="/register" component={Register}/>
            <Route path="/login" component={Login}/>
          </Switch>
        </div>
      </Browser>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
)
