// @ts-nocheck
import React from 'react'
import './LivePost.css'
import Spectrum from '../Spectrum/Spectrum'
import IndigoPlayer from 'indigo-player'
import ReactAudioPlayer from 'react-audio-player'
import Afrolive from '../Afrolive/Afrolive'
import FlatList from 'flatlist-react'
import AudioSpectrum from 'react-audio-spectrum'

// Bundle the css file too, or provide your own.
import 'indigo-player/lib/indigo-theme.css'
// import {
// 	Heart,
// 	HeartOutline,
// 	TimerOutline,
// 	ArrowBackOutline,
// 	EyeOutline,
// 	EyeOffOutline,
// 	TrashOutline,
// 	BrushOutline,
// 	Pause,
// 	Mail,
// 	FlameOutline,
// 	PlayForwardOutline,
// 	PlayForward,
// 	CartOutline,
// 	MusicalNotesOutline,
// 	ShareSocial,
// 	Bookmark,
// 	Radio,
// 	ChatbubblesOutline,
// 	VideocamOutline,
// 	ImageOutline,
// 	PricetagsOutline,
// 	ReturnUpBackOutline,
// 	ChevronForwardCircleOutline,
// } from 'react-ionicons'
import axios from 'axios'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import Dropdown from 'react-dropdown'
import DialogTitle from '@material-ui/core/DialogTitle'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import DatePicker from 'react-datepicker'
import Fillheart from './Lotties/EmptyHeart'

import Slide from '@material-ui/core/Slide'

import English from '../../english'
import France from '../../france'
import Germany from '../../germany'
import Spain from '../../spain'
import progress1 from './progress1.png'
import progress2 from './progress2.png'
import progress3 from './progress3.png'
import progress4 from './progress4.png'
import pause from './pause.png'
import {
	IoArrowBackOutline,
	IoHeartOutline,
	IoRemoveCircle,
	IoRemoveCircleOutline,
	IoRemoveSharp,
} from 'react-icons/io5'
import { BiCross, BiHeart, BiPauseCircle } from 'react-icons/bi'
import { baseURL, devURL } from '../../api'
import { BsEyeFill, BsHeartFill } from 'react-icons/bs'
import { MdCall, MdRemove } from 'react-icons/md'
import Recording from './ScreenRecorder'
const l = {
	en: English,
	fr: France,
	ge: Germany,
	sp: Spain,
}

const Transition = React.forwardRef(function Transition(
	props: TransitionProps & { children?: React.ReactElement<any, any> },
	ref: React.Ref<unknown>,
) {
	return <Slide direction='up' ref={ref} {...props} />
})

