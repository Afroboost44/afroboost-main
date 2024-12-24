//@ts-nocheck
import { useHistory } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import TextField from '@material-ui/core/TextField'
import React from 'react'
// import * as reactIonicons from "react-ionicons";
import './Header.css'
// import { makeStyles } from "@material-ui/core/styles";
// import Icon from "@material-ui/core/Icon";
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import Slide from '@material-ui/core/Slide'
import { TransitionProps } from '@material-ui/core/transitions'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import ProgressBar from '@ramonak/react-progress-bar'
import axios from 'axios'
import English from '../../english'
import France from '../../france'
import Germany from '../../germany'
import Spain from '../../spain'
import withToast from '../../helpers/withToast'
import urls from '../../helpers/config'
import ProductForm from '../Snipets/ProductForm'
// icons
import { FaBeer } from 'react-icons/fa'
import { AiOutlineCloudUpload } from 'react-icons/ai'
import { MdNotificationsActive } from 'react-icons/md'
import { AiOutlineMail } from 'react-icons/ai'
import { BsPeopleFill } from 'react-icons/bs'

import { baseURL, devURL } from '../../api'
import { IoRemoveCircleOutline } from 'react-icons/io5'
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

interface IProps {
	loggedIn?: boolean
	io: any
}

interface IState {
	searchQuery?: string
	uploadDialog: boolean
	uploadedFile: any
	post_title: string
	post_description: string
	post_price: string
	uploadedProgress: string
	newMessage: boolean
	categoryChosen: string
	mode: string
	percentage: number
}

class Header extends React.Component<IProps, IState> {
	attacherRef: any
	attacherRef1: any
	attacherRef2: any
	attacherRef3: any
	attacherRef4: any
	attacherRef5: any
	attacherRef6: any

	constructor(props: IProps) {
		super(props)
		this.state = {
			searchQuery: '',
			uploadDialog: false,
			uploadedFile: undefined,
			uploadedFile1: undefined,
			uploadedFile2: undefined,
			uploadedFile3: undefined,
			uploadedFile4: undefined,
			uploadedFile5: undefined,
			uploadedFile6: undefined,
			post_title: '',
			post_description: '',
			post_price: '0.00',
			newMessage: localStorage.getItem('newmessage') === 'true' || false,
			newNotification: localStorage.getItem('newnotification') === 'true' || false,
			uploadedProgress: '',
			categoryChosen: 'Entertainment',
			mode: 'none',
			percentage: 0,
			picNum: 2,
			picNum2: false,
			picNum3: false,
			picNum4: false,
			picNum5: false,
			picNum6: false,
			selected_category: null,
			productType: 'T-Shirt',
			sub_monthly: '',
			sub_quarterly: '',
			sub_annual: '',
			monthly_price: '10.0',
			quarterly_price: '30.0',
			annual_price: '70.0',
			notifications: [],

			// Sport addition inputs
			date: new Date(),
			sessionPrice: '0.00',
			nSession: 0,
			validity: 0, //
		}
		axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*'

		this.uploadProgress = this.uploadProgress.bind(this)
	}
	async getNotifications() {
		const notifArray = await axios.get(`${baseURL}/user/getNotifications`, {
			headers: {
				'X-Auth-Token': localStorage.getItem('afroboostauth'),
			},
		})
		console.log('Data is :' + notifArray.data)
		this.setState({ notifications: notifArray.data.message })
	}

	checkExtension(fileName: any, product: bool) {
		var extension = fileName.split('.').pop()
		if (extension === 'png' || extension === 'jpg' || extension === 'jpeg') return true
		else if (extension === 'mp4' || extension === 'flv' || extension === 'avi')
			return true
		else if (extension === 'mp3' && product) return false
		return true
	}
	componentDidMount() {
		this.getNotifications()
		if (this.props.io) {
			this.props.io.on('notify', () => {
				localStorage.setItem('newmessage', 'true')
				this.setState({ newMessage: true })
			})
			this.props.io.on('notification', () => {
				localStorage.setItem('newnotification', 'true')
				this.setState({ newNotification: true })
			})
		}
	}

	// Set form values
	setValues = form => {
		this.setState(form)
	}

	uploadProgress = progressEvent => {
		var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
		this.setState({ percentage: percentCompleted })
	}

