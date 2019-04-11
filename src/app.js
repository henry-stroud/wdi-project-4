import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Browser, Route, Switch } from 'react-router-dom'
import Nav from './components/nav'
import Home from './components/home'


import './style.scss'

class App extends React.Component {
  constructor() {
    super()
    this.state = { }
  }

  render() {
    {this.state && console.log(this.state)}
    return (
      <Browser>
        <div>
          <Nav />
          <Switch>
            <Route exact path="/" component={Home}/>
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
