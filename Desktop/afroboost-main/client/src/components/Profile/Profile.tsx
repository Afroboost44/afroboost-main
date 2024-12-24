//@ts-nocheck
import React from 'react'
import './Profile.css'
// import {
//   GridOutline,
//   NavigateOutline,
//   EllipsisVerticalOutline,
//   Search,
//   Mail,
//   MusicalNotesOutline,
//   VideocamOutline,
//   ImageOutline,
//   Pencil,
//   PricetagsOutline,
//   AppsOutline,
// } from "react-ionicons";
import { withRouter } from 'react-router-dom'
import axios from 'axios'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Spectrum from '../Spectrum/Spectrum'
import Category from '../Category/Category'
import FlatList from 'flatlist-react'
import Dropdown from 'react-dropdown'
import Afropost from '../Afropost/Afropost'
import English from '../../english'
import France from '../../france'
import Germany from '../../germany'
import Spain from '../../spain'
import urls from '../../helpers/config'
import { baseURL, devURL } from '../../api'

import { FaBeer } from 'react-icons/fa'
import { BsGrid, BsGrid3X3Gap, BsSearch } from 'react-icons/bs'
import { AiOutlineTags } from 'react-icons/ai'
import { FaImage } from 'react-icons/fa'
import { HiOutlineMusicalNote, HiOutlineVideoCamera } from 'react-icons/hi2'
import { RiPencilFill } from 'react-icons/ri'
import { MdMail } from 'react-icons/md'
import { BiLink } from 'react-icons/bi'
import QRCodeGenerator from '../QRCodeScanner'
import { IoScanCircle } from 'react-icons/io5'

const l = {
	en: English,
	fr: France,
	ge: Germany,
	sp: Spain,
}

interface IAfropost {
	postID: number
	postTitle: string
	postDate: Date
	postBoosted: boolean
	postPrice: number
	posterName: string
	posterID: number
	postType: string
	postCategory: string

	postTimestamp: string
}

interface IProps {
	match: any
}

interface ProfileData {
	id: number
	name: string
	username: string
	biography: string
	meeting_link: string
}

interface IState {
	shownProfile: ProfileData
	statistics: number[]
	dialogShown: boolean
	dialogType: string
	dialogContent: string
	postsList: IAfropost[]
	searchQuery: string
	sortType: string
	category: string
	postType: string
}

class Profile extends React.Component<IProps, IState> {
	postsList: IAfropost[]
	targetUser: string | null
	uploadRef: any
	uploadType = 'uploadPicture'
	categoriesList = [
		'Everything',
		'Entertainment',
		'Sport',
		'Music',
		'Film',
		'Services',
		'Podcasts',
		'Animations',
		'Tutorials',
	]

	constructor(props: any) {
		super(props)
		this.postsList = []
		this.targetUser = this.props.match.params.username.toLowerCase()
		this.state = {
			shownProfile: {
				id: -1,
				name: 'Loading...',
				username: 'Loading...',
				biography: 'Loading...',
			},
			statistics: [0, 0, 0],
			defaultOption: 'Block',
			options: [],
			dialogShown: false,
			dialogType: 'name',
			dialogContent: '',
			postsList: [],
			searchQuery: '',
			category: 'Everything',
			sortType: 'Latest posts',
			postType: 'Everything',
			categoriesOpened: false,
			onlineStatus: 'offline',
		}
		axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*'
		this.blockAndDeleteUser = this.blockAndDeleteUser.bind(this)
	}

	componentDidMount() {
		this.fetchProfileData()
		this.refetchPosts()
		this.isOnline()
		if (this.targetUser !== localStorage.getItem('afroboostusername').toLowerCase()) {
			var all = Array.from(
				document.getElementsByClassName('edit-button') as HTMLCollectionOf<HTMLElement>,
			)
			for (var i = 0; i < all.length; i++) {
				all[i].style.display = 'none'
			}
		}
	}