	render() {
		return (
			<div className='header'>
				{/* Registration */}
				<Dialog
					open={this.state.mode === 'not-found'}
					TransitionComponent={Transition}
					keepMounted
					onClose={() => {
						this.setState({ mode: 'none' })
					}}
					aria-labelledby='alert-dialog-slide-title'
					aria-describedby='alert-dialog-slide-description'
				>
					<DialogTitle id='alert-dialog-slide-title'>
						{l[localStorage.getItem('language')]['userNotFound']}
					</DialogTitle>
					<DialogContent>
						<DialogContentText id='alert-dialog-slide-description'>
							{l[localStorage.getItem('language')]['userNotFoundText']}
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button
							onClick={() => {
								this.setState({ mode: 'register' })
							}}
							color='primary'
						>
							OK
						</Button>
					</DialogActions>
				</Dialog>

				{/*notification dialog*/}
				<Dialog
					keepMounted
					TransitionComponent={Transition}
					fullWidth={true}
					open={this.state.mode === 'notification'}
					onClose={() => {
						localStorage.setItem('newnotification', 'false')
						this.setState({
							uploadDialog: false,
							percentage: 0,
							mode: 'none',
						})
					}}
					aria-labelledby='form-dialog-title'
				>
					<DialogTitle id='form-dialog-title'>Notifications</DialogTitle>
					<DialogContent>
						{this.state.notifications.map(item => {
							if (item.seen === 1) return null
							return (
								<div
									style={{
										display: 'flex',
										padding: 10,
										margin: 10,
										borderBottom: '3px solid #B526B0',
										flexDirection: 'column',
									}}
								>
									<div
										style={{
											display: 'flex',
											flexDirection: 'row',
											justifyContent: 'space-between',
											alignItems: 'center',
										}}
									>
										<a
											href={item.link}
											style={{
												margin: 0,
												color: 'white',
												fontFamily: 'Montserrat',
											}}
										>
											{item.text}
										</a>
										<button
											className='remove-notification'
											onClick={async () => {
												await axios.post(
													`${baseURL}/user/seenNotification`,
													{
														id: item.id,
													},
													{
														headers: {
															'X-Auth-Token': localStorage.getItem('afroboostauth'),
														},
													},
												)
												this.getNotifications()
											}}
											style={{ background: 'none', border: 'none', focus: 'none' }}
										>
											<div className='removecirle__icon'>
												<IoRemoveCircleOutline />
											</div>
										</button>
									</div>
								</div>
							)
						})}
					</DialogContent>
				</Dialog>

				{/*choose upload type dialog*/}
				<Dialog
					keepMounted
					TransitionComponent={Transition}
					fullWidth={true}
					open={this.state.uploadDialog}
					onClose={() =>
						this.setState({
							uploadDialog: false,
							percentage: 0,
						})
					}
					aria-labelledby='form-dialog-title'
				>
					<DialogTitle id='form-dialog-title'>
						{l[localStorage.getItem('language')]['typeofUploadText']}
					</DialogTitle>
					<DialogContent>
						<div>
							<div className='upload-icons-div'>
								<button
									className='choose-upload'
									onClick={() => {
										if (localStorage.getItem('afroboostauth') === 'guest') {
											this.setState({ uploadDialog: false })
											this.props.addToast(
												'You need to create an account to be able to upload.',
												{
													appearance: 'error',
													autoDismiss: true,
												},
											)
											return
										}
										this.setState({ mode: 'media', uploadDialog: false })
									}}
								>
									<img
										src='https://img.icons8.com/metro/60/8E2B9C/audio-wave.png'
										className='dialog-upload-icon'
										alt='icons'
									/>
									<p className='choose-upload-text'>Media</p>
								</button>
								<button
									className='choose-upload'
									onClick={() => {
										if (localStorage.getItem('afroboostauth') === 'guest') {
											this.setState({ uploadDialog: false })
											this.props.addToast(
												'You need to create an account to be able to upload.',
												{
													appearance: 'error',
													autoDismiss: true,
												},
											)
											return
										}
										this.setState({ mode: 'subscription', uploadDialog: false })
									}}
								>
									<img
										src='https://img.icons8.com/ios/60/8E2B9C/video.png'
										className='dialog-upload-icon'
										alt='icons'
									/>
									<p className='choose-upload-text'>Video class</p>
								</button>
								<button
									className='choose-upload'
									onClick={() => {
										if (localStorage.getItem('afroboostauth') === 'guest') {
											this.setState({ uploadDialog: false })
											this.props.addToast(
												'You need to create an account to be able to upload.',
												{
													appearance: 'error',
													autoDismiss: true,
												},
											)
											return
										}
										this.setState({ mode: 'product', uploadDialog: false })
									}}
								>
									<img
										src='https://img.icons8.com/ios/60/8E2B9C/online-shop-shopping-bag.png'
										className='dialog-upload-icon'
										alt='icons'
									/>
									<p className='choose-upload-text'>Product</p>
								</button>
							</div>
						</div>
					</DialogContent>
					<DialogActions>
						<Button
							onClick={() => this.setState({ uploadDialog: false })}
							color='primary'
						>
							Cancel
						</Button>
					</DialogActions>
				</Dialog>

				{/* Upload media dialog*/}
				<Dialog
					keepMounted
					TransitionComponent={Transition}
					open={this.state.mode === 'media'}
					onClose={() =>
						this.setState({ uploadDialog: false, percentage: 0, mode: 'none' })
					}
					aria-labelledby='form-dialog-title'
				>
					<DialogTitle id='form-dialog-title'>
						{l[localStorage.getItem('language')]['publishPost']}
					</DialogTitle>
					<DialogContent>
						<DialogContentText>
							{l[localStorage.getItem('language')]['publishPostFirst']}
						</DialogContentText>
						<TextField
							autoFocus
							margin='dense'
							label={l[localStorage.getItem('language')]['titlePost']}
							type='text'
							value={this.state.post_title}
							onChange={(event: any) => {
								this.setState({ post_title: event.target.value })
							}}
							fullWidth
							helperText={l[localStorage.getItem('language')]['titlePost']}
						/>
						<TextField
							margin='dense'
							id='description'
							label={l[localStorage.getItem('language')]['descriptionPost']}
							type='text'
							value={this.state.post_description}
							onChange={(event: any) => {
								this.setState({ post_description: event.target.value })
							}}
							fullWidth
							multiline
							helperText={l[localStorage.getItem('language')]['descriptionPost']}
						/>
						<TextField
							margin='dense'
							id='number'
							label={l[localStorage.getItem('language')]['pricePost']}
							type='number'
							onChange={(event: any) => {
								this.setState({ post_price: event.target.value })
							}}
							value={this.state.post_price}
							fullWidth
							helperText={l[localStorage.getItem('language')]['pricePost']}
						/>
						<FormControl>
							<InputLabel id='demo-simple-select-helper-label'>
								{l[localStorage.getItem('language')]['category']}
							</InputLabel>
							<Select
								labelId='demo-simple-select-helper-label'
								id='demo-simple-select-helper'
								value={this.state.categoryChosen}
								onChange={(event: any) => {
									this.setState({ categoryChosen: event.target.value })
								}}
							>
								<MenuItem value={'Entertainment'}>
									{l[localStorage.getItem('language')]['Entertainment']}
								</MenuItem>
								<MenuItem value={'Film'}>
									{l[localStorage.getItem('language')]['Film']}
								</MenuItem>
								<MenuItem value={'Sport'}>
									{l[localStorage.getItem('language')]['Sport']}
								</MenuItem>
								<MenuItem value={'Animations'}>
									{l[localStorage.getItem('language')]['Animations']}
								</MenuItem>
								<MenuItem value={'Music'}>
									{l[localStorage.getItem('language')]['Music']}
								</MenuItem>
								<MenuItem value={'Services'}>
									{l[localStorage.getItem('language')]['Services']}
								</MenuItem>
								<MenuItem value={'Podcasts'}>
									{l[localStorage.getItem('language')]['Podcasts']}
								</MenuItem>
								<MenuItem value={'Tutorials'}>
									{l[localStorage.getItem('language')]['Tutorials']}
								</MenuItem>
							</Select>
							<FormHelperText>Choose post subject</FormHelperText>
						</FormControl>
						<Button
							style={{
								marginTop: 16,
								marginRight: 16,
							}}
							variant='contained'
							color='primary'
							onClick={() => {
								this.attacherRef.click()
							}}
							startIcon={<CloudUploadIcon />}
						>
							<b>Upload</b>
						</Button>
						{this.state.uploadedFile ? (
							!this.checkExtension(this.state.uploadedFile.name) ? (
								<DialogContentText style={{ fontSize: 13, marginTop: 8, color: 'red' }}>
									{l[localStorage.getItem('language')]['extensionError']}
								</DialogContentText>
							) : null
						) : null}
						{this.state.uploadedFile ? (
							<>
								<DialogContentText
									style={{
										fontSize: 14,
										margin: 0,
										marginTop: 16,
										marginRight: 16,
									}}
								>
									{'Upload thumbnail'}
								</DialogContentText>
								<Button
									style={{
										marginTop: 8,
										marginRight: 16,
									}}
									variant='contained'
									color='primary'
									onClick={() => {
										this.attacherRef1.click()
									}}
									startIcon={<CloudUploadIcon />}
								>
									<b>Upload thumbnail</b>
								</Button>
								<DialogContentText
									style={{
										fontSize: 14,
										margin: 0,
										marginTop: 16,
										marginRight: 16,
									}}
								>
									{this.state.uploadedFile1
										? this.state.uploadedFile1.name
										: l[localStorage.getItem('language')]['noFilesUploaded']}
								</DialogContentText>
							</>
						) : null}
						<input
							id='uploader'
							onChange={(event: any) => {
								this.setState({ uploadedFile1: event.target.files[0] })
								console.log(event.target.files[0])
							}}
							style={{ display: 'none' }}
							type='file'
							ref={(ref: any) => {
								this.attacherRef1 = ref
								let uploader = document.getElementById('uploader')
								uploader.addEventListener('loadedmetadata', function () {
									console.log('width:', this.videoWidth)
									console.log('height:', this.videoHeight)
								})
							}}
						/>
						<DialogContentText style={{ fontSize: 13, marginTop: 8 }}>
							{'Recommended: 1920x1080 (1080p)'}
						</DialogContentText>
						<input
							id='uploader'
							onChange={(event: any) => {
								this.setState({ uploadedFile1: event.target.files[0] })
								console.log(event.target.files[0])
							}}
							style={{ display: 'none' }}
							type='file'
							ref={(ref: any) => {
								this.attacherRef = ref
								let uploader = document.getElementById('uploader')
								uploader.addEventListener('loadedmetadata', function () {
									console.log('width:', this.videoWidth)
									console.log('height:', this.videoHeight)
								})
							}}
						/>
						<DialogContentText style={{ marginTop: 16 }}>
							{!(
								this.state.uploadedProgress === 'Uploading...' && this.state.uploadedFile
							) ? (
								this.state.uploadedFile ? (
									this.state.uploadedFile.name
								) : (
									l[localStorage.getItem('language')]['noFilesUploaded']
								)
							) : (
								<ProgressBar
									width='200px'
									margin='20px'
									completed={this.state.percentage}
								/>
							)}
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => this.setState({ mode: 'none' })} color='primary'>
							Cancel
						</Button>
						<Button
							onClick={async () => {
								let form = new FormData()
								form.append('uploadedFile', this.state.uploadedFile)
								form.append('thumbnail', this.state.uploadedFile1)
								form.append('post_title', this.state.post_title)
								form.append('post_description', this.state.post_description)
								form.append('post_price', this.state.post_price)
								form.append('post_category', this.state.categoryChosen)
								this.setState({
									uploadedProgress: 'Uploading...',
								})

								if (this.state.productType === 'Sport') {
									form.append('total_session', parseInt(this.state.nSession || 0))
									form.append('start_date', new Date(this.state.date).toISOString())
									form.append('validity', parseInt(this.state.validity || 0))
									form.append('session_price', parseInt(this.state.sessionPrice || 0))
								}
								this.setState({ uploadedProgress: 'Uploading...' })
								await axios.post(`${baseURL}/post/upload`, form, {
									headers: {
										'X-Auth-Token': localStorage.getItem('afroboostauth'),
									},
									onUploadProgress: this.uploadProgress,
								})

								alert(
									'Your post has been published successfully. You can see it on your profile page.',
								)

								this.setState({
									mode: 'none',
									post_title: '',
									post_description: '',
									post_price: '0.00',
									uploadedFile: undefined,
									uploadedFile1: undefined,
									uploadDialog: false,
									percentage: 0,
								})
							}}
							color='primary'
						>
							{l[localStorage.getItem('language')]['publish']}
						</Button>
					</DialogActions>
				</Dialog>

				{/*Video class upload dialog*/}
				<Dialog
					keepMounted
					TransitionComponent={Transition}
					open={this.state.mode === 'subscription'}
					onClose={() =>
						this.setState({
							uploadDialog: false,
							percentage: 0,
							mode: 'none',
						})
					}
					aria-labelledby='form-dialog-title'
				>
					<DialogTitle id='form-dialog-title'>
						{l[localStorage.getItem('language')]['publishPost']}
					</DialogTitle>
					<DialogContent>
						<DialogContentText>
							{l[localStorage.getItem('language')]['publishPostFirst']}
						</DialogContentText>
						<TextField
							autoFocus
							margin='dense'
							label={l[localStorage.getItem('language')]['titlePost']}
							type='text'
							value={this.state.post_title}
							onChange={(event: any) => {
								this.setState({ post_title: event.target.value })
							}}
							fullWidth
							helperText={l[localStorage.getItem('language')]['titlePost']}
						/>
						<TextField
							margin='dense'
							id='description'
							label={l[localStorage.getItem('language')]['descriptionPost']}
							type='text'
							value={this.state.post_description}
							onChange={(event: any) => {
								this.setState({ post_description: event.target.value })
							}}
							fullWidth
							multiline
							helperText={l[localStorage.getItem('language')]['descriptionPost']}
						/>
						<div className='video-class-sub-text'>
							<TextField
								margin='dense'
								id='monthly'
								label={l[localStorage.getItem('language')]['nameMonthlySub']}
								type='text'
								onChange={(event: any) => {
									this.setState({ sub_monthly: event.target.value })
								}}
								value={this.state.sub_monthly}
								fullWidth
							/>
							<TextField
								margin='dense'
								id='monthly-price'
								label={l[localStorage.getItem('language')]['monthlyPrice']}
								type='number'
								onChange={(event: any) => {
									this.setState({ monthly_price: event.target.value })
								}}
								value={this.state.monthly_price}
								fullWidth
								className='video-class-price-text'
							/>
						</div>
						<div className='video-class-sub-text'>
							<TextField
								margin='dense'
								id='quarterly'
								label={l[localStorage.getItem('language')]['nameQuartSub']}
								type='text'
								onChange={(event: any) => {
									this.setState({ sub_quarterly: event.target.value })
								}}
								value={this.state.sub_quarterly}
								fullWidth
							/>
							<TextField
								margin='dense'
								id='quarterly-price'
								label={l[localStorage.getItem('language')]['quartPrice']}
								type='number'
								onChange={(event: any) => {
									this.setState({ quarterly_price: event.target.value })
								}}
								value={this.state.quarterly_price}
								fullWidth
								className='video-class-price-text'
							/>
						</div>
						<div className='video-class-sub-text'>
							<TextField
								margin='dense'
								id='annual'
								label={l[localStorage.getItem('language')]['nameAnnualSub']}
								type='text'
								onChange={(event: any) => {
									this.setState({ sub_annual: event.target.value })
								}}
								value={this.state.sub_annual}
								fullWidth
							/>
							<TextField
								margin='dense'
								id='annual-price'
								label={l[localStorage.getItem('language')]['annualPrice']}
								type='number'
								onChange={(event: any) => {
									this.setState({ annual_price: event.target.value })
								}}
								value={this.state.annual_price}
								fullWidth
								className='video-class-price-text'
							/>
						</div>
						<FormControl>
							<InputLabel id='demo-simple-select-helper-label'>
								{l[localStorage.getItem('language')]['category']}
							</InputLabel>
							<Select
								labelId='demo-simple-select-helper-label'
								id='demo-simple-select-helper'
								value={this.state.categoryChosen}
								onChange={(event: any) => {
									this.setState({ categoryChosen: event.target.value })
								}}
							>
								<MenuItem value={'Entertainment'}>
									{l[localStorage.getItem('language')]['Entertainment']}
								</MenuItem>
								<MenuItem value={'Film'}>
									{l[localStorage.getItem('language')]['Film']}
								</MenuItem>
								<MenuItem value={'Sport'}>
									{l[localStorage.getItem('language')]['Sport']}
								</MenuItem>
								<MenuItem value={'Animations'}>
									{l[localStorage.getItem('language')]['Animations']}
								</MenuItem>
								<MenuItem value={'Music'}>
									{l[localStorage.getItem('language')]['Music']}
								</MenuItem>
								<MenuItem value={'Services'}>
									{l[localStorage.getItem('language')]['Services']}
								</MenuItem>
								<MenuItem value={'Podcasts'}>
									{l[localStorage.getItem('language')]['Podcasts']}
								</MenuItem>
								<MenuItem value={'Tutorials'}>
									{l[localStorage.getItem('language')]['Tutorials']}
								</MenuItem>
							</Select>
							<FormHelperText>
								{' '}
								{l[localStorage.getItem('language')]['choosePostSubject']}
							</FormHelperText>
						</FormControl>
						<Button
							style={{
								marginTop: 16,
							}}
							variant='contained'
							color='primary'
							onClick={() => {
								this.attacherRef.click()
								console.log('uploadedFile: ', this.state.uploadedFile)
							}}
							startIcon={<CloudUploadIcon />}
						>
							<b>Upload</b>
						</Button>
						{this.state.uploadedFile ? (
							!this.checkExtension(this.state.uploadedFile.name) ? (
								<DialogContentText style={{ fontSize: 13, marginTop: 8, color: 'red' }}>
									{l[localStorage.getItem('language')]['extensionError']}
								</DialogContentText>
							) : null
						) : null}
						{this.state.uploadedFile ? (
							<>
								<DialogContentText
									style={{
										fontSize: 14,
										margin: 0,
										marginTop: 16,
										marginRight: 16,
									}}
								>
									{'Upload thumbnail'}
								</DialogContentText>
								<Button
									style={{
										marginTop: 8,
										marginRight: 16,
									}}
									variant='contained'
									color='primary'
									onClick={() => {
										this.attacherRef1.click()
									}}
									startIcon={<CloudUploadIcon />}
								>
									<b>Upload thumbnail</b>
								</Button>
								<DialogContentText
									style={{
										fontSize: 14,
										margin: 0,
										marginTop: 16,
										marginRight: 16,
									}}
								>
									{this.state.uploadedFile1
										? this.state.uploadedFile1.name
										: l[localStorage.getItem('language')]['noFilesUploaded']}
								</DialogContentText>
							</>
						) : null}
						<input
							id='uploader'
							onChange={(event: any) => {
								this.setState({ uploadedFile1: event.target.files[0] })
								console.log(event.target.files[0])
							}}
							style={{ display: 'none' }}
							type='file'
							ref={(ref: any) => {
								this.attacherRef1 = ref
								let uploader = document.getElementById('uploader')
								uploader.addEventListener('loadedmetadata', function () {
									console.log('width:', this.videoWidth)
									console.log('height:', this.videoHeight)
								})
							}}
						/>
						<DialogContentText style={{ fontSize: 13, marginTop: 8 }}>
							{'Recommended: 1920x1080 (1080p)'}
						</DialogContentText>
						<input
							id='uploader'
							onChange={(event: any) => {
								this.setState({ uploadedFile: event.target.files[0] })
								console.log(event.target.files[0])
							}}
							style={{ display: 'none' }}
							type='file'
							ref={(ref: any) => {
								this.attacherRef = ref
								let uploader = document.getElementById('uploader')
								uploader.addEventListener('loadedmetadata', function () {
									console.log('width:', this.videoWidth)
									console.log('height:', this.videoHeight)
								})
							}}
						/>
						<DialogContentText style={{ marginTop: 16 }}>
							{!(
								this.state.uploadedProgress === 'Uploading...' && this.state.uploadedFile
							) ? (
								this.state.uploadedFile ? (
									this.state.uploadedFile.name
								) : (
									l[localStorage.getItem('language')]['noFilesUploaded']
								)
							) : (
								<ProgressBar
									width='200px'
									margin='20px'
									completed={this.state.percentage}
								/>
							)}
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => this.setState({ mode: 'none' })} color='primary'>
							Cancel
						</Button>
						<Button
							onClick={async () => {
								let form = new FormData()
								form.append('uploadedFile', this.state.uploadedFile)
								form.append('thumbnail', this.state.uploadedFile1)
								form.append('post_title', this.state.post_title)
								form.append('post_description', this.state.post_description)
								form.append('post_price', this.state.post_price)
								form.append('post_category', this.state.categoryChosen)
								form.append('monthly_price', this.state.monthly_price)
								form.append('quarterly_price', this.state.quarterly_price)
								form.append('annual_price', this.state.annual_price)
								form.append('sub_monthly', this.state.sub_monthly)
								form.append('sub_quarterly', this.state.sub_quarterly)
								form.append('sub_annual', this.state.sub_annual)
								this.setState({ uploadedProgress: 'Uploading...' })

								await axios.post(`${baseURL}/post/upload`, form, {
									headers: {
										'X-Auth-Token': localStorage.getItem('afroboostauth'),
									},
									onUploadProgress: this.uploadProgress,
								})
								alert(
									'Your post has been published successfully. You can see it on your profile page.',
								)
								this.setState({
									mode: 'none',
									post_title: '',
									post_description: '',
									post_price: '0.00',
									uploadedFile: undefined,
									uploadedFile1: undefined,
									uploadDialog: false,
									percentage: 0,
								})
							}}
							color='primary'
						>
							{l[localStorage.getItem('language')]['publish']}
						</Button>
					</DialogActions>
				</Dialog>

