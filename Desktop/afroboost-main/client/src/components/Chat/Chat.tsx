// @ts-nocheck
import React, { Component } from 'react'
import Message from '../Message/Message'
import './Chat.css'
import Picker from 'emoji-picker-react'
import axios from 'axios'
import { isMobile } from 'react-device-detect'
import { BiArrowBack, BiHappy, BiImageAdd, BiSend } from 'react-icons/bi'
import { IoAttach, IoClose } from 'react-icons/io5'
import { baseURL, devURL } from '../../api'

interface IProps {
	match: any
	io: any
}

interface IState {
	meta: any
	messages: any
}

class Chat extends Component<IProps, IState> {
	actionCounter = 0
	uploadRef: any
	uploadAny: any

	constructor(props: IProps) {
		super(props)
		this.state = {
			meta: undefined,
			messages: [],
			text: '',
			chosenEmoji: null,
			isOpen: false,
			striker: false,
			emojis: [],
		}
	}

	async refresh() {
		try {
			const meta = await axios.post(
				`${baseURL}/user/metamessage`,
				{
					threadID: this.props.match.params.id,
				},
				{
					headers: {
						'X-Auth-Token': localStorage.getItem('afroboostauth'),
					},
				},
			)

			this.setState({ meta: meta.data.meta, messages: meta.data.message })
		} catch (error) {
			console.log(error)
		}
	}

	handleOnEnter(text) {
		console.log('enter', text)
	}

	onEmojiClick = async emojiObject => {
		console.log('emojiObject:::', emojiObject)
		const request = await axios.post(
			`${baseURL}/user/sendmessage`,
			{
				threadID: this.props.match.params.id,
				content: emojiObject.src,
			},
			{
				headers: {
					'X-Auth-Token': localStorage.getItem('afroboostauth'),
				},
			},
		)
		this.props.io.emit('notify', this.props.match.params.id)
		this.refresh()
	}

	onEmojiClicks = async (event, emojiObject) => {
		const request = await axios.post(
			`${baseURL}/user/sendmessage`,
			{
				threadID: this.props.match.params.id,
				content: emojiObject.emoji,
			},
			{
				headers: {
					'X-Auth-Token': localStorage.getItem('afroboostauth'),
				},
			},
		)
		this.props.io.emit('notify', this.props.match.params.id)
		this.refresh()
	}

	fetchEAvatars = async () => {
		const response = await axios.get(`${baseURL}/emojis`, {
			headers: {
				'X-Auth-Token': localStorage.getItem('afroboostauth'),
			},
		})
		if (response.status === 200) {
			this.setState({ emojis: response.data.files })
		}
	}

	componentDidMount() {
		this.refresh()

		this.fetchEAvatars()

		console.log(
			"localStorage.getItem('afroboostid')",
			localStorage.getItem('afroboostid'),
		)
		this.props.io.on('notify', info => {
			console.log(info)
			if (info.room === this.props.match.params.id) this.refresh()
		})
	}
	handleDeleteMessage = messageID => {
		this.setState(prevState => ({
			messages: prevState.messages.filter(message => message.id !== messageID),
		}))
	}