	async fetchProfileData() {
		const data: any = await axios.post(
			`${baseURL}/user/getUser/`,
			{
				username: this.targetUser,
			},
			{
				headers: {
					'X-Auth-Token': localStorage.getItem('afroboostauth'),
				},
			},
		)
		if (data.data.code === 200) {
			this.setState({
				shownProfile: data.data.message,
				statistics: data.data.statistics,
			})
			localStorage.getItem('afroboostid') === 4
				? this.setState({
						options: [
							{
								label: !this.state.shownProfile.is_blocked ? 'Block' : 'UnBlock',
								value: !this.state.shownProfile.is_blocked ? 'block' : 'unblock',
							},
							{
								label: 'Delete',
								value: 'delete',
							},
						],
				  })
				: this.setState({
						options: [
							{
								label: !this.state.shownProfile.is_blocked ? 'Block' : 'UnBlock',
								value: !this.state.shownProfile.is_blocked ? 'block' : 'unblock',
							},
						],
				  })
			this.setState({
				defaultOption: !this.state.shownProfile.is_blocked ? 'Block' : 'UnBlock',
			})
			// console.log(this.state.shownProfile)
		}
	}
	async isOnline() {
		const data = await axios.get(`${baseURL}/post/onlineStatus/` + this.targetUser, {
			headers: {
				'X-Auth-Token': localStorage.getItem('afroboostauth'),
			},
		})
		this.setState({ onlineStatus: data.data.message })
	}

	async refetchPosts() {
		const homepageData = await axios.post(
			`${baseURL}/post/feed`,
			{
				username: this.targetUser,
			},
			{
				headers: {
					'X-Auth-Token': localStorage.getItem('afroboostauth'),
				},
			},
		)
		console.log(homepageData)
		this.setState({ postsList: homepageData.data.message })
	}
	async blockAndDeleteUser(event) {
		try {
			let value = event.value
			let response = await axios.get(
				`${baseURL}/user/delete-block-user?type=${value}&id=${this.state.shownProfile.id}`,
				{
					headers: {
						'X-Auth-Token': localStorage.getItem('afroboostauth'),
					},
				},
			)
			if (response.status === 200) {
				if (this.targetUser !== localStorage.getItem('afroboostusername').toLowerCase())
					return this.props.history.push('/members')
				localStorage.setItem('afroboostauth', 'guest')
				localStorage.setItem('afroboostname', 'Not logged in')
				localStorage.setItem('afroboostusername', '#')
				localStorage.setItem('afroboostid', '-1')
				this.props.history.push('/')
			}
		} catch (error) {
			console.log(error)
		}
	}

