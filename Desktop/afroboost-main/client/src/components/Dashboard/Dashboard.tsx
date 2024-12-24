// @ts-nocheck
import React from 'react'
import Spectrum from '../Spectrum/Spectrum'
import Post from '../Post/Post'
import Homepage from '../Homepage/Homepage'
import Members from '../Members/Messages'
import Live from '../Live/Live'
import LivePost from '../LivePost/LivePost'
import Demo from '../Demo/Demo'
import Profile from '../Profile/Profile'
import Messages from '../Messages/Messages'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import 'react-dropdown/style.css'
import './Dashboard.css'
import Transfer from '../Transfer/Transfer'
import Library from '../Library/Library'
import Liked from '../Liked/Liked'
import Chat from '../Chat/Chat'
import Contact from '../Contact/Contact'
import AboutUs from '../AboutUs/AboutUs'
import ResetPassword from '../ResetPassword/Reset'
import ForgotPassword from '../ResetPassword/ForgotPassword'
import AdminPage from '../AdminPage/AdminPage'
import Subcriptions from '../Subscriptions/Subscriptions'
import axios from 'axios'
import { baseURL } from '../../api'
import Scan from '../QRCodeScanner/Scan'
import ResetQRscan from '../QRCodeScanner/Resetqrscan'

interface IProps {
	io: any
}

class Dashboard extends React.Component<IProps, {}> {
	constructor(props: any) {
		super(props)
		this.state = {
			postID: undefined,
		}
		if (localStorage.getItem('afroboostauth') !== 'guest')
			this.props.io.emit('connect to notifications')
	}

	async getPostID() {
		try {
			const id = await axios.get(`${baseURL}/post/getAboutUsPost`, {
				headers: {
					'X-Auth-Token': localStorage.getItem('afroboostauth'),
				},
			})
			this.setState({ postID: id.data.message })
			//return id.data.message;
		} catch (error) {
			console.log(error)
		}
	}
	componentDidMount() {
		this.getPostID()
	}
	render() {
		return (
			<div className='dashboard'>
				{localStorage.getItem('afroboostauth') !== 'guest' ? (
					<Switch>
						<Route
							path='/live/:id'
							component={props => <LivePost match={props.match} io={this.props.io} />}
						/>
						<Route
							path='/chat/:id'
							render={props => <Chat {...props} io={this.props.io} />}
						/>
						<Route
							path='/messages'
							render={props => <Messages {...props} io={this.props.io} />}
						/>
						<Route path='/library'>
							<Library />
						</Route>
						<Route path='/subscriptions/:postId'>
							<Subcriptions />
						</Route>
						<Route path='/live'>
							<Live />
						</Route>
						<Route path='/members'>
							<Members />
						</Route>
						<Route path='/aboutus'>
							<AboutUs />
							{/* {this.state.postID ? (
								<Post
									match={{
										params: {
											id: this.state.postID,
										},
									}}
								/>
							) : (
								<div></div>
							)} */}
						</Route>

						<Route path='/contact'>
							<Contact />
						</Route>

						<Route path='/liked'>
							<Liked />
						</Route>
						<Route path='/transfer'>
							<Transfer />
						</Route>
						<Route path='/scan'>
							<Scan />
						</Route>
						<Route path='/resetscan'>
							<ResetQRscan />
						</Route>
						<Route path='/post/:id' component={Post} />
						<Route path='/profile/:username' component={Profile} />
						{localStorage.getItem('afroboostid') === '4' ? (
							<Route path='/admin'>
								<AdminPage />
							</Route>
						) : null}
						<Route path={['/', '/home']}>
							<Homepage />
						</Route>
					</Switch>
				) : (
					<Switch>
						<Route path='/aboutus'>
							<AboutUs />
						</Route>
						<Route path='/reset'>
							<ResetPassword />
						</Route>
						<Route path='/forgot-password/:id'>
							<ForgotPassword />
						</Route>
						<Route path='/contact'>
							<Contact />
						</Route>
						<Route path={['/home']}>
							<Homepage />
						</Route>
						<Route path='/post/:id' component={Post} />
						<Route path='/'>
							<Demo />
						</Route>
					</Switch>
				)}
			</div>
		)
	}
}

export default Dashboard