	render() {
		const avatars = this.state.emojis.map(fileName => ({
			id: fileName,
			src: `${baseURL}/imoticon/` + fileName,
		}))

		return !this.state.meta ? (
			<div></div>
		) : (
			<div className='chat'>
				<div className='topbar'>
					<a
						style={{ marginRight: 20, marginBottom: 2 }}
						href={`${devURL}/messages`}
						onClick={async () => {}}
					>
						<div className='chat__icon'>
							<BiArrowBack />
						</div>
					</a>

					<div
						className='image'
						style={{
							backgroundImage:
								`url(${baseURL}/profileImage/` + this.state.meta.user[0].id + ')',
							height: 40,
							width: 40,
							borderRadius: '50%',
							marginRight: 18,
							backgroundSize: 'cover',
							backgroundPositionX: 'center',
						}}
					/>
					<p>{this.state.meta.user[0].name}</p>
				</div>
				<div className='chatbox'>
					{this.state.messages.map((message: any, index: number) => {
						return (
							// <Message
							// 	key={message.id}
							// 	threadID={this.props.match.params.id}
							// 	messageID={message.id}
							// 	messageSenderID={message.user_id}
							// 	content={message.content}
							// />
							<Message
								key={message.id}
								threadID={this.props.match.params.id}
								messageID={message.id}
								messageSenderID={message.user_id}
								content={message.content}
								onDelete={this.handleDeleteMessage}
							/>
						)
					})}
				</div>
				<div
					className='addm'
					style={{ display: 'flex', marginTop: 20, marginBottom: 20 }}
				>
					<div className='inputchat'>
						<button
							// href='javascript:void(0)'
							className='chat__button send__icon'
							onClick={async () => {
								if (!this.chatBoxRef) return
								let boxValue = this.chatBoxRef.value
								if (boxValue.trim().length === 0) return
								this.chatBoxRef.value = ''
								const request = await axios.post(
									`${baseURL}/user/sendmessage`,
									{
										threadID: this.props.match.params.id,
										content: boxValue,
									},
									{
										headers: {
											'X-Auth-Token': localStorage.getItem('afroboostauth'),
										},
									},
								)
								this.props.io.emit('notify', this.props.match.params.id)
								this.refresh()
							}}
						>
							<div className='chat__icon'>
								<BiSend />
							</div>
						</button>
						<input
							onKeyPress={async e => {
								if (e.key === 'Enter') {
									if (!this.chatBoxRef) return
									let boxValue = this.chatBoxRef.value
									if (boxValue.trim().length === 0) return
									this.chatBoxRef.value = ''
									const request = await axios.post(
										`${baseURL}/user/sendmessage`,
										{
											threadID: this.props.match.params.id,
											content: boxValue,
										},
										{
											headers: {
												'X-Auth-Token': localStorage.getItem('afroboostauth'),
											},
										},
									)
									this.props.io.emit('notify', this.props.match.params.id)
									this.refresh()
								}
							}}
							ref={(ref: any) => (this.chatBoxRef = ref)}
							placeholder='Enter your message here'
							autoComplete='off'
							type='text'
							id='search'
						/>
					</div>

					{this.state.isOpen && (
						<div className='chat__icon' onClick={() => this.setState({ isOpen: false })}>
							<IoClose />
						</div>
					)}
					{this.state.isOpen === false && (
						<span className='striker'>
							<img
								src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAAAXNSR0IArs4c6QAAAAlwSFlzAAAOxAAADsQBlSsOGwAABHJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0n77u/JyBpZD0nVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkJz8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0nYWRvYmU6bnM6bWV0YS8nPgo8cmRmOlJERiB4bWxuczpyZGY9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMnPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6QXR0cmliPSdodHRwOi8vbnMuYXR0cmlidXRpb24uY29tL2Fkcy8xLjAvJz4KICA8QXR0cmliOkFkcz4KICAgPHJkZjpTZXE+CiAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9J1Jlc291cmNlJz4KICAgICA8QXR0cmliOkNyZWF0ZWQ+MjAyMS0xMC0xMjwvQXR0cmliOkNyZWF0ZWQ+CiAgICAgPEF0dHJpYjpFeHRJZD43Mzc2NWU4NC1mZGM5LTQ5ZGUtOWI1Ni03NGUyMjAzODJkZmI8L0F0dHJpYjpFeHRJZD4KICAgICA8QXR0cmliOkZiSWQ+NTI1MjY1OTE0MTc5NTgwPC9BdHRyaWI6RmJJZD4KICAgICA8QXR0cmliOlRvdWNoVHlwZT4yPC9BdHRyaWI6VG91Y2hUeXBlPgogICAgPC9yZGY6bGk+CiAgIDwvcmRmOlNlcT4KICA8L0F0dHJpYjpBZHM+CiA8L3JkZjpEZXNjcmlwdGlvbj4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0nJwogIHhtbG5zOmRjPSdodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyc+CiAgPGRjOnRpdGxlPgogICA8cmRmOkFsdD4KICAgIDxyZGY6bGkgeG1sOmxhbmc9J3gtZGVmYXVsdCc+bG9nbyBhZnJvYm9vc3Qgbm9pcjwvcmRmOmxpPgogICA8L3JkZjpBbHQ+CiAgPC9kYzp0aXRsZT4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxy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'
								onClick={() => this.setState({ isOpen: true, striker: false })}
								style={{ width: '100% ', height: '100%' }}
								alt=''
							/>
						</span>
					)}
					{this.state.striker === false && (
						<div
							className='chat__icon'
							onClick={() => this.setState({ striker: true, isOpen: false })}
						>
							<BiHappy />
						</div>
					)}
					{this.state.striker && (
						<div className='chat__icon' onClick={() => this.setState({ striker: false })}>
							<IoClose />
						</div>
					)}
					<button
						className='chat__button'
						onClick={() => {
							this.uploadRef.click()
						}}
					>
						<div className='chat__icon'>
							<BiImageAdd />
						</div>
					</button>
					<button
						className='chat__button'
						onClick={() => {
							this.uploadAny.click()
						}}
					>
						<div className='chat__icon'>
							<IoAttach />
						</div>
					</button>
					<input
						onChange={async (event: any) => {
							const data = new FormData()
							data.append('uploadedFile', event.target.files[0])
							data.append('threadID', this.props.match.params.id)
							this.setState({
								messages: [
									{
										messageSenderID: localStorage.getItem('afroboostid'),
										content: 'Uploading... (50%)',
									},
									...this.state.messages,
								],
							})
							const request = await axios.post(`${baseURL}/user/sendfilemessage`, data, {
								headers: {
									'X-Auth-Token': localStorage.getItem('afroboostauth'),
								},
							})
							this.props.io.emit('notify', this.props.match.params.id)

							this.setState({
								messages: [
									{
										user_id: localStorage.getItem('afroboostid'),
										content: 'Uploading... (80%)',
									},
									...this.state.messages,
								],
							})
							this.refresh()
						}}
						type='file'
						accept='image/x-png,image/gif,image/jpeg'
						ref={ref => (this.uploadRef = ref)}
						style={{ display: 'none' }}
					/>
					<input
						onChange={async (event: any) => {
							const data = new FormData()
							data.append('uploadedFile', event.target.files[0])
							data.append('threadID', this.props.match.params.id)
							this.setState({
								messages: [
									{
										messageSenderID: localStorage.getItem('afroboostid'),
										content: 'Uploading... (50%)',
									},
									...this.state.messages,
								],
							})
							const request = await axios.post(`${baseURL}/user/sendfilemessage`, data, {
								headers: {
									'X-Auth-Token': localStorage.getItem('afroboostauth'),
								},
							})
							this.props.io.emit('notify', this.props.match.params.id)
							this.setState({
								messages: [
									{
										user_id: localStorage.getItem('afroboostid'),
										content: 'Uploading... (70%)',
									},
									...this.state.messages,
								],
							})
							this.refresh()
						}}
						type='file'
						ref={ref => (this.uploadAny = ref)}
						style={{ display: 'none' }}
					/>
				</div>
				{this.state.isOpen && (
					<div className={isMobile ? 'emojiMobile' : 'emojiPicker'}>
						{avatars.map((avatar, index) => {
							return (
								<div key={index}>
									<img
										width={'190px'}
										height={'auto'}
										src={avatar.src}
										alt={'img'}
										onClick={e => this.onEmojiClick(avatar)}
									/>
								</div>
							)
						})}
					</div>
				)}
				{this.state.striker && (
					<Picker
						onEmojiClick={this.onEmojiClicks}
						pickerStyle={{ width: '100%', background: '#664174' }}
					/>
				)}
			</div>
		)
	}
}

export default Chat