	render() {
		return (
			<div className='profile'>
				<Dialog
					open={this.state.dialogShown}
					onClose={() => this.setState({ dialogShown: false })}
					aria-labelledby='form-dialog-title'
				>
					<DialogTitle id='form-dialog-title'>
						{(() => {
							switch (this.state.dialogType) {
								case 'name':
									return 'Change your name'
								case 'username':
									return 'Change your username'
								case 'biography':
									return 'Change your biography'
								case 'meeting':
									return 'Enter a meeting link'
								default:
									return 'Invalid dialog type.'
							}
						})()}
					</DialogTitle>
					<DialogContent>
						<DialogContentText>
							{(() => {
								switch (this.state.dialogType) {
									case 'name':
										return 'Your name should consist only of alphabetic characters and cannot contain any other characters.'
									case 'username':
										return 'Your name should consist only of alphanumeric characters and cannot contain any other characters.'
									case 'biography':
										return 'Your biography will be publicly visible on your profile page. '
									case 'meeting':
										return 'Enter a link to a Zoom meeting, Google Meet or another meeting provider.'
									default:
										return 'Invalid dialog type.'
								}
							})()}
						</DialogContentText>
						<TextField
							autoFocus
							margin='dense'
							onChange={(event: any) => {
								this.setState({
									dialogContent:
										this.state.dialogType === 'useranme'
											? e.target.value.toLowerCase()
											: event.target.value,
								})
							}}
							value={this.state.dialogContent}
							id='content'
							label={(() => {
								switch (this.state.dialogType) {
									case 'name':
										return 'Your new name'
									case 'username':
										return 'Your new username'
									case 'biography':
										return 'Your new biography'
									case 'meeting':
										return 'Your new meeting link'
									default:
										return 'Invalid dialog type.'
								}
							})()}
							type='text'
							multiline={this.state.dialogType === 'biography'}
							fullWidth
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => this.setState({ dialogShown: false })} color='primary'>
							Cancel
						</Button>
						<Button
							onClick={async () => {
								console.log(this.state.dialogType, this.state.dialogContent)
								switch (this.state.dialogType) {
									case 'name': {
										const request = await axios.post(
											`${baseURL}/user/updateName`,
											{
												name: this.state.dialogContent,
											},
											{
												headers: {
													'X-Auth-Token': localStorage.getItem('afroboostauth'),
												},
											},
										)
										if (request.data.code === 200) {
											localStorage.setItem('afroboostname', this.state.dialogContent)
											window.location.reload()
										}

										return
									}
									case 'username': {
										const request = await axios.post(
											`${baseURL}/user/updateUsername`,
											{
												username: this.state.dialogContent,
											},
											{
												headers: {
													'X-Auth-Token': localStorage.getItem('afroboostauth'),
												},
											},
										)
										if (request.data.code === 200) {
											localStorage.setItem('afroboostusername', this.state.dialogContent)
											window.location.href =
												`${baseURL}/profile/` +
												localStorage.getItem('afroboostusername').toLowerCase()
										}

										return
									}
									case 'biography': {
										const request = await axios.post(
											`${baseURL}/user/updateBiography`,
											{
												biography: this.state.dialogContent,
											},
											{
												headers: {
													'X-Auth-Token': localStorage.getItem('afroboostauth'),
												},
											},
										)
										if (request.data.code === 200) {
											this.setState(prevState => ({
												dialogShown: false,
												shownProfile: {
													...prevState.shownProfile,
													biography: this.state.dialogContent,
												},
											}))
										}

										return
									}
									case 'meeting': {
										const request = await axios.post(
											`${baseURL}/user/updateLink`,
											{
												meeting_link: this.state.dialogContent,
											},
											{
												headers: {
													'X-Auth-Token': localStorage.getItem('afroboostauth'),
												},
											},
										)
										if (request.data.code === 200) {
											this.setState(prevState => ({
												dialogShown: false,
												shownProfile: {
													...prevState.shownProfile,
													meeting_link: this.state.dialogContent,
												},
											}))
										}

										return
									}
									default:
										this.setState({ dialogShown: false })
										return
								}
							}}
							color='primary'
						>
							Confirm
						</Button>
					</DialogActions>
				</Dialog>
				<div
					className='diveditable cover__hover'
					style={{
						backgroundImage: `url(${baseURL}/coverImage/${this.state.shownProfile.id})`,
						height: 230,
						width: '100%',
						borderRadius: 24,
						marginTop: 20,
						backgroundSize: 'cover',
						justifyContent: 'flex-end',
						display: 'flex',
						backgroundPosition: 'center',
					}}
				>
					<button
						// href="javascript:void(0)"
						onClick={() => {
							this.uploadType = 'uploadCover'
							this.uploadRef.click()
						}}
						className='profilepage__button'
					>
						{/* <Pencil
              color={"#ffffff"}
              height="24px"
              width="24px"
              style={{
                margin: 10,
              }}
              cssClasses="edit-button"
            /> */}
						<div className='profilepage__icon pencil__cover'>
							<RiPencilFill />
						</div>
					</button>
				</div>
				<div className='qrcode__row'>
					<div className='qrcode__leftside'>
						<div
							className='diveditable profile__hover'
							style={{
								backgroundImage: `url(${baseURL}/profileImage/${this.state.shownProfile.id})`,
								height: 170,
								width: 170,
								borderRadius: '50%',
								marginTop: -135,
								border: '10px solid #141414',
								backgroundSize: 'cover',
								backgroundPositionX: 'center',
								diplay: 'none',
							}}
						>
							{window.location.href ===
								`${baseURL}/profile/` + localStorage.getItem('afroboostusername') ||
							window.location.href ===
								`${baseURL}/profile/` +
									localStorage.getItem('afroboostusername') ? null : this.state
									.onlineStatus === 'online' ? (
								<div
									style={{
										height: '100%',
										width: '100%',
										display: 'flex',
										justifyContent: 'flex-end',
									}}
								>
									<div
										style={{
											height: '17%',
											width: '17%',
											borderRadius: '100%',
											backgroundColor: 'purple',
											display: 'flex',
											marginTop: '2%',
											marginRight: '8%',
										}}
									></div>
								</div>
							) : (
								<div
									style={{
										height: '100%',
										width: '100%',
										display: 'flex',
										justifyContent: 'flex-end',
									}}
								>
									<div
										style={{
											height: '17%',
											width: '17%',
											borderRadius: '100%',
											backgroundColor: 'gray',
											display: 'flex',
											marginTop: '2%',
											marginRight: '8%',
										}}
									></div>
								</div>
							)}
							<button
								// href="javascript:void(0)"
								onClick={() => {
									this.uploadType = 'uploadPicture'
									this.uploadRef.click()
								}}
								className='profilepage__button'
							>
								<div className='profilepage__icon pencil__profile'>
									<RiPencilFill />
								</div>
							</button>
						</div>
						<h1 className='profile-fullname editable name__hover'>
							{this.state.shownProfile.name}
							<button
								// href="javascript:void(0)"
								onClick={() => {
									this.setState({
										dialogShown: true,
										dialogType: 'name',
										dialogContent: this.state.shownProfile.name,
									})
								}}
								className='profilepage__button'
							>
								{/* <Pencil
              color={"#ffffff"}
              height="24px"
              width="24px"
              cssClasses="edit-button"
            /> */}
								<div className='profilepage__icon pencil__name'>
									<RiPencilFill />
								</div>
							</button>
						</h1>
						<span className='profile-username editable username__hover'>
							@{this.state.shownProfile.username}
							<button
								// href='javascript:void(0)'
								onClick={() => {
									this.setState({
										dialogShown: true,
										dialogType: 'username',
										dialogContent: this.state.shownProfile.username,
									})
								}}
								className='profilepage__button'
							>
								{/* <Pencil
							color={'#ffffff'}
							height='24px'
							width='24px'
							cssClasses='edit-button'
						/> */}
								<div className='profilepage__icon pencil__username'>
									<RiPencilFill />
								</div>
							</button>
						</span>

						<div className='types'>
							&nbsp;
							{/* <MusicalNotesOutline
						color={'#ffffff'}
						height='30px'
						width='30px'
						cssClasses='heart-icon'
					/> */}
							<div className='profilepage__icon'>
								<HiOutlineMusicalNote />
							</div>
							<span className='stats-count'>{this.state.statistics[0]}</span>
							{/* <VideocamOutline
						color={'#ffffff'}
						height='30px'
						width='30px'
						cssClasses='heart-icon'
					/> */}
							<div className='profilepage__icon'>
								<HiOutlineVideoCamera />
							</div>
							<span className='stats-count'>{this.state.statistics[1]}</span>
							{/* <ImageOutline
						color={'#ffffff'}
						height='30px'
						width='30px'
						cssClasses='heart-icon'
					/> */}
							<div className='profilepage__icon'>
								<FaImage />
							</div>
							<span className='stats-count'>{this.state.statistics[2]}</span>
							{
								<button
									// href='javascript:void(0)'
									className='gomessage profilepage__button'
									onClick={async () => {
										const request = await axios.post(
											`${baseURL}/user/gomessage`,
											{
												targetID: this.state.shownProfile.id,
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
								>
									<div className='heart-icon '>
										<div className='profilepage__icon'>
											<MdMail />
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
							}
							<span className='stats-count' style={{ display: 'none' }}>
								{this.state.statistics[3]}
							</span>
							<Dropdown
								className='dropdown-menu1'
								controlClassName='dropdown-menu-control'
								placeholderClassName='dropdown-menu-placeholder'
								menuClassName='dropdown-menu-menu'
								value={this.state.defaultOption}
								options={this.state.options}
								onChange={this.blockAndDeleteUser}
							/>
						</div>
						<div className='pfp'>
							<input
								onChange={async (event: any) => {
									const data = new FormData()
									data.append('uploadedPicture', event.target.files[0])
									const request = await axios.post(
										`${baseURL}/user/${this.uploadType}`,
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
								ref={ref => (this.uploadRef = ref)}
								style={{ display: 'none' }}
							/>
						</div>

						<span
							style={{
								whiteSpace: 'pre-wrap',
							}}
							className='profile-biography editable bio__hover'
						>
							{this.state.shownProfile.biography}
							<button
								// href='javascript:void(0)'
								onClick={() => {
									this.setState({
										dialogShown: true,
										dialogType: 'biography',
										dialogContent: this.state.shownProfile.biography,
									})
								}}
								className='profilepage__button'
							>
								<div className='profilepage__icon pencil__bio'>
									<RiPencilFill />
								</div>
							</button>
						</span>

						<a
							href={this.state.shownProfile.meeting_link || '#'}
							className='profile-meeting editable'
						>
							<img
								src={`${baseURL}/random/1.png`}
								width='32px'
								height='32px'
								style={{ marginRight: '10px' }}
								alt=''
							/>

							{l[localStorage.getItem('language')]['joinTheMeeting'] ||
								'No meeting link provided.'}
							<button
								// href='javascript:void(0)'
								onClick={() => {
									this.setState({
										dialogShown: true,
										dialogType: 'meeting',
										dialogContent: this.state.shownProfile.meeting_link || '',
									})
								}}
								className='profilepage__button'
							>
								{/* <Pencil
							color={'#ffffff'}
							height='24px'
							width='24px'
							cssClasses='edit-button'
						/> */}
								<div className='profilepage__icon pencil'>
									<BiLink />
								</div>
							</button>
						</a>
					</div>
					<div className='qrcode__rightside'>
						<QRCodeGenerator />
					</div>
				</div>
				<h2 className='page-title'>
					<Spectrum />
					&nbsp;&nbsp;Posts
				</h2>
				<div className='filters'>
					<div className='search' style={{ marginRight: 20 }}>
						{/* <Search
							cssClasses='search-icon'
							height='23px'
							width='23px'
							color={'#ffffff'}
						/> */}
						<div className='profilepage__icon search__icon'>
							<BsSearch />
						</div>
						<input
							onChange={(event: any) => {
								this.setState({ searchQuery: event.target.value })
							}}
							placeholder={l[localStorage.getItem('language')]['searchAfroboost']}
							autoComplete='off'
							type='text'
							id='search'
						/>
					</div>

					<Dropdown
						className='dropdown-menu'
						controlClassName='dropdown-menu-control'
						placeholderClassName='dropdown-menu-placeholder'
						menuClassName='dropdown-menu-menu'
						onChange={(event: any) => {
							this.setState({ sortType: event.value })
						}}
						arrowClassName='dropdown-menu-arrow'
						options={[
							{
								label: l[localStorage.getItem('language')]['Latest posts'],
								value: 'Latest posts',
							},
							{
								label: l[localStorage.getItem('language')]['Oldest posts'],
								value: 'Oldest posts',
							},
						]}
						value={'Latest posts'}
						placeholder='Select an option'
					/>

					<div className='types'>
						&nbsp;
						<button
							// href='javascript:void(0)'
							onClick={() => {
								this.setState({ postType: 'Everything' })
							}}
							className='profilepage__button'
						>
							<div className='profilepage__icon'>
								<BsGrid />
							</div>
							{/* <GridOutline
								color={'#ffffff'}
								height='30px'
								width='30px'
								cssClasses='heart-icon'
							/> */}
						</button>
						&nbsp;
						<button
							// href='javascript:void(0)'
							onClick={() => {
								this.setState({ postType: 'audio' })
							}}
							className='profilepage__button'
						>
							<div className='profilepage__icon'>
								<HiOutlineMusicalNote />
							</div>
							{/* <MusicalNotesOutline
								color={'#ffffff'}
								height='30px'
								width='30px'
								cssClasses='heart-icon'
							/> */}
						</button>
						&nbsp;
						<button
							// href='javascript:void(0)'
							onClick={() => {
								this.setState({ postType: 'video' })
							}}
							className='profilepage__button'
						>
							<div className='profilepage__icon'>
								<HiOutlineVideoCamera />
							</div>
							{/* <VideocamOutline
								color={'#ffffff'}
								height='30px'
								width='30px'
								cssClasses='heart-icon'
							/> */}
						</button>
						&nbsp;
						<button
							// href='javascript:void(0)'
							onClick={() => {
								this.setState({ postType: 'image' })
							}}
							className='profilepage__button'
						>
							<div className='profilepage__icon'>
								<FaImage />
							</div>
							{/* <ImageOutline
								color={'#ffffff'}
								height='30px'
								width='30px'
								cssClasses='heart-icon'
							/> */}
						</button>
						&nbsp;
						<button
							// href='javascript:void(0)'
							onClick={() =>
								this.setState({
									categoriesOpened: !this.state.categoriesOpened,
								})
							}
							className='profilepage__button'
						>
							<div className='profilepage__icon'>
								<BsGrid3X3Gap />
							</div>
							{/* <AppsOutline
								color={'#ffffff'}
								height='30px'
								width='30px'
								cssClasses='heart-icon'
							/> */}
						</button>
						&nbsp;
						<button
							// href='javascript:void(0)'
							onClick={() => {
								this.setState({ postType: 'merchandise' })
							}}
							style={{ height: '24px', marginTop: '4px' }}
							className='profilepage__button'
						>
							<div className='profilepage__icon'>
								<AiOutlineTags />
							</div>
							{/* <PricetagsOutline
								color={'#ffffff'}
								height='24px'
								width='24px'
								cssClasses='heart-icon'
							/> */}
						</button>
					</div>
				</div>
				<div className='categories'>
					{this.state.categoriesOpened ? (
						<FlatList
							list={this.categoriesList}
							renderItem={(item: string, index: number) => (
								<Category
									onClick={() => {
										this.setState({ category: item })
									}}
									chosen={item === this.state.category}
									key={index}
									category={item}
								/>
							)}
							renderWhenEmpty={() => (
								<div style={{ backgroundColor: 'white' }}>
									<p>List is empty!</p>
								</div>
							)}
						/>
					) : null}
				</div>

				<div className='posts' style={{ marginBottom: 40 }}>
					{this.state.postsList.length ? (
						<FlatList
							list={this.state.postsList}
							renderItem={(item: IAfropost, index: number) => {
								if (
									item.postTitle.startsWith('(Hidden)') &&
									item.posterID.toString() !== localStorage.getItem('afroboostid') &&
									'14' !== localStorage.getItem('afroboostid')
								)
									return

								return <Afropost key={item.postID} post={item} />
							}}
							sort={{
								by: [
									{
										key: 'postDate',
										descending: this.state.sortType === 'Latest posts',
									},
								],
							}}
							filterBy={(item: IAfropost) => {
								console.log(item.postCategory)
								console.log(this.state.category)
								return (
									item.postTitle
										.toLowerCase()
										.includes(this.state.searchQuery.toLowerCase()) &&
									(item.postCategory === this.state.category ||
										this.state.category === 'Everything') &&
									(item.postType === this.state.postType ||
										this.state.postType === 'Everything')
								)
							}}
							displayGrid
							gridGap='30px'
							minColumnWidth='250px'
						/>
					) : null}
				</div>
			</div>
		)
	}
}

export default withRouter(Profile)
