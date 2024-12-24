// @ts-nocheck
import React, { Component } from 'react'
import './Messages.css'
// import {
//   NavigateOutline,
//   Mail,
//   Navigate,
//   PeopleCircleOutline,
//   PeopleCircle,
//   PaperPlaneOutline,
// } from "react-ionicons";
import Spectrum from '../Spectrum/Spectrum'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import axios from 'axios'
import English from '../../english'
import France from '../../france'
import Germany from '../../germany'
import Spain from '../../spain'
import {
	IoNavigate,
	IoNavigateOutline,
	IoPaperPlaneOutline,
	IoPeopleCircle,
	IoPeopleCircleOutline,
} from 'react-icons/io5'
import { baseURL, devURL } from '../../api'

const l = {
	en: English,
	fr: France,
	ge: Germany,
	sp: Spain,
}
interface IProps {
	io: any
}

interface IState {
	conversations: any[]
}

class Messages extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props)
		this.state = {
			conversations: [],
			allIDs: [],
			recievers: [],
			onlineStatus: [],
			message: '',
			mode: 'none',
			index: 0,
			allSelected: false,
		}
	}

	async refresh() {
		const request = await axios.get(`${baseURL}/post/members`, {
			headers: {
				'X-Auth-Token': localStorage.getItem('afroboostauth'),
			},
		})
		this.setState({
			conversations: request.data.users,
			onlineStatus: request.data.message,
		})
		for (let i = 0; i < this.state.conversations.length; i++) {
			this.setState({
				allIDs: [...this.state.allIDs, this.state.conversations[i].id],
			})
		}
	}
	async sendMessageToAll() {
		for (let i = 0; i < this.state.recievers.length; i++) {
			let goMessage = await axios.post(
				`${baseURL}/user/gomessage`,
				{
					targetID: this.state.recievers[i],
				},
				{
					headers: {
						'X-Auth-Token': localStorage.getItem('afroboostauth'),
					},
				},
			)
			await axios.post(
				`${baseURL}/user/sendmessage`,
				{
					threadID: goMessage.data.message,
					content: this.state.message,
				},
				{
					headers: {
						'X-Auth-Token': localStorage.getItem('afroboostauth'),
					},
				},
			)
		}
	}
	async componentDidMount() {
		this.refresh()
	}

	render() {
		return (
			<div className='messages'>
				<Dialog
					keepMounted
					open={this.state.mode == 'sendMessage'}
					onClose={() => this.setState({ mode: 'none' })}
					aria-labelledby='form-dialog-title'
				>
					<DialogTitle>Send message to users</DialogTitle>
					<DialogContent>
						<DialogContentText>Enter your message here:</DialogContentText>
						<TextField
							autoFocus
							margin='dense'
							onChange={event => {
								this.setState({ message: event.target.value })
							}}
							value={this.state.message}
							id='messageAll'
							type='text'
							multiline={true}
							fullWidth
						/>
					</DialogContent>
					<DialogActions>
						<Button color='primary' onClick={() => this.setState({ mode: 'none' })}>
							Cancel
						</Button>
						<Button
							color='primary'
							onClick={() => {
								this.sendMessageToAll()
								this.setState({ mode: 'none' })
								alert('Your message has been sent successfully!')
							}}
						>
							Send
						</Button>
					</DialogActions>
				</Dialog>
				<div className='member-header'>
					<h2 className='page-title' style={{ marginTop: 16 }}>
						<Spectrum />
						&nbsp;&nbsp;Members
					</h2>
					<span
						style={{
							alignItems: 'center',
							display: 'flex',
							flexDirection: 'row',
						}}
					>
						<span
							style={{
								alignItems: 'center',
								display: 'flex',
								flexDirection: 'row',
								marginRight: 15,
							}}
						>
							<p style={{ color: 'white', fontFamily: 'Montserrat' }}>Select all</p>
							{!this.state.allSelected ? (
								<buttom
									onClick={() => {
										this.setState({
											recievers: this.state.allIDs,
											allSelected: !this.state.allSelected,
										})
										this.forceUpdate()
									}}
									style={{ padding: 10 }}
									className='message__button'
								>
									<div className='message__icon'>
										<IoPeopleCircleOutline />
									</div>
									{/* // <PeopleCircleOutline
                  //   color={"purple"}
                  //   height="35px"
                  //   width="35px"
                  // /> */}
								</buttom>
							) : (
								<button
									onClick={() => {
										this.setState({
											allSelected: !this.state.allSelected,
											recievers: [],
										})
										this.forceUpdate()
									}}
									style={{ padding: 10 }}
									className='message__button'
								>
									<div className='message__icon'>
										<IoPeopleCircle />
									</div>
									{/* <PeopleCircle color={"purple"} height="35px" width="35px" /> */}
								</button>
							)}
						</span>
						<span
							style={{
								alignItems: 'center',
								display: 'flex',
								flexDirection: 'row',
							}}
						>
							<p style={{ color: 'white', fontFamily: 'Montserrat' }}>Send message</p>
							<button
								onClick={() => this.setState({ mode: 'sendMessage' })}
								style={{ padding: 10 }}
								className='message__button'
							>
								<div className='message__icon'>
									<IoPaperPlaneOutline />
								</div>
								{/* <PaperPlaneOutline
                  color={"purple"}
                  height="30px"
                  width="30px"
                /> */}
							</button>
						</span>
					</span>
				</div>
				<div style={{ display: 'flex', flexDirection: 'column-reverse' }}>
					{this.state.conversations.map((conversation, index) => {
						if (!conversation.username) return
						return (
							<a key={conversation.id}>
								<div className='thread' style={{ justifyContent: 'space-between' }}>
									<a
										style={{
											display: 'flex',
											flexDirection: 'row',
											alignItems: 'center',
											color: 'white',
										}}
										href={`${devURL}/profile/` + conversation.username}
									>
										<div
											className='image'
											style={{
												backgroundImage:
													`url(${baseURL}/profileImage/` + conversation.id + ')',
												height: 40,
												width: 40,
												borderRadius: '50%',
												marginRight: 18,
												backgroundSize: 'cover',
												backgroundPositionX: 'center',
											}}
										/>
										<div className='metathread'>
											<p style={{ fontWeight: 'bold', marginBottom: 0 }}>
												{conversation.name.includes('@') ||
												conversation.name.includes('.')
													? conversation.name.split(/[@.]/)[0]
													: conversation.name}
											</p>
											<p style={{ marginTop: 4 }}>{conversation.username}</p>
										</div>
									</a>
									<div
										style={{
											marginRight: 10,
											display: 'flex',
											flexDirection: 'row',
											alignItems: 'center',
										}}
									>
										<p style={{ marginRight: 10 }}>
											{new Date(conversation.date_joined).toLocaleDateString()}
										</p>
										{!this.state.recievers.includes(conversation.id) ? (
											<button
												onClick={() => {
													this.state.recievers.push(conversation.id)
													this.forceUpdate()
												}}
												style={{ padding: 20 }}
												className='message__button'
											>
												<div className='message__icon'>
													<IoNavigateOutline />
												</div>
												{/* <NavigateOutline
                          color={"purple"}
                          height="30px"
                          width="30px"
                        /> */}
											</button>
										) : (
											<button
												onClick={() => {
													this.state.recievers.splice(
														this.state.recievers.indexOf(conversation.id),
														1,
													)
													this.forceUpdate()
												}}
												style={{ padding: 20 }}
												className='message__button'
											>
												<div className='message__icon'>
													<IoNavigate />
												</div>
												{/* <Navigate color={"purple"} height="30px" width="30px" /> */}
											</button>
										)}
										{this.state.onlineStatus[index] ? (
											<div
												style={{
													height: '20px',
													width: '20px',
													borderRadius: '100%',
													backgroundColor: 'purple',
													display: 'flex',
												}}
											></div>
										) : (
											<div
												style={{
													height: '20px',
													width: '20px',
													borderRadius: '100%',
													backgroundColor: 'gray',
													display: 'flex',
												}}
											></div>
										)}
									</div>
								</div>
							</a>
						)
					})}
				</div>
			</div>
		)
	}
}

export default Messages
