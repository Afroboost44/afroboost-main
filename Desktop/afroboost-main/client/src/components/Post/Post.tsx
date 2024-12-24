// @ts-nocheck
import React, { Component } from 'react'
import './Post.css'
import AudioSpectrum from 'react-audio-spectrum'
import axios from 'axios'
import Linkify from 'react-linkify'
import ReactPlayer from 'react-player'
import Comment from '../Comment/Comment'
import Slide from '@material-ui/core/Slide'
import { Switch } from '@material-ui/core'
import ReactAudioPlayer from 'react-audio-player'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DirectionsRun from '@material-ui/icons/DirectionsRun'
import DialogTitle from '@material-ui/core/DialogTitle'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Badge from '@material-ui/core/Badge'
import Select from '@material-ui/core/Select'
import DatePicker from 'react-datepicker'
import 'react-responsive-carousel/lib/styles/carousel.min.css' // requires a loader
import { Carousel } from 'react-responsive-carousel'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import Afropost from '../Afropost/Afropost'

import 'react-datepicker/dist/react-datepicker.css'
import {
	FacebookShareCount,
	FacebookShareButton,
	FacebookMessengerShareButton,
	FacebookMessengerIcon,
	WhatsappShareButton,
	FacebookIcon,
	WhatsappIcon,
} from 'react-share'
import PopupUserProducts from '../Subscriptions/PopupUserProducts'
import CircularProgress from '@material-ui/core/CircularProgress'
import English from '../../english'
import France from '../../france'
import Germany from '../../germany'
import Spain from '../../spain'
import { BiImage, BiMusic, BiPause, BiVideoRecording } from 'react-icons/bi'
import { BsPencilFill, BsThreeDots } from 'react-icons/bs'
import { MdEmail } from 'react-icons/md'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import {
	IoArrowForwardCircleOutline,
	IoBrushOutline,
	IoCartOutline,
	IoChatbubblesOutline,
	IoEyeOffOutline,
	IoEyeOutline,
	IoPeopleCircle,
	IoPlayForward,
	IoTimerOutline,
	IoTrashOutline,
} from 'react-icons/io5'
import { baseURL, devURL } from '../../api'
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
	match: any
}

interface IComment {
	commentID: number
	posterID: number
	parentID: number
	posterName: string
	comment: string
	commenterUsername: string
	timestamp: number
}