				{/*product upload dialog */}
				<Dialog
					keepMounted
					scroll={'body'}
					TransitionComponent={Transition}
					open={this.state.mode === 'product'}
					onClose={() => this.setState({ uploadDialog: false, percentage: 0 })}
					aria-labelledby='form-dialog-title'
				>
					<DialogTitle id='form-dialog-title'>
						{' '}
						{l[localStorage.getItem('language')]['uploadProduct']}
					</DialogTitle>
					<DialogContent>
						<TextField
							autoFocus
							margin='dense'
							style={{ margin: 0, marginBottom: '12px' }}
							label={l[localStorage.getItem('language')]['productTitle']}
							type='text'
							value={this.state.post_title}
							onChange={(event: any) => {
								this.setState({ post_title: event.target.value })
							}}
							fullWidth
							helperText={l[localStorage.getItem('language')]['titlePost']}
						/>
						<FormControl style={{ display: 'flex' }}>
							<InputLabel
								id='demo-simple-select-helper-label'
								style={this.state.selected_category}
							>
								{l[localStorage.getItem('language')]['category']}
							</InputLabel>
							<Select
								labelId='demo-simple-select-helper-label'
								id='demo-simple-select-helper'
								value={this.state.productType}
								onFocus={() =>
									this.setState({
										selected_category: { color: '#ad51c9' },
									})
								}
								onBlur={() =>
									this.setState({
										selected_category: null,
									})
								}
								onChange={(event: any) => {
									this.setState({
										productType: event.target.value,
									})
								}}
							>
								<MenuItem value={'T-Shirt'}>T-Shirt</MenuItem>
								<MenuItem value={'Leggings'}>Leggings, Trousers</MenuItem>
								<MenuItem value={'Footwear'}>Footwear</MenuItem>
								<MenuItem value={'Food'}>Food, Suplements</MenuItem>
								<MenuItem value={'Sport'}>Sport</MenuItem>
							</Select>
							<FormHelperText>Choose the type of your product</FormHelperText>
						</FormControl>
						<TextField
							margin='dense'
							style={{ margin: 0, marginBottom: '12px' }}
							id='description'
							label={l[localStorage.getItem('language')]['productDesc']}
							type='text'
							value={this.state.post_description}
							onChange={(event: any) => {
								this.setState({ post_description: event.target.value })
							}}
							fullWidth
							multiline
							helperText={l[localStorage.getItem('language')]['descriptionPost']}
						/>
						<TextField
							margin='dense'
							style={{ margin: 0, marginBottom: '12px' }}
							id='number'
							label={l[localStorage.getItem('language')]['productPrice']}
							type='number'
							onChange={(event: any) => {
								this.setState({ post_price: event.target.value })
							}}
							value={this.state.post_price}
							fullWidth
							helperText={l[localStorage.getItem('language')]['pricePost']}
						/>
						<div>
							{this.state?.productType === 'Sport' && (
								<ProductForm setValues={this.setValues} />
							)}
						</div>
						<DialogContentText style={{ margin: 0, marginTop: '10px' }}>
							{l[localStorage.getItem('language')]['uploadYourFiles']}
						</DialogContentText>
						<DialogContentText style={{ fontSize: 13 }}>
							{'Recommended: 1920x1080 (1080p)'}
						</DialogContentText>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
								}}
							>
								<Button
									style={{
										marginBottom: '16px',
									}}
									variant='contained'
									color='primary'
									onClick={() => {
										this.attacherRef1.click()
									}}
									startIcon={<CloudUploadIcon />}
								>
									<b>Upload</b>
								</Button>
								<DialogContentText style={{ marginTop: 16 }}>
									{this.state.uploadedFile1
										? this.state.uploadedFile1.name.length > 60
											? this.state.uploadedFile1.name.substring(0, 60 - 3) + '...'
											: this.state.uploadedFile1.name
										: l[localStorage.getItem('language')]['noFilesUploaded']}
								</DialogContentText>
							</div>
							{this.state.uploadedFile1 ? (
								!this.checkExtension(this.state.uploadedFile1.name, true) ? (
									<DialogContentText style={{ fontSize: 13, marginTop: 8, color: 'red' }}>
										{l[localStorage.getItem('language')]['extensionProductError']}
									</DialogContentText>
								) : null
							) : null}
							{this.state.uploadedFile1 ? (
								<>
									<DialogContentText
										style={{
											fontSize: 14,
											margin: 0,
											marginTop: 16,
											marginRight: 16,
										}}
									>
										{'Upload thumbnail'}
									</DialogContentText>
									<Button
										style={{
											marginTop: 8,
											marginRight: 16,
										}}
										variant='contained'
										color='primary'
										onClick={() => {
											this.attacherRef.click()
										}}
										startIcon={<CloudUploadIcon />}
									>
										<b>Upload thumbnail</b>
									</Button>
									<DialogContentText
										style={{
											fontSize: 14,
											margin: 0,
											marginTop: 16,
											marginRight: 16,
										}}
									>
										{this.state.uploadedFile
											? this.state.uploadedFile.name
											: l[localStorage.getItem('language')]['noFilesUploaded']}
									</DialogContentText>
								</>
							) : null}
							<input
								id='uploader'
								onChange={(event: any) => {
									this.setState({ uploadedFile: event.target.files[0] })
									console.log(event.target.files[0])
								}}
								style={{ display: 'none' }}
								type='file'
								ref={(ref: any) => {
									this.attacherRef = ref
									let uploader = document.getElementById('uploader')
									uploader.addEventListener('loadedmetadata', function () {
										console.log('width:', this.videoWidth)
										console.log('height:', this.videoHeight)
									})
								}}
							/>

							{this.state.picNum2 ? (
								<>
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
										}}
									>
										<Button
											style={{
												marginBottom: '16px',
											}}
											variant='contained'
											color='primary'
											onClick={() => {
												this.attacherRef2.click()
											}}
											startIcon={<CloudUploadIcon />}
										>
											<b>Upload</b>
										</Button>
										<DialogContentText style={{ marginTop: 16 }}>
											{this.state.uploadedFile2
												? this.state.uploadedFile2.name.length > 60
													? this.state.uploadedFile2.name.substring(0, 60 - 3) + '...'
													: this.state.uploadedFile2.name
												: l[localStorage.getItem('language')]['noFilesUploaded']}
										</DialogContentText>
									</div>
									{this.state.uploadedFile2 ? (
										!this.checkExtension(this.state.uploadedFile2.name, true) ? (
											<DialogContentText
												style={{ fontSize: 13, marginTop: 8, color: 'red' }}
											>
												{l[localStorage.getItem('language')]['extensionProductError']}
											</DialogContentText>
										) : null
									) : null}
								</>
							) : null}
							{this.state.picNum3 ? (
								<>
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
										}}
									>
										<Button
											style={{
												marginBottom: '16px',
											}}
											variant='contained'
											color='primary'
											onClick={() => {
												this.attacherRef3.click()
											}}
											startIcon={<CloudUploadIcon />}
										>
											<b>Upload</b>
										</Button>
										<DialogContentText style={{ marginTop: 16 }}>
											{this.state.uploadedFile3
												? this.state.uploadedFile3.name.length > 60
													? this.state.uploadedFile3.name.substring(0, 60 - 3) + '...'
													: this.state.uploadedFile3.name
												: l[localStorage.getItem('language')]['noFilesUploaded']}
										</DialogContentText>
									</div>
									{this.state.uploadedFile3 ? (
										!this.checkExtension(this.state.uploadedFile3.name, true) ? (
											<DialogContentText
												style={{ fontSize: 13, marginTop: 8, color: 'red' }}
											>
												{l[localStorage.getItem('language')]['extensionProductError']}
											</DialogContentText>
										) : null
									) : null}
								</>
							) : null}
							{this.state.picNum4 ? (
								<>
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
										}}
									>
										<Button
											style={{
												marginBottom: '16px',
											}}
											variant='contained'
											color='primary'
											onClick={() => {
												this.attacherRef4.click()
											}}
											startIcon={<CloudUploadIcon />}
										>
											<b>Upload</b>
										</Button>
										<DialogContentText style={{ marginTop: 16 }}>
											{this.state.uploadedFile4
												? this.state.uploadedFile4.name.length > 60
													? this.state.uploadedFile4.name.substring(0, 60 - 3) + '...'
													: this.state.uploadedFile4.name
												: l[localStorage.getItem('language')]['noFilesUploaded']}
										</DialogContentText>
									</div>
									{this.state.uploadedFile4 ? (
										!this.checkExtension(this.state.uploadedFile4.name, true) ? (
											<DialogContentText
												style={{ fontSize: 13, marginTop: 8, color: 'red' }}
											>
												{l[localStorage.getItem('language')]['extensionProductError']}
											</DialogContentText>
										) : null
									) : null}
								</>
							) : null}
							{this.state.picNum5 ? (
								<>
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
										}}
									>
										<Button
											style={{
												marginBottom: '16px',
											}}
											variant='contained'
											color='primary'
											onClick={() => {
												this.attacherRef5.click()
											}}
											startIcon={<CloudUploadIcon />}
										>
											<b>Upload</b>
										</Button>
										<DialogContentText style={{ marginTop: 16 }}>
											{this.state.uploadedFile5
												? this.state.uploadedFile5.name.length > 60
													? this.state.uploadedFile5.name.substring(0, 60 - 3) + '...'
													: this.state.uploadedFile5.name
												: l[localStorage.getItem('language')]['noFilesUploaded']}
										</DialogContentText>
									</div>

									{this.state.uploadedFile5 ? (
										!this.checkExtension(this.state.uploadedFile5.name, true) ? (
											<DialogContentText
												style={{ fontSize: 13, marginTop: 8, color: 'red' }}
											>
												{l[localStorage.getItem('language')]['extensionProductError']}
											</DialogContentText>
										) : null
									) : null}
								</>
							) : null}
							{this.state.picNum6 ? (
								<>
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
										}}
									>
										<Button
											style={{
												marginBottom: '16px',
												marginRight: '20px',
											}}
											variant='contained'
											color='primary'
											onClick={() => {
												this.attacherRef6.click()
											}}
											startIcon={<CloudUploadIcon />}
										>
											<b>Upload</b>
										</Button>
										<DialogContentText style={{ marginTop: 16 }}>
											{this.state.uploadedFile6
												? this.state.uploadedFile6.name.length > 60
													? this.state.uploadedFile6.name.substring(0, 60 - 3) + '...'
													: this.state.uploadedFile6.name
												: l[localStorage.getItem('language')]['noFilesUploaded']}
										</DialogContentText>
									</div>
									{this.state.uploadedFile6 ? (
										!this.checkExtension(this.state.uploadedFile6.name, true) ? (
											<DialogContentText
												style={{ fontSize: 13, marginTop: 8, color: 'red' }}
											>
												{l[localStorage.getItem('language')]['extensionProductError']}
											</DialogContentText>
										) : null
									) : null}
								</>
							) : null}
							{this.state.uploadedProgress === 'Uploading...' &&
							this.state.uploadedFile1 ? (
								<ProgressBar
									width='200px'
									margin='20px'
									completed={this.state.percentage}
								/>
							) : null}
						</div>
						{this.state.picNum === 7 ? null : (
							<button
								onClick={() => {
									this.setState({ picNum: this.state.picNum + 1 })
									console.log(this.state.picNum)
									switch (this.state.picNum) {
										case 2:
											this.setState({ picNum2: true })
											break
										case 3:
											this.setState({ picNum3: true })
											break
										case 4:
											this.setState({ picNum4: true })
											break
										case 5:
											this.setState({ picNum5: true })
											break
										case 6:
											this.setState({ picNum6: true })
											break
									}
								}}
								style={{
									display: 'flex',
									alignSelf: 'center',
									justifyContent: 'center',
									paddingTop: 20,
								}}
								className='button__header'
							>
								<img
									src='https://img.icons8.com/pastel-glyph/50/ffffff/plus--v1.png'
									alt='icons'
								/>
							</button>
						)}

						<div>
							<input
								id='uploader'
								onChange={(event: any) => {
									this.setState({ uploadedFile1: event.target.files[0] })
									console.log(event.target.files[0])
								}}
								style={{ display: 'none' }}
								type='file'
								ref={(ref: any) => {
									this.attacherRef1 = ref
									let uploader = document.getElementById('uploader')
									uploader.addEventListener('loadedmetadata', function () {
										console.log('width:', this.videoWidth)
										console.log('height:', this.videoHeight)
									})
								}}
							/>
							<input
								id='uploader'
								onChange={(event: any) => {
									this.setState({ uploadedFile2: event.target.files[0] })
									console.log(event.target.files[0])
								}}
								style={{ display: 'none' }}
								type='file'
								ref={(ref: any) => {
									this.attacherRef2 = ref
									let uploader = document.getElementById('uploader')
									uploader.addEventListener('loadedmetadata', function () {
										console.log('width:', this.videoWidth)
										console.log('height:', this.videoHeight)
									})
								}}
							/>
							<input
								id='uploader'
								onChange={(event: any) => {
									this.setState({ uploadedFile3: event.target.files[0] })
									console.log(event.target.files[0])
								}}
								style={{ display: 'none' }}
								type='file'
								ref={(ref: any) => {
									this.attacherRef3 = ref
									let uploader = document.getElementById('uploader')
									uploader.addEventListener('loadedmetadata', function () {
										console.log('width:', this.videoWidth)
										console.log('height:', this.videoHeight)
									})
								}}
							/>
							<input
								id='uploader'
								onChange={(event: any) => {
									this.setState({ uploadedFile4: event.target.files[0] })
									console.log(event.target.files[0])
								}}
								style={{ display: 'none' }}
								type='file'
								ref={(ref: any) => {
									this.attacherRef4 = ref
									let uploader = document.getElementById('uploader')
									uploader.addEventListener('loadedmetadata', function () {
										console.log('width:', this.videoWidth)
										console.log('height:', this.videoHeight)
									})
								}}
							/>
							<input
								id='uploader'
								onChange={(event: any) => {
									this.setState({ uploadedFile5: event.target.files[0] })
									console.log(event.target.files[0])
								}}
								style={{ display: 'none' }}
								type='file'
								ref={(ref: any) => {
									this.attacherRef5 = ref
									let uploader = document.getElementById('uploader')
									uploader.addEventListener('loadedmetadata', function () {
										console.log('width:', this.videoWidth)
										console.log('height:', this.videoHeight)
									})
								}}
							/>
							<input
								id='uploader'
								onChange={(event: any) => {
									this.setState({ uploadedFile6: event.target.files[0] })
									console.log(event.target.files[0])
								}}
								style={{ display: 'none' }}
								type='file'
								ref={(ref: any) => {
									this.attacherRef6 = ref
									let uploader = document.getElementById('uploader')
									uploader.addEventListener('loadedmetadata', function () {
										console.log('width:', this.videoWidth)
										console.log('height:', this.videoHeight)
									})
								}}
							/>
						</div>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => this.setState({ mode: 'none' })} color='primary'>
							Cancel
						</Button>
						<Button
							onClick={async () => {
								if (!this.state.uploadedFile && !this.state.uploadedFile1) return
								let form = new FormData()
								form.append('thumbnail', this.state.uploadedFile)
								form.append('uploadedFile1', this.state.uploadedFile1)
								form.append('uploadedFile2', this.state.uploadedFile2)
								form.append('uploadedFile3', this.state.uploadedFile3)
								form.append('uploadedFile4', this.state.uploadedFile4)
								form.append('uploadedFile5', this.state.uploadedFile5)
								form.append('uploadedFile6', this.state.uploadedFile6)
								form.append('post_title', this.state.post_title)
								form.append('post_type', 'merchandise')
								form.append('post_description', this.state.post_description)
								form.append('post_price', this.state.post_price)
								form.append('post_category', this.state.productType)
								form.append('product_type', this.state.productType)
								if (this.state.productType === 'Sport') {
									form.append('total_session', parseInt(this.state.nSession || 0))
									form.append('start_date', new Date(this.state.date).toISOString())
									form.append('validity', parseInt(this.state.validity || 0))
									form.append('session_price', parseInt(this.state.sessionPrice || 0))
								}
								this.setState({ uploadedProgress: 'Uploading...' })
								await axios.post(`${baseURL}/post/upload`, form, {
									headers: {
										'X-Auth-Token': localStorage.getItem('afroboostauth'),
									},
									onUploadProgress: this.uploadProgress,
								})
								setTimeout(
									alert(
										'Your post has been published successfully. You can see it on your profile page.',
									),
									1000,
								)
								this.setState({
									mode: 'none',
									post_title: '',
									post_description: '',
									post_price: '0.00',
									uploadedFile: undefined,
									uploadDialog: false,
									percentage: 0,
								})
							}}
							color='primary'
						>
							{l[localStorage.getItem('language')]['publish']}
						</Button>
					</DialogActions>
				</Dialog>

				<a href={devURL}>
					<img src={`${baseURL}/header_logo`} alt='logo' id='logo' />
				</a>
				{localStorage.getItem('afroboostauth') !== 'guest' ? (
					<>
						<div className='header-right'>
							<div className='search'>
								<button
									// href="javascript:void(0)"

									className='custom__button'
									onClick={async () => {
										try {
											const data: any = await axios.post(
												`${baseURL}/user/getUser/`,
												{
													username: this.state.searchQuery,
												},
												{
													headers: {
														'X-Auth-Token': localStorage.getItem('afroboostauth'),
													},
												},
											)
											// console.log(data)
											if (data.data.code === 200) {
												// console.log('This is working...user' + baseURL)
												window.location.href =
													`${devURL}/profile/` + this.state.searchQuery
											} else {
												this.setState({ mode: 'not-found' })
											}
										} catch (error) {
											this.setState({ mode: 'not-found' })
										}
									}}
								>
									{' '}
									<span
										style={{
											color: 'white',
											cursor: 'default',
											fontFamily: 'Montserrat',
											height: 23,
											width: 23,
											backgroundColor: '#650072',
											borderRadius: 23,
											paddingLeft: 14,
											paddingRight: 14,
											paddingTop: 14,
											fontWeight: 500,
											paddingBottom: 14,
											lineHeight: 1.4,
											fontSize: 12,
										}}
									>
										Author
									</span>
								</button>
								<input
									onChange={e => this.setState({ searchQuery: e.target.value })}
									placeholder={l[localStorage.getItem('language')]['searchby']}
									autoComplete='off'
									type='text'
									id='search'
								/>
							</div>
						</div>
						<div
							style={{
								display: 'flex',
								flexDirection: 'row',
								marginTop: window.innerWidth < 800 ? 10 : 0,
							}}
						>
							<button
								style={{ marginLeft: 14 }}
								// href="javascript:void(0)"
								onClick={() => {
									localStorage.setItem('newnotification', 'false')
									this.setState({ mode: 'notification' })
								}}
								className='custom__button'
							>
								{/* <reactIonicons.Notifications
                  color={this.state.newNotification ? "#b526b0" : "#ffffff"}
                  height="30px"
                  width="30px"
                  cssClasses="heart-icon"
                /> */}
								<div className='header__icons'>
									<MdNotificationsActive />
								</div>
							</button>
							<button
								style={{ marginLeft: 14 }}
								// href="javascript:void(0)"
								onClick={() => {
									this.setState({ uploadDialog: true })
								}}
								className='custom__button'
							>
								{/* <reactIonicons.CloudUpload
                  color={"#ffffff"}
                  cssClasses="heart-icon"
                  width="32px"
                  height="32px"
                /> */}
								<div className='header__icons'>
									<AiOutlineCloudUpload />
								</div>
							</button>
							<a
								style={{
									display:
										localStorage.getItem('afroboostid') === '4' ? 'inline' : 'none',
									marginLeft: 14,
								}}
								href='/members'
								onClick={() => {}}
							>
								{/* <reactIonicons.People
                  color={"#ffffff"}
                  cssClasses="heart-icon"
                  width="32px"
                  height="32px"
                /> */}

								<div className='header__icons'>
									<BsPeopleFill />
								</div>
							</a>
							<a
								style={{ marginLeft: 14, marginRight: 10 }}
								onClick={() => {
									localStorage.setItem('newmessage', 'false')
								}}
								href='/messages'
							>
								{/* <reactIonicons.Mail
                  color={this.state.newMessage ? "#b526b0" : "#ffffff"}
                  cssClasses="heart-icon"
                  width="32px"
                  height="32px"
                /> */}
								<div className='header__icons'>
									<AiOutlineMail />
								</div>
							</a>
						</div>
					</>
				) : null}
				{localStorage.getItem('afroboostauth') === 'guest' && (
					<div
						className='header-right'
						style={{ display: 'flex', justifyContent: 'flex-end' }}
					>
						<button
							// href="javascript:void(0)"
							onClick={() => {
								this.setState({ uploadDialog: true })
							}}
							className='custom__button'
						>
							{/* <reactIonicons.CloudUpload
                  color={"#ffffff"}
                  cssClasses="heart-icon"
                  width="32px"
                  height="32px"
                /> */}
							<div className='header__icons'>
								<AiOutlineCloudUpload />
							</div>
						</button>
					</div>
				)}
			</div>
		)
	}
}

export default withToast(Header)
// export default Header;
