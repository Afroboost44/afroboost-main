// @ts-nocheck
import React from 'react'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import Dashboard from './components/Dashboard/Dashboard'

import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import './App.css'
import { ThemeProvider } from '@material-ui/core'
import { io } from 'socket.io-client'
import { createMuiTheme } from '@material-ui/core/styles'
import axios from 'axios'
import English from './english'
import France from './france'
import Germany from './germany'
import Spain from './spain'
import { baseURL } from './api'
import DownloadAppPrompt from './components/DownloadApp'

interface IState {
	loggedIn: boolean
	mode: string
	enteredEmail: string
	enteredPassword: string
}

const l = {
	en: English,
	fr: France,
	ge: Germany,
	sp: Spain,
}
class App extends React.Component<{}, IState> {
	io: any
	constructor(props: any) {
		super(props)
		this.state = {
			loggedIn: true,
			mode: 'none',
			enteredEmail: '',
			enteredPassword: '',
		}
		if (!localStorage.getItem('afroboostauth')) {
			localStorage.setItem('afroboostauth', 'guest')
			localStorage.setItem('afroboostname', 'Not logged in')
			localStorage.setItem('afroboostusername', '#')
			localStorage.setItem('afroboostid', '-1')
		}
		if (!localStorage.getItem('language')) localStorage.setItem('language', 'en')
		if (localStorage.getItem('afroboostauth') !== 'guest') {
			this.io = io(`${baseURL}`, {
				auth: {
					token: localStorage.getItem('afroboostauth'),
				},
			})

			this.io.on('notification', (notificationText, referenceLink) => {
				this.props.addToastFunc(notificationText, referenceLink)
			})
		} else this.io = undefined
	}
	render() {
		const path = window.location.pathname
		return (
			<ThemeProvider
				theme={createMuiTheme({
					palette: {
						type: 'dark',
						primary: {
							// Purple and green play nicely together.
							main: '#ad51c9',
						},
						secondary: {
							// This is green.A700 as hex.
							main: '#fff',
						},
					},
					typography: {
						fontFamily: [
							'Montserrat',
							'-apple-system',
							'BlinkMacSystemFont',
							'"Segoe UI"',
							'Roboto',
							'"Helvetica Neue"',
							'Arial',
							'sans-serif',
							'"Apple Color Emoji"',
							'"Segoe UI Emoji"',
							'"Segoe UI Symbol"',
						].join(','),
					},
				})}
			>
				<Router>
					{/* <Auth0Test /> */}
					{path.split('/')[1] !== 'forgot-password' && <Header io={this.io} />}
					<div className='container'>
						{path.split('/')[1] !== 'forgot-password' && <Sidebar io={this.io} />}
						<Dashboard io={this.io} />
						{/* <DownloadAppPrompt /> */}
					</div>
				</Router>
			</ThemeProvider>
		)
	}
}

export default App