interface IAfropost {
	post_title: string
	post_description: string
	post_price: string
	mode: string
	postID: number
	postTitle: string
	postDate: Date
	postBoosted: boolean
	postPrice: number
	posterUsername: string
	posterName: string
	posterID: number
	postType: string
	postDescription: string
	likeCount: number
	saved: boolean
	liked: boolean
	paid: boolean
	comments: IComment[]
}
interface IState {
	postsList: IAfropost[]
	fileName: string
	post?: IAfropost
	autoplay: boolean
	boostPrice: number
	mode: string
	chosenDate: Date
}
class Post extends Component<IProps, IState> {
	commentBoxRef?: HTMLInputElement
	playlist: IAfropost[]
	constructor(props: any) {
		super(props)
		this.state = {
			fileName: '',
			mode: 'none',
			boostPrice: 0,
			autoplay: localStorage.getItem('autoplay') === 'true',
			// autoplay: true,
			chosenDate: new Date(),
			toggleEdit: false,
			quantity: 1,
			size: 'M',
			fitnessSub: 'monthly_price',
			loading: true,
			carouselNum: 1,
			currentPost: 0,
			product_type: '',
			sub_monthly: '',
			sub_quarterly: '',
			sub_annual: '',
			monthly_price: '',
			quarterly_price: '',
			annual_price: '',
			mediaType: [],
			recommendedProducts: [],
			recommendedPosts: [],
			replies: [],
			afroboostPlayer: undefined,
			getPostID: undefined,
			editingCommentID: undefined,
			editingComment: undefined,
			// For social share
			toggleLinkShare: false,
			customLinkShare: '',
			loadingMedia: false,
			showProductDetails: false,
			currentSlide: 0,
		}
		this.removeComment = this.removeComment.bind(this)
		this.playlist = []
		axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*'
		this.replyBoxRef = {}
	}
	isSafari =
		/constructor/i.test(window.HTMLElement) ||
		(function (p) {
			return p.toString() === '[object SafariRemoteNotification]'
		})(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification))

	async refetchPosts() {
		const homepageData = await axios.post(
			`${baseURL}/post/homepage`,
			{},
			{
				headers: {
					'X-Auth-Token': localStorage.getItem('afroboostauth'),
				},
			},
		)
		this.playlist = homepageData.data.message
		this.changeInputRef = this.changeInputRef.bind(this)
	}

	changeInputRef(newInput) {
		this.setState({ mode: 'replyComment' })
		this.commentBoxRef.value = newInput
	}

	removeComment = (commentID: number) => {
		let tmpArray = this.state.post?.comments
		if (!tmpArray) return
		for (let i = 0; i < tmpArray.length; i++) {
			if (tmpArray[i].commentID === commentID) {
				tmpArray.splice(i, 1)
				break
			}
		}

		this.setState((prevState: any) => ({
			post: { ...prevState.post, comments: tmpArray },
		}))
	}

	async getAboutPostID() {
		try {
			const id = await axios.get(`${baseURL}/post/getAboutUsPost`, {
				headers: {
					'X-Auth-Token': localStorage.getItem('afroboostauth'),
				},
			})
			this.setState({ getPostID: id.data.message })
			return id.data.message
		} catch (error) {
			console.log(error)
		}
	}

	async carouselCheck() {
		this.setState({ currentPost: 0, loadingMedia: true })
		let response = undefined
		let type = undefined
		do {
			try {
				response = await axios.get(
					`${baseURL}/imageno/${this.props.match.params.id}/${this.state.currentPost}`,
				)
				type = await axios.get(
					`${baseURL}/imagenotype/${this.props.match.params.id}/${this.state.currentPost}`,
				)
				this.state.mediaType.push(type.data.message)

				this.state.currentPost += 1
			} catch (error) {
				response = {
					status: 404,
				}
				this.setState(
					{
						carouselNum: this.state.currentPost - 1,
						loadingMedia: false,
					},
					() => {
						console.log('Changed to ', this.state.carouselNum)
					},
				)
			}
		} while (response.status === 200)
	}

	async getRecommended() {
		try {
			const data = await axios.get(`${baseURL}/post/getRecommended`, {
				headers: {
					'X-Auth-Token': localStorage.getItem('afroboostauth'),
				},
			})
			this.setState({
				recommendedProducts: data.data.message,
				recommendedPosts: data.data.message2,
			})
		} catch (error) {
			console.log(error)
		}
	}
	async componentDidMount() {
		this.carouselCheck()
		this.refetchPosts()
		this.getAboutPostID()

		// set the default share link
		// this.setState({ customLinkShare: window.location.href });
		try {
			const boostPrice = await axios.get(`${baseURL}/post/boostprice`, {
				headers: {
					'X-Auth-Token': localStorage.getItem('afroboostauth'),
				},
			})
			this.setState({ boostPrice: boostPrice.data.price })
		} catch (error) {
			window.location.href = baseURL
		}
		try {
			const data = await axios.post(
				`${baseURL}/post/refetch`,
				{
					id: this.props.match.params.id,
				},
				{
					headers: {
						'X-Auth-Token': localStorage.getItem('afroboostauth'),
					},
				},
			)

			this.setState({
				post_title: data.data.postTitle,
			})

			this.allComments = data.data.message.comments

			this.replies = {}
			for (let i = 0; i < this.allComments.length; i++) {
				if (this.allComments[i].parentID) {
					if (!this.replies[this.allComments[i].parentID])
						this.replies[this.allComments[i].parentID] = []
					this.replies[this.allComments[i].parentID].push(this.allComments[i])
				}
			}

			this.setState({
				post: data.data.message,
				post_title: data.data.message.postTitle,
				post_description: data.data.message.postDescription,
				post_price: data.data.message.postPrice,
				product_type: data.data.message.productType,
				sub_monthly: data.data.message.subMonthly,
				sub_quarterly: data.data.message.subQuarterly,
				sub_annual: data.data.message.subAnnual,
				monthly_price: data.data.message.monthlyPrice,
				quarterly_price: data.data.message.quarterlyPrice,
				annual_price: data.data.message.annualPrice,
				total_session: data.data.message.totalSession,
				session_price: data.data.message.sessionPrice,
				start_date: data.data.message.startDate,
				post_category: data.data.message.postCategory,
			})
		} catch (error) {
			console.log(error)
			//window.location.href = "https://afroboost.ch/";
		}
		this.getRecommended()
	}

	handleSlideChange = currentIndex => {
		console.log('Slide change')
		this.setState({ currentSlide: currentIndex })
	}

	// const history=useHistory();
	render() {
		if (!this.state.post) return <div></div>
		console.log(this.state.mediaType)
		return (
			<div className='post-page' style={{ marginBottom: 40 }}>
				<Helmet>
					<meta charSet='utf-8' />
					<title>{this.state.post?.postTitle}</title>
					<meta
						property='og:url'
						content={`https://l.facebook.com/l.php?u=https%3A%2F%2F${
							this.state.customLinkShare
								? this.state.customLinkShare
								: window.location.href
						}`}
					/>
					<meta property='og:description' content={this.state.post?.postDescription} />
					{/* <meta property="og:image" content={"${baseURL}/profileImage/" + this.state.post?.posterID.toString()} />
            <meta property="og:image:secure_url" content={"${baseURL}/profileImage/" + this.state.post?.posterID.toString()} /> */}
					<meta property='fb:app_id' content='885375138823671' />
				</Helmet>
				{/* Products that a user bought */}
				<PopupUserProducts
					postId={this.state.post?.postID}
					show={this.state.showProductDetails}
					onClose={() => this.setState({ showProductDetails: false })}
				/>
				{/* Dialog for sharing link */}
				<Dialog
					keepMounted
					TransitionComponent={Transition}
					open={this.state.toggleLinkShare}
					aria-labelledby='form-dialog-title1'
					fullWidth={true}
				>
					<DialogTitle id='form-dialog-title1'>
						{/* {l[localStorage.getItem("language")]["liveStream"]} */}
						SHARE ON SOCIAL
					</DialogTitle>
					<DialogContent>
						<DialogContentText>You can paste a custom link here.</DialogContentText>
						<TextField
							autoFocus
							margin='dense'
							onChange={(e: any) => {
								this.setState({
									customLinkShare: e.target.value,
								})
							}}
							value={this.state.customLinkShare}
							label={'Link'}
							type='text'
							fullWidth
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => this.setState({ toggleLinkShare: false })}>
							CANCEL
						</Button>
						<Button onClick={() => this.setState({ toggleLinkShare: false })}>
							CONFIRM
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
									`${baseURL}/post/setevent`,
									{
										id: this.state.post?.postID,
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
					open={this.state.mode === 'editComment'}
					aria-labelledby='form-dialog-title'
					style={{ padding: 30 }}
				>
					<DialogTitle id='form-dialog-title'>Edit your comment</DialogTitle>
					<TextField
						margin='dense'
						id='edit'
						type='text'
						value={this.state.editingComment}
						onChange={(event: any) => {
							this.setState({ editingComment: event.target.value })
						}}
						fullWidth
						multiline
						helperText='Edit your comment'
					/>
					<DialogActions>
						<Button
							color='primary'
							onClick={async () => {
								this.setState({ mode: 'none' })
								await axios.post(
									`${baseURL}/post/editComment`,
									{
										comment: this.state.editingComment,
										id: this.state.editingCommentID,
									},
									{
										headers: {
											'X-Auth-Token': localStorage.getItem('afroboostauth'),
										},
									},
								)
								window.location.reload()
							}}
						>
							Done
						</Button>
					</DialogActions>
				</Dialog>
				<Dialog
					keepMounted
					TransitionComponent={Transition}
					open={this.state.mode === 'nomoney'}
					aria-labelledby='form-dialog-title'
				>
					<DialogTitle id='form-dialog-title'>
						{' '}
						{l[localStorage.getItem('language')]['insufficientFunds']}
					</DialogTitle>
					<DialogContent>
						<DialogContentText id='alert-dialog-slide-description'>
							{l[localStorage.getItem('language')]['pleaseDeposit']}
						</DialogContentText>
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
							onClick={() => {
								window.location.href = `${devURL}/transfer`
							}}
							color='primary'
						>
							{l[localStorage.getItem('language')]['depostiNow']}
						</Button>
					</DialogActions>
				</Dialog>
				<Dialog
					keepMounted
					TransitionComponent={Transition}
					open={this.state.mode === 'delete'}
					aria-labelledby='form-dialog-title'
				>
					<DialogTitle id='form-dialog-title'>
						{' '}
						{l[localStorage.getItem('language')]['deletePost']}
					</DialogTitle>
					<DialogContent>
						<DialogContentText id='alert-dialog-slide-description'>
							{l[localStorage.getItem('language')]['deletePostMessage']}
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => this.setState({ mode: 'none' })} color='primary'>
							No
						</Button>
						<Button
							onClick={async () => {
								await axios.get(`${baseURL}/post/delete/` + this.state.post?.postID, {
									headers: {
										'X-Auth-Token': localStorage.getItem('afroboostauth'),
									},
								})
								window.location.href = `${devURL}/profile/${localStorage.getItem(
									'afroboostusername',
								)}`
							}}
							color='primary'
						>
							Yes
						</Button>
					</DialogActions>
				</Dialog>
				{/* Modal for editing post */}
				<Dialog
					keepMounted
					TransitionComponent={Transition}
					open={this.state.mode === 'edit'}
					aria-labelledby='form-dialog-title'
				>
					<DialogTitle id='form-dialog-title'>
						{' '}
						{l[localStorage.getItem('language')]['editPost']}
					</DialogTitle>
					<DialogContent>
						<TextField
							autoFocus
							margin='dense'
							type='text'
							value={this.state.post_title}
							onChange={(event: any) => {
								this.setState({ post_title: event.target.value })
							}}
							fullWidth
						/>

						<TextField
							margin='dense'
							id='description'
							type='text'
							value={this.state.post_description}
							onChange={(event: any) => {
								this.setState({ post_description: event.target.value })
							}}
							fullWidth
							multiline
						/>
						<TextField
							margin='dense'
							id='number'
							type='number'
							onChange={(event: any) => {
								this.setState({ post_price: event.target.value })
							}}
							value={this.state.post_price}
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
								form.append('post_id', this.state.post.postID)
								form.append('post_title', this.state.post_title)
								form.append('post_description', this.state.post_description)
								form.append('post_price', this.state.post_price)
								this.setState({ uploadedProgress: 'Uploading...' })
								const request = await axios.post(`${baseURL}/post/updatepost`, form, {
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
				{/*post-boost*/}
				<Dialog
					open={this.state.mode === 'post-boost'}
					TransitionComponent={Transition}
					keepMounted
					onClose={() => {
						this.setState({ mode: 'none' })
					}}
					aria-labelledby='alert-dialog-slide-title'
					aria-describedby='alert-dialog-slide-description'
				>
					<DialogTitle id='alert-dialog-slide-title'>
						{l[localStorage.getItem('language')]['paymentConfirmation']}
					</DialogTitle>
					<DialogContent>
						<DialogContentText id='alert-dialog-slide-description'>
							CHF {this.state.boostPrice}?
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button
							onClick={() => {
								this.setState({ mode: 'none' })
							}}
							color='primary'
						>
							Cancel
						</Button>

						<Button
							onClick={async () => {
								try {
									const request = await axios.post(
										`${baseURL}/post/boost`,
										{
											id: this.state.post?.postID,
										},
										{
											headers: {
												'X-Auth-Token': localStorage.getItem('afroboostauth'),
											},
										},
									)
									console.log('Bhau kucj to chal raha hei')
									console.log(request.data)
									if (request.data === 'OK') {
										window.location.href = `${devURL}`
									} else {
										alert(
											request.data.message +
												"(Veuillez ajouter de l'argent, puis réessayer)",
										)
									}
								} catch (error) {
									console.log(error)
									this.setState({ mode: 'nomoney' })
								}
							}}
							color='primary'
						>
							OK
						</Button>
					</DialogActions>
				</Dialog>
				{/* confirm purshase */}
				<Dialog
					open={this.state.mode === 'confirm-buy-2'}
					TransitionComponent={Transition}
					keepMounted
					onClose={() => {
						this.setState({ mode: 'none' })
					}}
					aria-labelledby='alert-dialog-slide-title'
					aria-describedby='alert-dialog-slide-description'
				>
					<DialogTitle id='alert-dialog-slide-title'>
						{l[localStorage.getItem('language')]['paymentConfirmation']}
					</DialogTitle>
					<DialogContent>
						<DialogContentText id='alert-dialog-slide-description'>
							CHF{' '}
							{(() => {
								if (this.state.post?.postType === 'merchandise') {
									let price = this.state.post?.postPrice
									return this.state.quantity * price
								} else if (this.state.mode === 'confirm-boost') {
									return this.state.boostPrice
								} else
									switch (this.state.fitnessSub) {
										case 'monthly_price':
											return this.state.monthly_price
										case 'quarterly_price':
											return this.state.quarterly_price
										case 'annual_price':
											return this.state.annual_price
									}
							})()}
							?
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button
							onClick={() => {
								this.setState({ mode: 'none' })
							}}
							color='primary'
						>
							Cancel
						</Button>

						<Button
							onClick={async () => {
								try {
									let promises = []
									const data = {
										id: this.state.post?.postID,
										additional_tag: this.state.fitnessSub,
										quantity: this.state.quantity,
										size: this.state.size,
										value: this.state.post_price,
										total_session: this.state.total_session,
									}
									const arr = [...Array(parseInt(this.state.quantity)).keys()]
									// arr.forEach(item => {
									promises.push(
										axios.post(`${baseURL}/post/buy`, data, {
											headers: {
												'X-Auth-Token': localStorage.getItem('afroboostauth'),
											},
										}),
									)
									// })
									const res = await Promise.all(promises)
									console.log(res)
									// console.log('Debuge')
									window.location.href = `${devURL}/library`
								} catch (error) {
									console.log(error)
									this.setState({ mode: 'nomoney' })
								}
							}}
							color='primary'
						>
							OK
						</Button>
					</DialogActions>
				</Dialog>
				{/* Dialog for purshasing products */}
				{this.state.post?.postType === 'merchandise' ? (
					<Dialog
						open={this.state.mode === 'confirm-buy'}
						TransitionComponent={Transition}
						keepMounted
						fullWidth={true}
						aria-labelledby='alert-dialog-slide-title'
						aria-describedby='alert-dialog-slide-description'
					>
						<DialogTitle id='alet-dialog-slide-title'>
							{l[localStorage.getItem('language')]['productLabel']}{' '}
						</DialogTitle>
						<DialogContent>
							<DialogContentText>
								<>
									{l[localStorage.getItem('language')]['oneProductPrice']}{' '}
									{this.state.post?.postPrice}{' '}
									{this.state.post_category === 'Sport' && (
										<span style={{ color: 'grey', fontSize: '15px' }}>
											(Nombre de sessions:{' '}
											{<Badge color='grey'>{this.state.total_session}</Badge>})
										</span>
									)}
								</>
							</DialogContentText>
							<div style={{ paddingBottom: 50 }}>
								<div
									style={{
										display: 'flex',
										flexDirection: 'row',
										flex: 1,
										justifyContent: 'space-around',
									}}
								>
									<FormControl style={{ width: '100%' }}>
										{this.state.post_category !== 'Sport' && (
											<InputLabel id='demo-simple-select-label'>
												{l[localStorage.getItem('language')]['quantity']}
											</InputLabel>
										)}
										{this.state.post_category === 'Sport' ? (
											<TextField
												margin='dense'
												InputProps={{ inputProps: { min: 1 } }}
												style={{ margin: 0, marginBottom: '12px' }}
												label={"Nombre d'abonnements"}
												placeholder="Nombre d'abonnements"
												type='number'
												// onChange={(e: any) => {
												// 	this.setState({ quantity: e.target.value })
												// }}
												onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
													const userInput = parseInt(e.target.value)
													// Check if the user input is within the allowed range
													if (userInput >= 1 && userInput <= this.state.total_session) {
														this.setState({ quantity: userInput })
													}
												}}
												value={this.state.quantity}
												fullWidth
											/>
										) : (
											<>
												<Select
													labelId='demo-simple-select-label'
													id='demo-simple-select'
													value={this.state.quantity}
													onChange={e => this.setState({ quantity: e.target.value })}
												>
													<MenuItem value={1}>1</MenuItem>
													<MenuItem value={2}>2</MenuItem>
													<MenuItem value={3}>3</MenuItem>
													<MenuItem value={4}>4</MenuItem>
													<MenuItem value={5}>5</MenuItem>
													<MenuItem value={10}>10</MenuItem>
												</Select>
											</>
										)}
									</FormControl>
									{this.state.product_type === 'T-Shirt' ||
									this.state.product_type === 'Leggings' ? (
										<FormControl style={{ width: 80 }}>
											<InputLabel id='demo-simple-select-label'>
												{l[localStorage.getItem('language')]['size']}
											</InputLabel>
											<Select
												labelId='demo-simple-select-label'
												id='demo-simple-select'
												value={this.state.size}
												onChange={e => this.setState({ size: e.target.value })}
											>
												<MenuItem value={'S'}>S</MenuItem>
												<MenuItem value={'M'}>M</MenuItem>
												<MenuItem value={'L'}>L</MenuItem>
												<MenuItem value={'XL'}>XL</MenuItem>
											</Select>
										</FormControl>
									) : null}
								</div>
							</div>
						</DialogContent>
						<DialogActions>
							<Button onClick={() => this.setState({ mode: 'none' })} color='primary'>
								Cancel
							</Button>
							<Button
								onClick={() => this.setState({ mode: 'confirm-buy-2' })}
								color='primary'
							>
								Next
							</Button>
						</DialogActions>
					</Dialog>
				) : this.state.annual_price ? (
					<Dialog
						open={this.state.mode === 'confirm-buy'}
						TransitionComponent={Transition}
						keepMounted
						fullWidth={true}
						aria-labelledby='alert-dialog-slide-title'
						aria-describedby='alert-dialog-slide-description'
					>
						<DialogTitle id='alet-dialog-slide-title'>
							{l[localStorage.getItem('language')]['fitnessSub']}
						</DialogTitle>
						<DialogContent>
							<DialogContentText>
								{l[localStorage.getItem('language')]['fitnessSubText']}
							</DialogContentText>
							<div
								style={{
									display: 'flex',
									flexDirection: 'row',
									flex: 1,
									justifyContent: 'space-around',
								}}
							>
								<FormControl style={{ width: 500 }}>
									<InputLabel id='demo-simple-select-label'>
										{l[localStorage.getItem('language')]['periodTime']}
									</InputLabel>
									<Select
										labelId='demo-simple-select-label'
										id='demo-simple-select'
										value={this.state.fitnessSub}
										onChange={e => this.setState({ fitnessSub: e.target.value })}
									>
										<MenuItem value={'monthly_price'}>
											{l[localStorage.getItem('language')]['monthlySub']}:{' '}
											{this.state.sub_monthly}
										</MenuItem>
										<MenuItem value={'quarterly_price'}>
											{l[localStorage.getItem('language')]['quartSub']}:{' '}
											{this.state.sub_quarterly}
										</MenuItem>
										<MenuItem value={'annual_price'}>
											{l[localStorage.getItem('language')]['annualSub']}:{' '}
											{this.state.sub_annual}
										</MenuItem>
									</Select>
								</FormControl>
							</div>
						</DialogContent>
						<DialogActions>
							<Button onClick={() => this.setState({ mode: 'none' })} color='primary'>
								Cancel
							</Button>
							<Button
								onClick={() => this.setState({ mode: 'confirm-buy-2' })}
								color='primary'
							>
								Next
							</Button>
						</DialogActions>
					</Dialog>
				) : (
					<Dialog
						open={this.state.mode === 'confirm-buy'}
						TransitionComponent={Transition}
						keepMounted
						onClose={() => {
							this.setState({ mode: 'none' })
						}}
						aria-labelledby='alert-dialog-slide-title'
						aria-describedby='alert-dialog-slide-description'
					>
						<DialogTitle id='alert-dialog-slide-title'>
							{l[localStorage.getItem('language')]['paymentConfirmation']}
						</DialogTitle>
						<DialogContent>
							<DialogContentText id='alert-dialog-slide-description'>
								CHF {this.state.post?.postPrice}?
							</DialogContentText>
						</DialogContent>
						<DialogActions>
							<Button
								onClick={() => {
									this.setState({ mode: 'none' })
								}}
								color='primary'
							>
								Cancel
							</Button>
							<Button
								onClick={async () => {
									try {
										const request = await axios.post(
											`${baseURL}/post/buy`,
											{
												id: this.state.post?.postID,
											},
											{
												headers: {
													'X-Auth-Token': localStorage.getItem('afroboostauth'),
												},
											},
										)
										console.log(request)
										window.location.href = `${devURL}/library`
									} catch (error) {
										console.log(error)
										this.setState({ mode: 'nomoney' })
									}
								}}
								color='primary'
							>
								OK
							</Button>
						</DialogActions>
					</Dialog>
				)}
				<Dialog
					open={this.state.mode === 'more'}
					TransitionComponent={Transition}
					keepMounted
					onClose={() => {
						this.setState({ mode: 'none' })
					}}
					aria-labelledby='alert-dialog-slide-title'
					aria-describedby='alert-dialog-slide-description'
				>
					<DialogTitle id='alet-dialog-slide-title'>More actions</DialogTitle>

					<DialogContent>
						<DialogContentText>
							<button
								onClick={() => {
									this.setState({ mode: 'report' })
								}}
								className='post__button more__button'
							>
								Report this post
							</button>
						</DialogContentText>
						<DialogContentText>
							<button
								onClick={() => {
									this.setState({ mode: 'report' })
								}}
								className='post__button more__button'
							>
								Report the author
							</button>
						</DialogContentText>
						<DialogContentText>
							<button
								onClick={() => {
									this.setState({ mode: 'report' })
								}}
								className='post__button more__button'
							>
								Report something else
							</button>
						</DialogContentText>
					</DialogContent>
				</Dialog>
				<Dialog
					open={this.state.mode === 'report'}
					TransitionComponent={Transition}
					keepMounted
					onClose={() => {
						this.setState({ mode: 'none' })
					}}
					aria-labelledby='alert-dialog-slide-title'
					aria-describedby='alert-dialog-slide-description'
				>
					<DialogTitle id='alet-dialog-slide-title'>Explain why...</DialogTitle>
					<DialogContent>
						<TextField
							margin='dense'
							id='edit'
							type='text'
							value={this.state.editingComment}
							onChange={(event: any) => {
								this.setState({ editingComment: event.target.value })
							}}
							fullWidth
							multiline
							helperText='Edit your comment'
						/>
					</DialogContent>
					<DialogActions>
						<Button color='primary'>Submit report</Button>
					</DialogActions>
				</Dialog>
				<div>
					<div style={{ cursor: 'pointer' }}>
						{/* <ArrowBackOutline
              onClick={async () => {
                window.history.back();
              }}
              color={"#fff"}
              height="28px"
              width="28px"
            /> */}
						<div className='post__icon'>{/* <BiSkipPrevious /> */}</div>
					</div>

					{/* post media container */}
					<div className='post-video-and-desc'>
						{this.state.loadingMedia ? (
							<div
								className='post-media-container'
								style={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									width: 500,
									height: 300,
								}}
							>
								<CircularProgress />
							</div>
						) : (
							<div className='post-media-container'>
								{this.state.post ? (
									this.state.post?.postType === 'merchandise' ? (
										<Carousel className='carousel' onChange={this.handleSlideChange}>
											{Array(this.state.carouselNum + 1)
												.fill()
												.map((item, index) => {
													if (this.state.mediaType[index] === 'image') {
														return (
															<img
																src={`${baseURL}/imageno/${this.props.match.params.id}/${index}`}
																alt=''
																style={{
																	height: '600px',
																	objectFit: 'contain',
																}}
															/>
														)
													} else if (this.state.mediaType[index] === 'video') {
														return (
															<ReactPlayer
																width='100%'
																height='100%'
																// playing={this.state.autoplay} //mujtabaautoplay
																style={{
																	backgroundColor: 'black',
																	marginTop: 16,
																	marginLeft: -2,
																	marginBottom: 8,
																}}
																controls={true}
																loop={true}
																url={
																	`${baseURL}/imageno/` +
																	this.props.match.params.id +
																	'/' +
																	index
																}
																playing={
																	this.state.autoplay && index === this.state.currentSlide
																}
															/>
														)
													} else {
														return (
															<div>
																<p style={{ color: 'purple' }}>
																	{' '}
																	{
																		l[localStorage.getItem('language')][
																			'unsupportedFormat'
																		]
																	}
																</p>
															</div>
														)
													}
												})}
										</Carousel>
									) : this.state.post?.postType === 'video' ? (
										<div className='post-video-div'>
											{/* <video controls autoplay="true" width="100%" controlsList="nodownload">
                          <source src={"${baseURL}/video/" +
                                    this.props.match.params.id +
                                    "/" +
                                    localStorage.getItem("afroboostauth") +
                                    "/afroboost_content.mp4"}
                                type="video/webm"/>
                          <source src={"${baseURL}/video/" +
                                    this.props.match.params.id +
                                    "/" +
                                    localStorage.getItem("afroboostauth") +
                                    "/afroboost_content.mp4"} />
                          Sorry, your browser doesn't support embedded videos.
                        </video> */}
											{
												// <div
												//   className="afroboost-player"
												//   ref={(ref) => {
												//     let config = {
												//       sources: [
												//         {
												//           type: "mp4",
												//           src:
												//             "${baseURL}/video/" +
												//             this.props.match.params.id +
												//             "/" +
												//             localStorage.getItem("afroboostauth") +
												//             "/afroboost_content.mp4",
												//         },
												//       ],
												//       ui: {
												//         enabled: true,
												//       },
												//       autoplay: true,
												//       loop: true,
												//     };
												//     if (ref && !this.state.afroboostPlayer) {
												//       let player = IndigoPlayer.init(ref, config);
												//       player.on(IndigoPlayer.Events.STATE_ENDED, () => {
												//         if (!this.state.autoplay) return;
												//         setTimeout(() => {
												//           let queued = -1;
												//           for (let i = 0; i < this.playlist.length; i++) {
												//             if (
												//               this.playlist[i].postID ===
												//               this.state.post?.postID
												//             ) {
												//               queued =
												//                 this.playlist[
												//                   (i + 1) % this.playlist.length
												//                 ].postID;
												//               break;
												//             }
												//           }
												//           if (queued === -1) return;
												//           window.location.href =
												//             "https://afroboost.ch/post/" +
												//             queued.toString();
												//         }, 500);
												//       });
												//       this.setState({ afroboostPlayer: ref });
												//     }
												//   }}
												// ></div>
											}

											<ReactPlayer
												width='100%'
												height='100%'
												onEnded={() => {
													if (!this.state.autoplay) return
													setTimeout(() => {
														let queued = -1
														for (let i = 0; i < this.playlist.length; i++) {
															if (this.playlist[i].postID === this.state.post?.postID) {
																queued =
																	this.playlist[(i + 1) % this.playlist.length].postID
																break
															}
														}
														if (queued === -1) return
														window.location.href = `${devURL}/post/` + queued.toString()
													}, 500)
												}}
												playing={this.state.autoplay}
												loop={true}
												style={{
													backgroundColor: 'black',
													marginTop: 16,
													marginLeft: -2,
													marginBottom: 8,
												}}
												controls={true}
												url={
													`${baseURL}/video/` +
													this.props.match.params.id +
													'/' +
													localStorage.getItem('afroboostauth') +
													'/afroboost_content.mp4'
												}
											/>
										</div>
									) : this.state.post?.postType === 'audio' ? (
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
												crossOrigin='anonymous'
												onEnded={() => {
													if (!this.state.autoplay) return
													setTimeout(() => {
														let queued = -1
														for (let i = 0; i < this.playlist.length; i++) {
															if (this.playlist[i].postID === this.state.post?.postID) {
																queued =
																	this.playlist[(i + 1) % this.playlist.length].postID
																break
															}
														}
														if (queued === -1) return
														window.location.href = `${devURL}/post/` + queued.toString()
													}, 500)
												}}
												style={{
													marginTop: 30,
													width: '100%',
													filter: this.isSafari ? 'invert(0%)' : 'invert(100%)',
												}}
												src={
													`${baseURL}/audio/` +
													this.props.match.params.id +
													'/' +
													localStorage.getItem('afroboostauth') +
													'/afroboost_content.mp3'
												}
												autoPlay
												controls
											/>{' '}
										</div>
									) : (
										<img
											src={`${baseURL}/image/${
												this.props.match.params.id
											}/${localStorage.getItem('afroboostauth')}/afroboost_content.png`}
											width='100%'
											alt=''
										/>
									)
								) : null}
							</div>
						)}

						<div className='post-details' style={{ maxWidth: '25rem' }}>
							<h1
								style={{
									color: 'white',
									marginBottom: 4,
									display: 'flex',
									alignItems: 'center',
								}}
							>
								{this.state.post?.postType === 'audio' ? (
									// <MusicalNotesOutline
									//   color={"#ffffff"}
									//   height="30px"
									//   width="30px"
									//   cssClasses="heart-icon"
									// />
									<div className='post__icon heading__tag'>
										<BiMusic />
									</div>
								) : this.state.post?.postType === 'video' ? (
									// <VideocamOutline
									//   color={"#ffffff"}
									//   height="30px"
									//   width="30px"
									//   cssClasses="heart-icon"
									// />
									<div className='post__icon heading__tag'>
										<BiVideoRecording />
									</div>
								) : (
									// <ImageOutline
									//   color={"#ffffff"}
									//   height="30px"
									//   width="30px"
									//   cssClasses="heart-icon"
									// />
									<div className='post__icon heading__tag'>
										<BiImage />
									</div>
								)}
								<span style={{ marginLeft: 8, cursor: 'default', fontSize: 22 }}>
									{this.state.post?.postTitle} {!this.state.post?.paid && '(Preview)'}
								</span>
							</h1>
							<a href={`${devURL}/profile/` + this.state.post?.posterUsername}>
								<div className='post-poster'>
									<div
										className='image'
										style={{
											backgroundImage: `url(${baseURL}/profileImage/${this.state.post?.posterID.toString()})`,
											height: 30,
											width: 30,
											borderRadius: 15,
											marginRight: 8,
											backgroundSize: 'cover',
											backgroundPositionX: 'center',
										}}
									/>
									<img
										style={{ height: 0, width: 0 }}
										src={
											`${baseURL}/profileImage/` + this.state.post?.posterID.toString()
										}
										alt=''
									/>

									<p
										style={{
											color: 'white',
											cursor: 'pointer',
											fontFamily: 'Montserrat',
											fontWeight: 500,
											marginLeft: 12,
											cursor: 'default',
											fontSize: 14,
										}}
									>
										{this.state.post?.posterName}
									</p>
								</div>
							</a>
							<Linkify>
								<p
									className='post__description'
									style={{
										whiteSpace: 'pre-wrap',
										color: 'white',
										cursor: 'default',
										fontFamily: 'Montserrat',
										// maxWidth: '600px',
										fontWeight: 500,
										fontSize: 14,
										marginRight: 0,
									}}
								>
									{this.state.post?.postDescription}
								</p>
							</Linkify>
							<div className='Demo__container'>
								<div className='Demo__some-network'>
									<FacebookShareButton
										url={
											this.state.customLinkShare
												? this.state.customLinkShare
												: window.location.href
										}
										quote={this.state.post?.postTitle}
										className='Demo__some-network__share-button'
									>
										<FacebookIcon size={32} round />
									</FacebookShareButton>
									<div>
										<FacebookShareCount
											url={window.location.href}
											className='Demo__some-network__share-count'
										>
											{count => count}
										</FacebookShareCount>
									</div>
								</div>

								<div className='Demo__some-network'>
									<FacebookMessengerShareButton
										url={
											this.state.customLinkShare
												? this.state.customLinkShare
												: window.location.href
										}
										appId='885375138823671'
										redirectUri={window.location.href}
										className='Demo__some-network__share-button'
									>
										<FacebookMessengerIcon size={32} round />
									</FacebookMessengerShareButton>
								</div>

								<div className='Demo__some-network'>
									<WhatsappShareButton
										url={
											this.state.customLinkShare
												? this.state.customLinkShare
												: window.location.href
										}
										title={this.state.post?.postTitle}
										separator=':: '
										className='Demo__some-network__share-button'
									>
										<WhatsappIcon size={32} round />
									</WhatsappShareButton>
								</div>
								{localStorage.getItem('afroboostauth') !== 'guest' && (
									<div
										onClick={() => this.setState({ toggleLinkShare: true })}
										className='Demo__some-network'
									>
										{/* <Pencil
											color={'#ffffff'}
											height='20px'
											width='20px'
											cssClasses='edit-button-item'
										/> */}
										<div className='post__icon pencil__icon'>
											<BsPencilFill />
										</div>
									</div>
								)}
							</div>
						</div>
					</div>

					{localStorage.getItem('afroboostauth') === 'guest' ? null : (
						<div>
							<div
								className='types'
								style={{
									maxWidth: '750px',
								}}
								style={{ display: 'flex', flexDirection: 'column' }}
							>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										flexDirection: 'row',
										marginTop: '20px',
									}}
								>
									<button
										// href='javascript:void(0)'
										onClick={async () => {
											const data = await axios.post(
												`${baseURL}/post/changeLikeStatus`,
												{
													id: this.state.post?.postID,
												},
												{
													headers: {
														'X-Auth-Token': localStorage.getItem('afroboostauth'),
													},
												},
											)
											this.setState((prevState: any) => ({
												post: {
													...prevState.post,
													liked: data.data.status,
													likeCount: data.data.message,
												},
											}))
										}}
										className='post__button'
									>
										{this.state.post?.liked ? (
											// <Heart
											// 	color={'#ffffff'}
											// 	height='30px'
											// 	width='30px'
											// 	cssClasses='heart-icon'
											// />
											<div className='post__icon'>
												<AiFillHeart />
											</div>
										) : (
											// <HeartOutline
											// 	color={'#ffffff'}
											// 	height='30px'
											// 	width='30px'
											// 	cssClasses='heart-icon'
											// />
											<div className='post__icon'>
												<AiOutlineHeart />
											</div>
										)}
									</button>
									<span
										style={{
											marginRight: 16,
											cursor: 'default',
											color: 'white',
											fontFamily: 'Montserrat',
											fontWeight: 500,
										}}
									>
										{' '}
										{this.state.post?.likeCount}
									</span>
									&nbsp;
									{this.state.post_category === 'Sport' && (
										<>
											{localStorage.getItem('afroboostid') &&
											this.state.post.posterID ===
												parseInt(localStorage.getItem('afroboostid')) ? (
												<Link
													to={`/subscriptions/${this.state.post.postID}`}
													style={{
														display: 'flex',
														alignItems: 'center',
														color: 'white',
													}}
												>
													<div className='heart-icon post__button'>
														{/* <PeopleCircle
															color={'#ac03c2'}
															height='30px'
															width='30px'
															cssClasses='heart-icon'
														/> */}
														<div className='post__icon'>{/* <IoPeopleCircle /> */}</div>
													</div>
													<span
														className='invisible-label-xxl'
														style={{
															textOverflow: 'ellipsis',
															marginLeft: -6,
															cursor: 'default',
															color: 'white',
															fontFamily: 'Montserrat',
															fontWeight: 400,
															fontSize: 14,
														}}
													>
														Participants
													</span>
												</Link>
											) : (
												<Link
													onClick={() => this.setState({ showProductDetails: true })}
													style={{
														display: 'flex',
														alignItems: 'center',
														cursor: 'pointer',
														color: 'white',
													}}
												>
													<div className='heart-icon'>
														<DirectionsRun color={'white'} height='30px' width='30px' />
													</div>
													<span
														className='invisible-label-xxl'
														style={{
															textOverflow: 'ellipsis',
															marginLeft: -6,
															cursor: 'default',
															color: 'white',
															fontFamily: 'Montserrat',
															fontWeight: 400,
															fontSize: 14,
														}}
													>
														Adhésion
													</span>
												</Link>
											)}
										</>
									)}
									{/* <a
                    href="javascript:void(0)"
                    style={{ display: "flex", alignItems: "center" }}
                    onClick={() => {
                      window.location.href =
                        "${baseURL}/meet/id/" +
                        this.state.post?.posterID;
                    }}
                  >
                    <div className="heart-icon">
                      <Radio
                        color={"#ac03c2"}
                        height="30px"
                        width="30px"
                        cssClasses="heart-icon"
                      />
                    </div>
                    <span
                      className="invisible-label-xxl"
                      style={{
                        textOverflow: "ellipsis",
                        marginLeft: -6,
                        cursor: "default",
                        color: "white",
                        fontFamily: "Montserrat",
                        fontWeight: 400,
                        fontSize: 14,
                      }}
                    >
                      Live meeting
                    </span>
                  </a> */}
									&nbsp;
									<button
										// href='javascript:void(0)'
										style={{
											display: 'flex',
											alignItems: 'center',
											marginLeft: 6,
										}}
										onClick={async () => {
											const request = await axios.post(
												`${baseURL}/user/gomessage`,
												{
													targetID: this.state.post?.posterID,
												},
												{
													headers: {
														'X-Auth-Token': localStorage.getItem('afroboostauth'),
													},
												},
											)
											window.location.href =
												`${devURL}/chat/` + request.data.message.toString()
										}}
										className='post__button'
									>
										<div className='heart-icon '>
											{/* <Mail
												color={'#fff'}
												height='30px'
												width='30px'
												cssClasses='heart-icon'
											/> */}
											<div className='post__icon'>
												<MdEmail />
											</div>
										</div>
										<span
											className='invisible-label'
											style={{
												textOverflow: 'ellipsis',
												marginLeft: -6,
												cursor: 'default',
												color: 'white',
												fontFamily: 'Montserrat',
												fontWeight: 400,
												fontSize: 14,
											}}
										>
											{l[localStorage.getItem('language')]['message']}
										</span>
									</button>
									&nbsp;
									<button
										href='javascript:void(0)'
										style={{ display: 'flex', alignItems: 'center' }}
										onClick={async () => {
											localStorage.setItem(
												'autoplay',
												this.state.autoplay ? 'false' : 'true',
											)
											this.setState(prevState => ({
												autoplay: !prevState.autoplay,
											}))
										}}
										className='post__button'
									>
										<div className=''>
											<Switch
												checked={this.state.autoplay}
												checkedIcon={
													<div
														style={{
															marginTop: 0,
															backgroundColor: '#dcdcdc',
															width: 20,
															height: 20,
															borderRadius: '50%',
														}}
													>
														{/* <PlayForward
															style={{ marginBottom: 8.85, marginLeft: 2 }}
															color='#333'
															width='12px'
															height='12px'
														/> */}
														<div
															style={{ marginBottom: 3, marginLeft: 3 }}
															className='autoplay__icon autoplay__iconplay'
														>
															<IoPlayForward />
														</div>
													</div>
												}
												icon={
													<div
														style={{
															marginTop: 0,
															backgroundColor: '#dcdcdc',
															width: 20,
															height: 20,
															borderRadius: '50%',
														}}
													>
														{/* <Pause
															style={{
																marginBottom: 9,
																marginLeft: 0,
																fontSize: 24,
															}}
															color='#333'
															width='12px'
															height='12px'
														/> */}
														<div
															style={{
																marginBottom: 0,
																marginLeft: 0,
																// fontSize: 24,
															}}
															className='autoplay__icon autoplay__iconpause'
														>
															<BiPause />
														</div>
													</div>
												}
												onChange={e => {}}
												name='checkedA'
												inputProps={{ 'aria-label': 'secondary checkbox' }}
											/>
										</div>
										<span
											className='invisible-label-wider'
											style={{
												textOverflow: 'ellipsis',
												marginLeft: -6,
												cursor: 'default',
												color: 'white',
												fontFamily: 'Montserrat',
												fontWeight: 400,
												fontSize: 14,
											}}
										>
											{l[localStorage.getItem('language')]['autoplay']}
										</span>
									</button>
									<button
										href='javascript:void(0)'
										style={{ display: 'flex', alignItems: 'center' }}
										onClick={async () => {
											this.setState({ mode: 'confirm-buy' })
										}}
										className='post__button'
									>
										<div className='heart-icon'>
											{/* <CartOutline
												color={'#ffffff'}
												height='30px'
												width='30px'
												cssClasses='heart-icon'
											/> */}
											<div className='post__icon'>
												<IoCartOutline />
											</div>
										</div>
										<span
											className='invisible-label'
											style={{
												textOverflow: 'ellipsis',
												cursor: 'default',
												color: 'white',
												fontFamily: 'Montserrat',
												fontWeight: 400,
												fontSize: 14,
											}}
										>
											CHF{' '}
											{this.state.monthly_price
												? this.state.monthly_price
												: this.state.post?.postPrice}
										</span>
									</button>
									<button
										onClick={() => this.setState({ mode: 'more' })}
										className='post__button'
									>
										{/* <EllipsisHorizontalOutline
											color={'#ffffff'}
											cssClasses='heart-icon'
											height='30px'
											width='30px'
										/> */}
										<div className='post__icon'>
											<BsThreeDots />
										</div>
									</button>
									{!this.state.post?.postBoosted && (
										<>
											<button
												// href='javascript:void(0)'
												style={{ display: 'flex', alignItems: 'center' }}
												onClick={async () => {
													this.setState({ mode: 'post-boost' })
												}}
												className='post__button'
											>
												<div
													className='heart-icon'
													style={{
														backgroundImage: `url(${devURL}/boost.png)`,
														height: '30px',
														width: '30px',
														borderRadius: 15,
														marginLeft: 8,
														backgroundSize: 'cover',
														backgroundPositionX: 'center',
													}}
												></div>
												<span
													className='invisible-label'
													style={{
														marginLeft: 4,
														cursor: 'default',
														color: 'white',
														fontFamily: 'Montserrat',
														fontWeight: 400,
														marginRight: 16,
														fontSize: 14,
													}}
												>
													{l[localStorage.getItem('language')]['boost']}
												</span>
											</button>
										</>
									)}
									<button
										onClick={() => this.setState({ toggleEdit: !this.state.toggleEdit })}
										style={{
											paddingRight: '10px',
										}}
										className='post__button'
									>
										{/* <ChevronForwardCircleOutline
											color={'#ffffff'}
											height='35px'
											width='35px'
											cssClasses='heart-icon'
											style={{
												display:
													localStorage.getItem('afroboostid') == 4 ||
													localStorage.getItem('afroboostid') == this.state.post?.posterID
														? 'flex'
														: 'none',
											}}
										/> */}
										<div
											className='post__icon'
											style={{
												display:
													localStorage.getItem('afroboostid') === 4 ||
													localStorage.getItem('afroboostid') ===
														this.state.post?.posterID
														? 'flex'
														: 'none',
											}}
										>
											<IoArrowForwardCircleOutline />
										</div>
									</button>
									{!this.state.toggleEdit ? null : (
										<div style={{ display: 'flex', flexDirection: 'row' }}>
											<button
												style={{
													display:
														localStorage.getItem('afroboostid') == 4 ||
														localStorage.getItem('afroboostid') ==
															this.state.post?.posterID
															? 'flex'
															: 'none',
												}}
												// href='javascript:void(0)'
												onClick={async () => {
													this.setState({ mode: 'edit' })
												}}
												className='post__button'
											>
												{/* <BrushOutline
													color={'#ffffff'}
													height='30px'
													width='30px'
													cssClasses='heart-icon'
												/> */}
												<div className='post__iconexpan'>
													<IoBrushOutline />
												</div>
												&nbsp;
											</button>
											<button
												style={{
													display:
														localStorage.getItem('afroboostid') === 4 ||
														localStorage.getItem('afroboostid') ===
															this.state.post?.posterID
															? 'flex'
															: 'none',
												}}
												// href='javascript:void(0)'
												onClick={async () => {
													this.setState({ mode: 'datesetter' })
												}}
												className='post__button'
											>
												{/* <TimerOutline
													color={'#ffffff'}
													height='30px'
													width='30px'
													cssClasses='heart-icon'
												/> */}
												<div className='post__iconexpan'>
													<IoTimerOutline />
												</div>
												&nbsp;
											</button>
											<button
												style={{
													display:
														localStorage.getItem('afroboostid') == 4 ||
														localStorage.getItem('afroboostid') ==
															this.state.post?.posterID
															? 'flex'
															: 'none',
												}}
												// href='javascript:void(0)'
												onClick={async () => {
													this.setState({ mode: 'delete' })
												}}
												className='post__button'
											>
												{/* <TrashOutline
													color={'#ffffff'}
													height='30px'
													width='30px'
													cssClasses='heart-icon'
												/> */}
												<div className='post__iconexpan'>
													<IoTrashOutline />
												</div>
												&nbsp;
											</button>
											<button
												className='post__button'
												style={{
													display:
														localStorage.getItem('afroboostid') == 4 ||
														localStorage.getItem('afroboostid') ==
															this.state.post?.posterID
															? 'flex'
															: 'none',
												}}
												// href='javascript:void(0)'
												onClick={async () => {
													let form = new FormData()
													form.append('post_id', this.state.post?.postID)
													if (this.state.post_title.startsWith('(Hidden)')) {
														let ss2 = this.state.post_title
														ss2 = ss2.replace('(Hidden)', '')
														form.append('post_title', ss2)
													} else {
														let ss2 = this.state.post_title
														ss2 = '(Hidden)' + ss2
														form.append('post_title', ss2)
													}

													form.append('post_description', this.state.post_description)
													form.append('post_price', this.state.post_price)
													const request = await axios.post(
														`${baseURL}/post/updatepost`,
														form,
														{
															headers: {
																'X-Auth-Token': localStorage.getItem('afroboostauth'),
															},
														},
													)
													window.location.reload()
												}}
											>
												{this.state.post?.postTitle.startsWith('(Hidden)') ? (
													// <EyeOffOutline
													// 	color={'#ffffff'}
													// 	height='30px'
													// 	width='30px'
													// 	cssClasses='heart-icon'
													// />
													<div className='post__iconexpan'>
														<IoEyeOffOutline />
													</div>
												) : (
													// <EyeOutline
													// 	color={'#ffffff'}
													// 	height='30px'
													// 	width='30px'
													// 	cssClasses='heart-icon'
													// />
													<div className='post__iconexpan'>
														<IoEyeOutline />
													</div>
												)}
												&nbsp;
											</button>
										</div>
									)}
								</div>
							</div>
							<div
								className='types'
								style={{
									maxWidth: '750px',
									justifyContent: 'center',
									flexDirection: 'column',
								}}
							>
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										justifySelf: 'center',
									}}
								>
									<div className='search' style={{ marginTop: 16, minWidth: '420px' }}>
										<button
											// href='javascript:void(0)'
											onClick={async () => {
												if (!this.commentBoxRef) return
												let boxValue = this.commentBoxRef.value
												if (boxValue.trim().length === 0) return
												this.commentBoxRef.value = ''
												const request = await axios.post(
													`${baseURL}/post/addComment`,
													{
														id: this.state.post?.postID,
														comment: boxValue,
													},
													{
														headers: {
															'X-Auth-Token': localStorage.getItem('afroboostauth'),
														},
													},
												)
												if (request.data.code === 200) {
													try {
														const data = await axios.post(
															`${baseURL}/post/refetch`,
															{
																id: this.props.match.params.id,
															},
															{
																headers: {
																	'X-Auth-Token': localStorage.getItem('afroboostauth'),
																},
															},
														)
														console.log(data)
														this.setState({
															post_title: data.data.postTitle,
														})
														this.allComments = data.data.message.comments
														this.replies = {}
														for (let i = 0; i < this.allComments.length; i++) {
															if (this.allComments[i].parentID) {
																if (!this.replies[this.allComments[i].parentID])
																	this.replies[this.allComments[i].parentID] = []
																this.replies[this.allComments[i].parentID].push(
																	this.allComments[i],
																)
															}
														}
														this.setState({
															post: data.data.message,
														})
														this.forceUpdate()
													} catch (error) {
														console.log(error)
														//window.location.href = "https://afroboost.ch/";
													}
												}
											}}
											className='post__button'
										>
											{/* <ChatbubblesOutline
												cssClasses='search-icon'
												height='23px'
												width='23px'
												color={'#ffffff'}
											/> */}
											<div className='post__icon'>
												<IoChatbubblesOutline />
											</div>
										</button>
										<input
											onKeyPress={async e => {
												if (e.key === 'Enter') {
													if (!this.commentBoxRef) return
													let boxValue = this.commentBoxRef.value
													if (boxValue.trim().length === 0) return
													this.commentBoxRef.value = ''
													const request = await axios.post(
														`${baseURL}/post/addComment`,
														{
															id: this.state.post?.postID,
															comment: boxValue,
														},
														{
															headers: {
																'X-Auth-Token': localStorage.getItem('afroboostauth'),
															},
														},
													)
													if (request.data.code === 200) {
														try {
															const data = await axios.post(
																`${baseURL}/post/refetch`,
																{
																	id: this.props.match.params.id,
																},
																{
																	headers: {
																		'X-Auth-Token': localStorage.getItem('afroboostauth'),
																	},
																},
															)
															console.log(data)
															this.setState({
																post_title: data.data.postTitle,
															})

															this.allComments = data.data.message.comments
															this.replies = {}
															for (let i = 0; i < this.allComments.length; i++) {
																if (this.allComments[i].parentID) {
																	if (!this.replies[this.allComments[i].parentID])
																		this.replies[this.allComments[i].parentID] = []
																	this.replies[this.allComments[i].parentID].push(
																		this.allComments[i],
																	)
																}
															}
															console.log('Replies', this.replies)
															this.setState({
																post: data.data.message,
															})
														} catch (error) {
															console.log(error)
															//window.location.href = "https://afroboost.ch/";
														}
													}
												}
											}}
											ref={(ref: any) => (this.commentBoxRef = ref)}
											placeholder={l[localStorage.getItem('language')]['postComment']}
											autoComplete='off'
											type='text'
											id='search'
										/>
									</div>
									<div
										className='comments'
										style={{ display: 'flex', flexDirection: 'column' }}
									>
										{this.state.post?.comments.map(
											(comment: IComment, commentIndex: number) => {
												if (comment.parentID) return <></>
												return (
													<>
														<span>
															<Comment
																key={comment.commentID}
																parentRef={this}
																commentID={comment.commentID}
																inputRef={this.changeInputRef}
																parentID={null}
																commenterUsername={comment.commenterUsername}
																posterID={comment.posterID}
																posterName={comment.posterName}
																commentTimestamp={new Date(comment.timestamp).valueOf()}
																commentContent={comment.comment}
															/>
															<div style={{ marginLeft: '30px' }}>
																{this.replies[comment.commentID]
																	? this.replies[comment.commentID].map(
																			(reply: any, index: number) => {
																				return (
																					<span>
																						<Comment
																							key={reply.commentID}
																							parentRef={this}
																							inputRef={this.changeInputRef}
																							parentID={comment.commentID}
																							commentID={reply.commentID}
																							commenterUsername={reply.commenterUsername}
																							posterID={reply.posterID}
																							posterName={reply.posterName}
																							commentTimestamp={new Date(
																								reply.timestamp,
																							).valueOf()}
																							commentContent={reply.comment}
																						/>
																					</span>
																				)
																			},
																	  )
																	: null}
															</div>
															<div
																className='search'
																style={{
																	marginTop: 16,
																	marginLeft: '30px',
																	minWidth: '300px',
																}}
															>
																<button
																	// href='javascript:void(0)'
																	className='post__button'
																	onClick={async () => {
																		if (!this.replyBoxRef) return
																		let boxValue = this.replyBoxRef[commentIndex].value
																		if (boxValue.trim().length === 0) return
																		this.replyBoxRef[commentIndex].value = ''
																		console.log('Posting. . .')
																		const request = await axios.post(
																			`${baseURL}/post/replyComment`,
																			{
																				id: this.state.post?.postID,
																				parent_id: comment.commentID,
																				comment: boxValue,
																			},
																			{
																				headers: {
																					'X-Auth-Token':
																						localStorage.getItem('afroboostauth'),
																				},
																			},
																		)
																		if (request.data.code === 200) {
																			try {
																				const data = await axios.post(
																					`${baseURL}/post/refetch`,
																					{
																						id: this.props.match.params.id,
																					},
																					{
																						headers: {
																							'X-Auth-Token':
																								localStorage.getItem('afroboostauth'),
																						},
																					},
																				)
																				console.log(data)
																				this.setState({
																					post_title: data.data.postTitle,
																				})

																				this.allComments = data.data.message.comments
																				this.replies = {}
																				for (
																					let i = 0;
																					i < this.allComments.length;
																					i++
																				) {
																					if (this.allComments[i].parentID) {
																						if (
																							!this.replies[this.allComments[i].parentID]
																						)
																							this.replies[this.allComments[i].parentID] =
																								[]
																						this.replies[
																							this.allComments[i].parentID
																						].push(this.allComments[i])
																					}
																				}
																				console.log('Replies', this.replies)
																				this.setState({
																					post: data.data.message,
																				})
																			} catch (error) {
																				console.log(error)
																				//window.location.href = "https://afroboost.ch/";
																			}
																		}
																	}}
																>
																	{/* <ChatbubblesOutline
																		cssClasses='search-icon'
																		height='23px'
																		width='23px'
																		color={'#ffffff'}
																	/> */}
																	<div className='post__icon'>
																		<IoChatbubblesOutline />
																	</div>
																</button>
																<input
																	onKeyPress={async e => {
																		if (e.key === 'Enter') {
																			if (!this.replyBoxRef[commentIndex]) return
																			let boxValue = this.replyBoxRef[commentIndex].value
																			if (boxValue.trim().length === 0) return
																			this.replyBoxRef[commentIndex].value = ''
																			const request = await axios.post(
																				`${baseURL}/post/replyComment`,
																				{
																					id: this.state.post?.postID,
																					parent_id: comment.commentID,
																					comment: boxValue,
																				},
																				{
																					headers: {
																						'X-Auth-Token':
																							localStorage.getItem('afroboostauth'),
																					},
																				},
																			)
																			if (request.data.code === 200) {
																				try {
																					const data = await axios.post(
																						`${baseURL}/post/refetch`,
																						{
																							id: this.props.match.params.id,
																						},
																						{
																							headers: {
																								'X-Auth-Token':
																									localStorage.getItem('afroboostauth'),
																							},
																						},
																					)
																					console.log(data)
																					this.setState({
																						post_title: data.data.postTitle,
																					})

																					this.allComments = data.data.message.comments
																					this.replies = {}
																					for (
																						let i = 0;
																						i < this.allComments.length;
																						i++
																					) {
																						if (this.allComments[i].parentID) {
																							if (
																								!this.replies[
																									this.allComments[i].parentID
																								]
																							)
																								this.replies[
																									this.allComments[i].parentID
																								] = []
																							this.replies[
																								this.allComments[i].parentID
																							].push(this.allComments[i])
																						}
																					}
																					console.log('Replies', this.replies)
																					this.setState({
																						post: data.data.message,
																					})
																				} catch (error) {
																					console.log(error)
																					// window.location.href = "https://afroboost.ch/";
																				}
																			}
																		}
																	}}
																	ref={(ref: any) =>
																		(this.replyBoxRef[commentIndex] = ref)
																	}
																	placeholder={
																		l[localStorage.getItem('language')]['reply']
																	}
																	autoComplete='off'
																	type='text'
																	id='search'
																/>
															</div>
														</span>
													</>
												)
											},
										)}
									</div>
								</div>
								<div className='recommended-section'>
									{this.state.post?.postType === 'merchandise'
										? this.state.recommendedProducts.map(
												(item: IAfropost, index: number) => {
													if (item.postTitle.startsWith('(Hidden)')) return
													if (item.postID == this.state.post?.postID) return
													while (index < 4) {
														return (
															<span className='recommended-post'>
																{' '}
																<Afropost key={item.postID} post={item} />
															</span>
														)
													}
												},
										  )
										: this.state.recommendedPosts.map(
												(item: IAfropost, index: number) => {
													if (item.postTitle.startsWith('(Hidden)')) return
													if (item.postID == this.state.post?.postID) return
													while (index < 5) {
														console.log('INDEX: ', index)
														return (
															<span className='recommended-post'>
																<Afropost key={item.postID} post={item} />
															</span>
														)
													}
												},
										  )}
								</div>
							</div>
						</div>
					)}
				</div>
				)
			</div>
		)
	}
}

export default Post
