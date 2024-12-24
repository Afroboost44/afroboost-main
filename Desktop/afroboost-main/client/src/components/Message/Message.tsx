// @ts-nocheck
import React, { Component } from 'react'
import './Message.css'
import { baseURL } from '../../api'
import axios from 'axios'
import { RiDeleteBin5Line } from 'react-icons/ri'

interface IProps {
	messageID: number
	messageSenderID: number
	threadID: number
	content: string
	onDelete: (messageID: number) => void // Add a callback prop for delete
}

interface IState {
	isHovered: boolean
}

class Message extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props)
		this.state = { isHovered: false }
		console.log('Message Sender ID: ' + this.props.messageSenderID)
		console.log('User LoginID: ' + localStorage.getItem('afroboostid'))
	}

	handleDelete = async () => {
		try {
			await axios.delete(`${baseURL}/api/v2/delete-message/${this.props.messageID}`)
			this.props.onDelete(this.props.messageID) // Call the onDelete callback after successful deletion
		} catch (error) {
			console.error('Error deleting user:', error)
		}
		console.log(this.props.messageID)
	}

	handleMouseEnter = () => {
		this.setState({ isHovered: true })
	}

	handleMouseLeave = () => {
		this.setState({ isHovered: false })
	}

	render() {
		const { content, messageSenderID } = this.props
		const { isHovered } = this.state
		const userLoginID = parseInt(localStorage.getItem('afroboostid'), 10) // Ensure both IDs are numbers

		const renderContent = () => {
			if (content) {
				const parts = content.split('|')
				if (parts.length === 1) {
					if (content.includes('/imoticon')) {
						return (
							<img
								height='auto'
								style={{ borderRadius: 24, maxWidth: 300 }}
								src={content}
								alt=''
							/>
						)
					} else {
						return content
					}
				} else if (parts[0] === '[img]') {
					return (
						<a
							href={`${baseURL}/messagefile/${localStorage.getItem('afroboostauth')}/${
								parts[1]
							}`}
						>
							<img
								height='auto'
								style={{ borderRadius: 24, maxWidth: 300 }}
								src={`${baseURL}/messagefile/${localStorage.getItem('afroboostauth')}/${
									parts[1]
								}`}
								alt=''
							/>
						</a>
					)
				} else {
					return (
						<a
							style={{ color: 'white' }}
							href={`${baseURL}/messagefile/${localStorage.getItem('afroboostauth')}/${
								parts[1]
							}`}
						>
							View uploaded file: {parts[1]}
						</a>
					)
				}
			}
			return null
		}

		return messageSenderID === userLoginID ? (
			<div
				className='message'
				onMouseEnter={this.handleMouseEnter}
				onMouseLeave={this.handleMouseLeave}
				style={{
					position: 'relative',
					alignSelf: 'flex-end',
				}}
			>
				{renderContent()}
				<button
					onClick={this.handleDelete}
					style={{
						position: 'absolute',
						top: '5px',
						right: '5px',
						background: 'transparent',
						border: 'none',
						color: 'white',
						cursor: 'pointer',
						opacity: isHovered ? 1 : 0, // Show button only on hover
						transition: 'opacity 0.3s ease', // Smooth transition
					}}
				>
					<RiDeleteBin5Line className='delete_message_btn' />
				</button>
			</div>
		) : (
			<div
				style={{
					alignSelf: 'flex-start',
				}}
				className='message-other'
			>
				{renderContent()}
			</div>
		)
	}
}

export default Message