class LivePost extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			liveList: [],

			contentType: 'paused',
			playing: 'nothing',
			mode: 'none',
			editTitle: 'New stream name',
			editDescription: '',
			description: '',
			progress: progress1,
			inputPrice: '0.00',
			innerMode: 'content',
			streamId: '',
			streamName: '',
			streamDescription: '',
			streamPrice: '0.00',
			streamAuthor: '',
			liveDetails: true,
		}
		console.log(this.props.match)

		this.liveID = this.props.match.params.id
		this.streamId = this.liveID
		this.io = this.props.io
		console.log(this.liveID)
		this.reactap = React.createRef()
		this.vp = React.createRef()
	}

	async getAllLives() {
		let request = await axios.get(`${baseURL}/post/live`, {
			headers: {
				'X-Auth-Token': localStorage.getItem('afroboostauth'),
			},
		})
		console.log(request)
		if (request.status === 200) {
			this.setState({ liveList: request.data.lives })
		}
	}
	async refetchLive() {
		this.live = await axios.get(`${baseURL}/post/live/${this.liveID}`, {
			headers: {
				'X-Auth-Token': localStorage.getItem('afroboostauth'),
			},
		})

		console.log('Stream details')
		console.log(this.live)
		this.setState({
			poster: this.live.data.sql.poster_id,
			streamId: this.live.data.sql.id,
			streamName: this.live.data.sql.title,
			streamDescription: this.live.data.sql.description,
			streamPrice: this.live.data.sql.price,
			streamAuthor: this.live.data.sql.poster_id,
		})
		this.setState({ title: this.live.data.sql.title })
		if (!this.live.data.paid)
			return this.setState({
				likes: this.live.data.likes,
				liked: this.live.data.liked,
				contentType: 'paused',
				mode: 'no-ticket',
				price: this.live.data.sql.price,
				watching: 0,
				description: this.live.data.sql.description,
				editDescription: this.live.data.sql.description,
				editGPS: this.live.data.sql.gps,
			})
		console.log(this.live)
		this.io.emit('join live', this.liveID)
		// mujtaba
		if (this.live.data.js)
			return this.setState({
				likes: this.live.data.likes,
				liked: this.live.data.liked,
				contentType: 'paused',
				poster: this.live.data.sql.poster_id,
				watching: 0,
				editGPS: this.live.data.sql.gps,
			})

		console.log('Dubuger ultra pro max')
		console.log(this.live.data.sql.poster_id)
		let extension = this.live.data.js.playing.spldt('.').pop()
		let filetype = undefined
		if (['jpg', 'png', 'jpeg'].includes(extension.toLowerCase())) filetype = 'image'
		if (['mp4', 'mov', 'flv'].includes(extension.toLowerCase())) filetype = 'video'
		if (['mp3', 'ogg', 'wav'].includes(extension.toLowerCase())) filetype = 'audio'
		if (this.live.data.js.snapshot) filetype = 'paused'
		this.setState({
			likes: this.live.data.likes,
			liked: this.live.data.liked,
			contentType: filetype,
			media: this.live.data.js.playing,
			poster: this.live.data.sql.poster_id,
			watching: this.live.data.js.watching.length,
			description: this.live.data.sql.description,
			editDescription: this.live.data.sql.description,
			editGPS: this.live.data.sql.gps,
		})

		if (filetype === 'audio') {
			this.io.emit('request sync', this.liveID)
		}
	}

	componentWillUnmount() {
		this.io.emit('left live', this.liveID)
	}

	componentDidMount() {
		this.refetchLive()
		this.getAllLives()
		this.io.on('client sync', time => {
			if (this.reactap.current) {
				console.log(time)
				this.reactap.current.audioEl.current.currentTime = time
			}
		})
		this.io.on('client request sync', () => {
			if (this.reactap.current) {
				console.log('ASYNC', this.reactap.current.audioEl.current.currentTime)
				this.io.emit(
					'sync',
					this.reactap.current.audioEl.current.currentTime,
					this.liveID,
				)
			}
		})
		this.io.on('playing', (mediaType, media, watching) => {
			console.log(mediaType, media)
			switch (mediaType) {
				case 'video': {
					break
				}
				case 'audio': {
					break
				}
				case 'image': {
					break
				}
				default:
					break
			}
			this.setState({
				contentType: mediaType,
				media: media,
				watching: watching,
			})
		})
		this.io.on('paused', () => {
			this.afroboostPlayer = undefined
			this.setState({ contentType: 'paused' })
		})
		switch (this.state.contentType) {
			case 'video': {
				break
			}
			case 'audio': {
				break
			}
			case 'image': {
				break
			}
			default:
				break
		}
	}

	removeLiveDetails = () => {
		this.setState({ liveDetails: false })
	}

	render() {
		return (
			<div className='live-page'>
				<Dialog
					keepMounted
					TransitionComponent={Transition}
					open={this.state.mode === 'nomoney'}
					aria-labelledby='form-dialog-title'
				>
					<DialogTitle id='form-dialog-title'>Insufficent funds</DialogTitle>
					<DialogContent>
						<DialogContentText id='alert-dialog-slide-description'>
							Please deposit money to your account by visiting the 'Transfer' page or try
							again later.
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button
							onClick={async () => {
								this.setState({ mode: 'no-ticket' })
							}}
							color='primary'
						>
							Cancel
						</Button>
						<Button
							onClick={() => {
								window.location.href = `${devURL}/transfer`
							}}
							color='primary'
						>
							Deposit now
						</Button>
					</DialogActions>
				</Dialog>
				<Dialog
					open={this.state.mode === 'no-ticket'}
					TransitionComponent={Transition}
					keepMounted
					onClose={() => {
						this.setState({ mode: 'none' })
					}}
					aria-labelledby='alert-dialog-slide-title'
					aria-describedby='alert-dialog-slide-description'
				>
					<DialogTitle id='alert-dialog-slide-title'>Not subscribed</DialogTitle>
					<DialogContent>
						<DialogContentText id='alert-dialog-slide-description'>
							You are not subscribed to this event. Buy a single ticket for CHF{' '}
							{this.state.price}?
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button
							onClick={() => {
								window.location.href = '/live'
							}}
							color='primary'
						>
							Cancel
						</Button>

						<Button
							onClick={async () => {
								try {
									const request = await axios.post(
										`${baseURL}/post/live/buy`,
										{
											id: this.liveID,
										},
										{
											headers: {
												'X-Auth-Token': localStorage.getItem('afroboostauth'),
											},
										},
									)
									console.log(request)
									window.location.reload()
								} catch (error) {
									console.log(error)
									this.setState({ mode: 'nomoney' })
								}
							}}
							color='primary'
						>
							Buy now
						</Button>
					</DialogActions>
				</Dialog>
				<Dialog
					keepMounted
					TransitionComponent={Transition}
					open={this.state.mode === 'datesetter'}
					aria-labelledby='form-dialog-title'
				>
					<DialogTitle id='form-dialog-title'>
						{l[localStorage.getItem('language')]['liveStream']}
					</DialogTitle>
					<DialogContent>
						<DialogContentText id='alert-dialog-slide-description'>
							{l[localStorage.getItem('language')]['chooseDate']}
						</DialogContentText>

						<DatePicker
							showTimeSelect
							inline
							style={{
								marginTop: 36,
								alignSelf: 'center',
							}}
							timeIntervals={15}
							selected={this.state.chosenDate}
							onSelect={e => {
								console.log(e)
								this.setState({ chosenDate: e })
							}} //when day is clicked
							onChange={e => {
								console.log(e)
								this.setState({ chosenDate: e })
							}} //only when value has changed
						/>
					</DialogContent>
					<DialogActions>
						<Button
							onClick={async () => {
								this.setState({ mode: 'none' })
							}}
							color='primary'
						>
							Cancel
						</Button>
						<Button
							onClick={async () => {
								let request = await axios.post(
									`${baseURL}/post/live/setevent`,
									{
										id: this.liveID,
										timestamp: this.state.chosenDate.valueOf().toString(),
									},
									{
										headers: {
											'X-Auth-Token': localStorage.getItem('afroboostauth'),
										},
									},
								)
								window.location.reload()
							}}
							color='primary'
						>
							OK
						</Button>
					</DialogActions>
				</Dialog>
				<Dialog
					keepMounted
					TransitionComponent={Transition}
					open={this.state.mode === 'edit'}
					aria-labelledby='form-dialog-title'
				>
					<DialogTitle id='form-dialog-title'>Change information</DialogTitle>
					<DialogContent>
						<TextField
							autoFocus
							margin='dense'
							type='text'
							value={this.state.editTitle}
							onChange={(event: any) => {
								this.setState({ editTitle: event.target.value })
							}}
							fullWidth
						/>
						<TextField
							autoFocus
							margin='dense'
							type='text'
							value={this.state.editDescription}
							onChange={(event: any) => {
								this.setState({ editDescription: event.target.value })
							}}
							fullWidth
						/>
						<TextField
							autoFocus
							margin='dense'
							type='text'
							placeholder='Enter Google Maps link here...'
							value={this.state.editGPS}
							onChange={(event: any) => {
								this.setState({ editGPS: event.target.value })
							}}
							fullWidth
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => this.setState({ mode: 'none' })} color='primary'>
							Cancel
						</Button>
						<Button
							onClick={async () => {
								let form = new FormData()
								form.append('id', this.liveID)
								form.append('title', this.state.editTitle)
								form.append('description', this.state.editDescription)
								form.append('gps', this.state.editGPS)
								const request = await axios.post(`${baseURL}/post/live/setname`, form, {
									headers: {
										'X-Auth-Token': localStorage.getItem('afroboostauth'),
									},
								})
								window.location.reload()
							}}
							color='primary'
						>
							Save
						</Button>
					</DialogActions>
				</Dialog>
				<Dialog
					keepMounted
					TransitionComponent={Transition}
					open={this.state.mode === 'priceset'}
					aria-labelledby='form-dialog-title'
				>
					<DialogTitle id='form-dialog-title'>Change stream price</DialogTitle>
					<DialogContent>
						<TextField
							autoFocus
							margin='dense'
							type='number'
							value={this.state.inputPrice}
							onChange={(event: any) => {
								this.setState({ inputPrice: event.target.value })
							}}
							fullWidth
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => this.setState({ mode: 'none' })} color='primary'>
							Cancel
						</Button>
						<Button
							onClick={async () => {
								let form = new FormData()
								form.append('id', this.liveID)
								form.append('price', this.state.inputPrice)
								const request = await axios.post(`${baseURL}/post/live/setprice`, form, {
									headers: {
										'X-Auth-Token': localStorage.getItem('afroboostauth'),
									},
								})
								// window.location.href = '/live'
								window.location.reload()
							}}
							color='primary'
						>
							Save
						</Button>
					</DialogActions>
				</Dialog>
				<div>
					<h2 className='page-title'>
						{/* <ArrowBackOutline
							onClick={async () => {
								window.history.back()
							}}
							color={'#fff'}
							style={{ marginTop: 6 }}
							height='28px'
							width='28px'
						/> */}
						<div
							className='livepage__icon'
							onClick={async () => {
								window.history.back()
							}}
						>
							<IoArrowBackOutline />
						</div>
						&nbsp;&nbsp;Afroboost Live
					</h2>
				</div>

				<div
					className='live-post'
					style={{
						display: 'flex',
					}}
				>
					{/* mujtaba */}
					{(this.state.poster &&
						this.state.poster == localStorage.getItem('afroboostid')) ||
					localStorage.getItem('afroboostid') == 4 ? (
						<div
							className='upload-icons-div-live livepost-sidebar'
							style={{ flexDirection: 'column' }}
						>
							<a
								className='choose-upload-live'
								style={{ marginBottom: 20 }}
								onClick={() => {
									if (this.state.innerMode === 'call')
										this.setState({ innerMode: 'content' })
									else this.setState({ innerMode: 'call' })
								}}
							>
								{this.state.innerMode === 'call' ? (
									<div className='livepost__icon meetingend__icon'>
										<MdCall />
									</div>
								) : (
									<img
										src={`https://img.icons8.com/ios/60/8E2B9C/video-conference.png`}
										className='dialog-upload-icon-live'
									/>
								)}

								<p className='choose-upload-live-text-live'>
									{this.state.innerMode === 'call' ? 'Leave meeting' : 'Join meeting'}
								</p>
							</a>
							{/* <a
								className='choose-upload-live'
								style={{ marginBottom: 20 }}
								onClick={() => this.uploadMediaRef.click()}
							>
								<img
									src='https://img.icons8.com/ios/60/8E2B9C/radio-waves.png'
									className='dialog-upload-icon-live'
								/>
								<p className='choose-upload-live-text-live'>Share content</p>
								<input
									onChange={async (event: any) => {
										const data = new FormData()
										data.append('file', event.target.files[0])

										data.append('id', this.liveID)
										this.setState(
											{ contentType: 'uploading', progress: progress1 },
											() => {
												setTimeout(
													() =>
														this.setState({ progress: progress2 }, () => {
															setTimeout(
																() =>
																	this.setState({ progress: progress3 }, () => {
																		setTimeout(
																			() =>
																				this.setState({ progress: progress4 }, () => {}),
																			10000,
																		)
																	}),
																5000,
															)
														}),
													1000,
												)
											},
										)
										const request = await axios.post(
											`${baseURL}/post/live/upload`,
											data,
											{
												headers: {
													'X-Auth-Token': localStorage.getItem('afroboostauth'),
												},
											},
										)
										console.log(request)
									}}
									type='file'
									ref={ref => (this.uploadMediaRef = ref)}
									style={{ display: 'none' }}
								/>
							</a> */}
							{/* <a
								className='choose-upload-live'
								style={{ marginBottom: 20 }}
								onClick={() => {
									if (this.reactap.current) {
										console.log('ASYNC', this.reactap.current.audioEl.current.currentTime)
										this.io.emit(
											'sync',
											this.reactap.current.audioEl.current.currentTime,
											this.liveID,
										)
									}
								}}
							>
								<img
									src='https://img.icons8.com/ios/60/8E2B9C/audacity.png'
									className='dialog-upload-icon-live'
								/>
								<p className='choose-upload-live-text-live'>Synchronize</p>
							</a> */}
							{
								// <a
								// 	className='choose-upload-live'
								// 	style={{ marginBottom: 20 }}
								// 	onClick={async () => {
								// 		if (
								// 			this.state.innerMode === 'content' &&
								// 			this.state.contentType === 'paused'
								// 		) {
								// 			const request = await axios.post(
								// 				`${baseURL}/post/live/play`,
								// 				{
								// 					id: this.liveID,
								// 				},
								// 				{
								// 					headers: {
								// 						'X-Auth-Token': localStorage.getItem('afroboostauth'),
								// 					},
								// 				},
								// 			)
								// 			console.log(request)
								// 		} else {
								// 			const request = await axios.post(
								// 				`${baseURL}/post/live/pause`,
								// 				{
								// 					id: this.liveID,
								// 				},
								// 				{
								// 					headers: {
								// 						'X-Auth-Token': localStorage.getItem('afroboostauth'),
								// 					},
								// 				},
								// 			)
								// 			console.log(request)
								// 		}
								// 	}}
								// >
								// 	{this.state.innerMode === 'content' &&
								// 	this.state.contentType === 'paused' ? (
								// 		<img
								// 			src={`https://img.icons8.com/ios/60/8E2B9C/play-button-circled.png`}
								// 			className='dialog-upload-icon-live'
								// 			alt=''
								// 		/>
								// 	) : (
								// 		<div className='livepost__icon pausebtn__my'>
								// 			<BiPauseCircle />
								// 		</div>
								// 	)}
								// 	{/* <img
								// 		src={`https://img.icons8.com/ios/60/8E2B9C/${
								// 			this.state.innerMode === 'content' &&
								// 			this.state.contentType === 'paused'
								// 				? 'play-button-circled.png'
								// 				: 'pause-button.png'
								// 		}`}
								// 		className='dialog-upload-icon-live'
								// 	/>  */}
								// 	<p className='choose-upload-live-text-live'>
								// 		{this.state.innerMode === 'content' &&
								// 		this.state.contentType === 'paused'
								// 			? 'Start'
								// 			: 'Pause'}{' '}
								// 		live
								// 	</p>
								// </a>
							}
							<a
								className='choose-upload-live'
								style={{ marginBottom: 20 }}
								onClick={() => {
									this.uploadThumbnailRef.click()
								}}
							>
								<img
									src='https://img.icons8.com/ios/60/8E2B9C/image-gallery.png'
									className='dialog-upload-icon-live'
								/>
								<p className='choose-upload-live-text-live'>Set banner</p>
								<input
									onChange={async (event: any) => {
										const data = new FormData()
										data.append('file', event.target.files[0])

										data.append('id', this.liveID)
										this.setState(
											{ contentType: 'uploading', progress: progress1 },
											() => {
												setTimeout(
													() =>
														this.setState({ progress: progress2 }, () => {
															setTimeout(
																() =>
																	this.setState({ progress: progress3 }, () => {
																		setTimeout(
																			() =>
																				this.setState({ progress: progress4 }, () => {}),
																			10000,
																		)
																	}),
																5000,
															)
														}),
													1000,
												)
											},
										)
										const request = await axios.post(
											`${baseURL}/post/live/thumbnail/upload`,
											data,
											{
												headers: {
													'X-Auth-Token': localStorage.getItem('afroboostauth'),
												},
											},
										)
										window.location.reload()
									}}
									type='file'
									ref={ref => (this.uploadThumbnailRef = ref)}
									style={{ display: 'none' }}
								/>
							</a>
							<a
								className='choose-upload-live'
								style={{ marginBottom: 20 }}
								onClick={() => this.setState({ mode: 'priceset' })}
							>
								<img
									src='https://img.icons8.com/ios/60/8E2B9C/sell.png'
									className='dialog-upload-icon-live'
								/>
								<p className='choose-upload-live-text-live'>Entry price</p>
							</a>

							<a
								className='choose-upload-live'
								style={{ marginBottom: 20 }}
								onClick={() => this.setState({ mode: 'edit' })}
							>
								<img
									src='https://img.icons8.com/ios/60/8E2B9C/video-editing--v1.png'
									className='dialog-upload-icon-live'
								/>
								<p className='choose-upload-live-text-live'>Live details</p>
							</a>
							<a
								className='choose-upload-live'
								style={{ marginBottom: 20 }}
								onClick={async () => {
									let form = new FormData()
									form.append('id', this.liveID)
									const request = await axios.post(`${baseURL}/post/live/remove`, form, {
										headers: {
											'X-Auth-Token': localStorage.getItem('afroboostauth'),
										},
									})
									window.location.href = `${devURL}/live`
								}}
							>
								<img
									src='https://img.icons8.com/ios/60/8E2B9C/trash.png'
									className='dialog-upload-icon-live'
								/>
								<p className='choose-upload-live-text-live'>Delete live</p>
							</a>
							<a
								className='choose-upload-live'
								style={{ marginBottom: 20 }}
								href={this.state.editGPS}
								target='_blank'
								// onClick={() => {
								// 	this.state.editGPS ? '' : alert('GPS is not found')
								// }}
							>
								<img
									src='https://img.icons8.com/ios/60/8E2B9C/marker.png'
									className='dialog-upload-icon-live'
								/>
								<p className='choose-upload-live-text-live'>Find us</p>
							</a>
							<a
								className='choose-upload-live'
								style={{ marginBottom: 20 }}
								onClick={() => this.setState({ mode: 'datesetter' })}
							>
								<img
									src='https://img.icons8.com/ios/60/8E2B9C/stopwatch.png'
									className='dialog-upload-icon-live'
								/>
								<p className='choose-upload-live-text-live'>Countdown</p>
							</a>
							<a
								className='choose-upload-live'
								style={{ marginBottom: 20 }}
								onClick={() => {
									var input = document.body.appendChild(document.createElement('input'))
									input.value = window.location.href
									input.focus()
									input.select()
									document.execCommand('copy')
									input.parentNode.removeChild(input)
								}}
							>
								<img
									src='https://img.icons8.com/ios/60/8E2B9C/link.png'
									className='dialog-upload-icon-live'
								/>
								<p className='choose-upload-live-text-live'>Copy link</p>
							</a>
						</div>
					) : (
						<div className='upload-icons-div-live' style={{ flexDirection: 'column' }}>
							<a
								className='choose-upload-live'
								style={{ marginBottom: 20 }}
								onClick={() => {
									if (this.state.innerMode === 'call')
										this.setState({ innerMode: 'content' })
									else this.setState({ innerMode: 'call' })
								}}
							>
								{this.state.innerMode === 'call' ? (
									<div className='livepost__icon meetingend__icon'>
										<MdCall />
									</div>
								) : (
									<img
										src={`https://img.icons8.com/ios/60/8E2B9C/video-conference.png`}
										className='dialog-upload-icon-live'
									/>
								)}
								{/* <img
									src={`https://img.icons8.com/ios/60/8E2B9C/${
										this.state.innerMode === 'call' ? 'call' : 'video-conference'
									}.png`}
									className='dialog-upload-icon-live'
								/> */}
								<p className='choose-upload-live-text-live'>
									{this.state.innerMode === 'call' ? 'Leave meeting' : 'Join meeting'}
								</p>
							</a>
							<a
								className='choose-upload-live'
								style={{ marginBottom: 20 }}
								href={this.state.editGPS}
								target='_blank'
							>
								<img
									src='https://img.icons8.com/ios/60/8E2B9C/marker.png'
									className='dialog-upload-icon-live'
								/>
								<p className='choose-upload-live-text-live'>Find us</p>
							</a>
							<a
								className='choose-upload-live'
								style={{ marginBottom: 20 }}
								onClick={() => {
									var input = document.body.appendChild(document.createElement('input'))
									input.value = window.location.href
									input.focus()
									input.select()
									document.execCommand('copy')
									input.parentNode.removeChild(input)
								}}
							>
								<img
									src='https://img.icons8.com/ios/60/8E2B9C/link.png'
									className='dialog-upload-icon-live'
								/>
								<p className='choose-upload-live-text-live'>Copy link</p>
							</a>
						</div>
					)}
					<div style={{ marginTop: 4 }} className='afroboost-container'>
						<Recording />
						{this.state.innerMode === 'call' ? (
							<>
								<iframe
									style={{ marginBottom: '2rem' }}
									allow='camera *;microphone *;recording *' // Added 'recording *' for recording permissions
									id='afroboostmeet'
									allowFullScreen='true'
									webkitallowfullscreen='true'
									mozallowfullscreen='true'
									ref={ref => (this.iframe = ref)}
									onLoad={() => {}}
									src={`https://8x8.vc/vpaas-magic-cookie-756657696a82410eba68bf083fc965a2/${
										this.liveID
									}${this.state.title}#userInfo.displayName="${localStorage.getItem(
										'afroboostusername',
									)}"&config.prejoinPageEnabled=false&config.recordingEnabled=true`} // Added recording and config parameters
									height='600'
									width='100%'
									title='Afroboost Video Meeting'
								></iframe>
							</>
						) : (
							<>
								<div>
									{this.state.contentType === 'uploading' ? (
										<div>
											<img src={this.state.progress} width={'100%'} />
										</div>
									) : null}
									{this.state.contentType === 'paused' ? (
										<div
											style={{ cursor: 'pointer' }}
											onClick={async () => {
												if (this.state.contentType === 'paused') {
													const request = await axios.post(
														`${baseURL}/post/live/play`,
														{
															id: this.liveID,
														},
														{
															headers: {
																'X-Auth-Token': localStorage.getItem('afroboostauth'),
															},
														},
													)
													console.log(request)
												} else {
													const request = await axios.post(
														`${baseURL}/post/live/pause`,
														{
															id: this.liveID,
														},
														{
															headers: {
																'X-Auth-Token': localStorage.getItem('afroboostauth'),
															},
														},
													)
													console.log(request)
												}
											}}
										>
											{/* mujtaba */}
											<div className='livestreamthumnail'>
												<div>
													<div>
														<img
															src={`${baseURL}/static/${this.liveID}/thumbnail.jpg`}
															onError={e => {
																// If the image fails to load, set the source to the fallback image.
																e.target.src = pause
															}}
															width={'100%'}
															alt=''
														/>
													</div>
												</div>
												{this.state.liveDetails ? (
													<div className='livestreamdetails'>
														<button
															onClick={this.removeLiveDetails}
															className='cross_livestreamthumnail'
														>
															X
														</button>
														<div>
															{/* <div className='livestream-name'>
																{this.state.streamName}
															</div> */}
															<div className='livestream-description'>
																{this.state.streamDescription}
															</div>
														</div>
														{/* <div className='livestream-price'>
															CHF: {this.state.streamPrice}
														</div> */}
													</div>
												) : null}
											</div>
										</div>
									) : null}
									{this.state.contentType === 'image' ? (
										<div>
											<img
												src={`${baseURL}/static/${
													this.state.media
												}?cachecleaner=${new Date().valueOf()}`}
												width={'100%'}
												alt='thumnails'
											/>
										</div>
									) : null}
									{this.state.contentType === 'video' ? (
										<div
											className='afroboost-player'
											ref={ref => {
												let config = {
													sources: [
														{
															type: 'mp4',
															src: `${baseURL}/static/${this.state.media}`,
														},
													],
													ui: {
														enabled: true,
													},
													autoplay: true,
												}
												if (ref && !this.afroboostPlayer) {
													let player = IndigoPlayer.init(ref, config)
													player.on(IndigoPlayer.Events.STATE_ENDED, () => {
														player.seekTo(0)
														player.play()
													})

													this.afroboostPlayer = ref
												}
											}}
										></div>
									) : null}

									{this.state.contentType === 'audio' ? (
										<div style={{ display: 'flex', flexDirection: 'column' }}>
											<AudioSpectrum
												id='audio-canvas'
												height={300}
												width={650}
												crossorigin='anonymous'
												audioId={'audio-element'}
												capColor={'white'}
												capHeight={2}
												meterWidth={10}
												meterCount={512}
												audioEle={ref => {
													ref.crossorigin = 'anonymous'
												}}
												meterColor={[
													{ stop: 0, color: '#900fd1' },
													{ stop: 0.5, color: '#6734bf' },
													{ stop: 1, color: '#900fd1' },
												]}
												gap={4}
											/>
											<ReactAudioPlayer
												id='audio-element'
												ref={this.reactap}
												crossOrigin='anonymous'
												loop
												style={{
													marginTop: 30,
													width: '100%',
													filter: 'invert(100%)',
												}}
												src={`${baseURL}/static/${this.state.media}`}
												onCanPlayThrough={() => {
													this.reactap.current.audioEl.current.play()
												}}
												controls
											/>{' '}
										</div>
									) : null}
								</div>
								<div>
									<p
										style={{
											color: 'white',
											fontFamily: 'Montserrat',
										}}
									>
										{this.state.description}
									</p>
								</div>
								<div className='liveaction__row'>
									<a
										href='javascript:void(0)'
										onClick={async () => {
											const data = await axios.post(
												`${baseURL}/post/live/changeLikeStatus`,
												{
													id: this.liveID,
												},
												{
													headers: {
														'X-Auth-Token': localStorage.getItem('afroboostauth'),
													},
												},
											)
											console.log(data.data)
											this.setState(
												(prevState: any) => ({
													liked: data.data.status,
													likes: data.data.message,
												}),
												() => {
													console.log(this.state.liked)
												},
											)
										}}
									>
										{this.state.liked ? (
											<div className='fillheart__icon'>
												<Fillheart />
											</div>
										) : (
											// <Heart
											// 	color={'#ffffff'}
											// 	height='30px'
											// 	width='30px'
											// 	cssClasses='heart-icon'
											// />
											// <HeartOutline
											// 	color={'#ffffff'}
											// 	height='30px'
											// 	width='30px'
											// 	cssClasses='heart-icon'
											// />
											<div
												className='livepost__icon heart-icon '
												style={{ marginLeft: 15 }}
											>
												<IoHeartOutline />
												{/* <Fillheart /> */}
											</div>
										)}
									</a>
									<span
										style={{
											// marginLeft: 3,
											marginRight: 26,
											cursor: 'default',
											color: 'white',
											fontFamily: 'Montserrat',
											fontWeight: 500,
										}}
									>
										{' '}
										{this.state.likes}
									</span>
									{/* <img
								src='https://img.icons8.com/ios/60/FFFFFF/eye.png'
								style={{ width: 25, height: 25 }}
							/> */}
									<div className='livepost__icon watching__icon'>
										<BsEyeFill />
									</div>
									<span
										style={{
											fontFamily: 'Montserrat',
											color: 'white',
											marginLeft: 14,
										}}
									>
										{this.state.watching} watching
									</span>
								</div>
								<h2 style={{ marginTop: 26 }} className='page-title'>
									<Spectrum />
									&nbsp;&nbsp;Latest
								</h2>
							</>
						)}

						<div>
							<FlatList
								list={this.state.liveList.slice(0, 3)}
								renderItem={(item: any, index: number) => {
									return (
										<Afrolive
											key={index}
											post={{
												postDate: new Date(),
												postPrice: item.price,
												postTitle: item.title,
												posterID: item.poster_id,
												posterName: item.name,
												postID: item.id,
												postTimestamp: parseInt(item.countdown),
											}}
										/>
									)
								}}
								sort={{
									by: [
										{
											key: 'postDate',
											descending: this.state.sortType === 'Latest posts',
										},
									],
								}}
								displayGrid
								gridGap='30px'
								minColumnWidth='250px'
							/>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default LivePost
