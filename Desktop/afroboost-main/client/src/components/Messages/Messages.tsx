// @ts-nocheck
import React, { Component } from 'react'
import './Messages.css'
import Spectrum from '../Spectrum/Spectrum'
import axios from 'axios'
import English from '../../english'
import France from '../../france'
import Germany from '../../germany'
import Spain from '../../spain'
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
		}
	}

	async refresh() {
		const request = await axios.post(
			`${baseURL}/user/listmessages`,
			{},
			{
				headers: {
					'X-Auth-Token': localStorage.getItem('afroboostauth'),
				},
			},
		)
		this.setState({ conversations: request.data.message })
	}

	async componentDidMount() {
		this.refresh()
		this.props.io.on('notify', () => {
			this.refresh()
		})
	}

	render() {
		return (
			<div className='messages'>
				<h2 className='page-title' style={{ marginTop: 16 }}>
					<Spectrum />
					&nbsp;&nbsp;Messages
				</h2>
				{this.state.conversations.map((conversation, index) => {
					console.log('oh pai aaah check kr' + conversation.toString())
					if (conversation.thread_a === conversation.thread_b || !conversation.user)
						return null
					return (
						<a key={conversation.id} href={`${devURL}/chat/${conversation.id}`}>
							<div className='thread'>
								<img
									className='image'
									src={`${baseURL}/profileImage/${conversation.user.id}`}
									alt={`User ${conversation.user.id} Profile`}
									style={{
										height: 40,
										width: 40,
										borderRadius: '50%',
										marginRight: 18,
										objectFit: 'cover', // Maintain aspect ratio and cover the container
									}}
								/>
								<div className='metathread'>
									<p style={{ fontWeight: 'bold', marginBottom: 0 }}>
										{conversation.user.name}
									</p>
									<p style={{ marginTop: 4 }}>{conversation.lastMessage}</p>
								</div>
							</div>
						</a>
					)
				})}
			</div>
		)
	}
}

export default Messages
