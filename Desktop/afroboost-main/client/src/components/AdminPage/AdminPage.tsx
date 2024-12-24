//@ts-nocheck
import React from 'react'
import './AdminPage.css'
import Spectrum from '../Spectrum/Spectrum'
import axios from 'axios'
import ProgressBar from '@ramonak/react-progress-bar'
import Button from '@material-ui/core/Button'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import Delete from '@material-ui/icons/Delete'
import CircularProgress from '@material-ui/core/CircularProgress'
import English from '../../english'
import France from '../../france'
import Germany from '../../germany'
import Spain from '../../spain'
import withToast from '../../helpers/withToast'
import Dialog from '../Dialog/Dialog'
import { baseURL } from '../../api'
import { IoGitBranchOutline, IoKeyOutline } from 'react-icons/io5'
import ManageUsers from '../ManageUser'
const l = {
	en: English,
	fr: France,
	ge: Germany,
	sp: Spain,
}
class AdminPage extends React.Component {
	attacherRef: any
	attacherRef1: any
	attachedLink: any

	constructor(props: any) {
		super(props)
		this.state = {
			currentPage: 'login-edit',
			uploadedLoginVideo: undefined,
			uploadedHomeBanner: undefined,
			uploadedDefaultBanner: undefined,
			uploadedTerms: undefined,
			uploadedProgress: undefined,
			percentage: 0,
			emojis: [],
			uploadingEmoji: false,
			showConfirm: false,
			emoji: null,
		}
	}

	componentDidMount() {
		this.fetchEAvatars()
	}

	// Get fetchEAvatars files
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

	deleteEmojis = async () => {
		if (!this.state.emoji) return
		const res = await axios.delete(`${baseURL}/emojis/` + this.state.emoji, {
			headers: {
				'X-Auth-Token': localStorage.getItem('afroboostauth'),
			},
		})
		this.setState({ uploadingEmoji: false })
		if (res.status === 200) {
			this.props.addToast('Emoticon deleted successfully', {
				appearance: 'success',
				autoDismiss: true,
			})
			this.fetchEAvatars()
			this.setState({ showConfirm: false, emoji: '' })
		} else {
			this.props.addToast('Failed to upload Emoticon', {
				appearance: 'error',
				autoDismiss: true,
			})
		}
	}

	uploadProgress = progressEvent => {
		var percentCompleted = Math.round((progressEvent.loaded * 70) / progressEvent.total)
		this.setState({ percentage: percentCompleted })
	}
	adminContent() {
		switch (this.state.currentPage) {
			case 'login-edit':
				return (
					<div className='admin-container'>
						<div className='admin-left'>
							<img
								src='https://img.icons8.com/ios/250/ffffff/admin-settings-male.png'
								style={{
									height: '150px',
									width: '150px',
									alignSelf: 'center',
									marginBottom: '20px',
								}}
								alt=''
							/>
							<h2
								className='page-title'
								style={{
									fontSize: '18px',
									alignItems: 'flex-end',
									alignSelf: 'center',
									marginLeft: '-12px',
								}}
							>
								<Spectrum />
								&nbsp;&nbsp; {l[localStorage.getItem('language')]['editLoginPage']}
							</h2>
						</div>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								width: '100%',
							}}
						>
							<h2
								className='history-post-desc'
								style={{
									fontSize: '20px',
									color: 'white',
									textAlign: 'center',
								}}
							>
								&nbsp;&nbsp; {l[localStorage.getItem('language')]['uploadLoginVideo']}
							</h2>
							<div className='admin-upload-file'>
								<Button
									style={{
										marginTop: 16,
										height: 'auto',
										minWidth: '150px',
										maxWidth: '300px',
										alignSelf: 'center',
									}}
									variant='contained'
									color='primary'
									onClick={() => {
										this.attacherRef.click()
									}}
									startIcon={
										<img
											src='https://img.icons8.com/material-rounded/24/ffffff/upload--v1.png'
											alt=''
										/>
									}
								>
									<b>{l[localStorage.getItem('language')]['uploadVideo']}</b>
								</Button>
								<input
									id='uploader'
									onChange={(event: any) => {
										this.setState({
											uploadedLoginVideo: event.target.files[0],
										})
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
								<p className='history-post-desc' style={{ color: 'white' }}>
									{this.state.uploadedLoginVideo
										? this.state.uploadedLoginVideo.name
										: 'No video uploaded yet...'}
								</p>
							</div>
							<div
								className='admin-upload-file'
								style={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
								}}
							>
								<Button
									variant='contained'
									color='primary'
									style={{ margin: 20 }}
									onClick={async () => {
										let form = new FormData()
										form.append('login_video', this.state.uploadedLoginVideo)
										this.setState({ uploadedProgress: 'Uploading...' })
										await axios.post(`${baseURL}/post/uploadLoginContent`, form, {
											headers: {
												'X-Auth-Token': localStorage.getItem('afroboostauth'),
											},
											onUploadProgress: this.uploadProgress,
										})
										alert('Your video has been published successfully!')
										this.setState({
											uploadedLoginVideo: undefined,
											percentage: 0,
											uploadedProgress: undefined,
										})
									}}
								>
									<p style={{ margin: 0 }}>
										<b> {l[localStorage.getItem('language')]['publishNow']}</b>
									</p>
								</Button>
								{this.state.uploadedProgress === 'Uploading...' ? (
									<ProgressBar
										width='200px'
										margin='20px'
										completed={this.state.percentage}
									/>
								) : null}
							</div>
						</div>
					</div>
				)
			case 'home-banner':
				return (
					<div className='admin-container'>
						<div className='admin-left'>
							<img
								src='https://img.icons8.com/ios-filled/500/ffffff/windows10-personalization.png'
								style={{
									height: '150px',
									width: '150px',
									alignSelf: 'center',
									marginBottom: '20px',
								}}
								alt=''
							/>
							<h2
								className='page-title'
								style={{
									fontSize: '18px',
									alignItems: 'flex-end',
									alignSelf: 'center',
									marginLeft: '-12px',
								}}
							>
								<Spectrum />
								&nbsp;&nbsp; {l[localStorage.getItem('language')]['editHomeBanner']}
							</h2>
						</div>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								width: '100%',
							}}
						>
							<h2
								className='history-post-desc'
								style={{
									fontSize: '20px',
									color: 'white',
									textAlign: 'center',
								}}
							>
								{l[localStorage.getItem('language')]['uploadNewBanner']}
							</h2>
							<div className='admin-upload-file'>
								<Button
									style={{
										marginTop: 16,
										height: 'auto',
										minWidth: '150px',
										maxWidth: '300px',
										alignSelf: 'center',
									}}
									variant='contained'
									color='primary'
									onClick={() => {
										this.attacherRef.click()
									}}
									startIcon={
										<img
											src='https://img.icons8.com/material-rounded/24/ffffff/upload--v1.png'
											alt=''
										/>
									}
								>
									<b>{l[localStorage.getItem('language')]['uploadBanner']}</b>
								</Button>
								<input
									id='uploader'
									onChange={(event: any) => {
										this.setState({
											uploadedHomeBanner: event.target.files[0],
										})
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
								<p className='history-post-desc' style={{ color: 'white' }}>
									{this.state.uploadedHomeBanner
										? this.state.uploadedHomeBanner.name
										: 'No image uploaded yet...'}
								</p>
							</div>
							<div
								className='admin-upload-file'
								style={{
									/*borderBottom: "3px solid #650072",*/
									paddingBottom: '30px',
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
								}}
							>
								<Button
									variant='contained'
									color='primary'
									onClick={async () => {
										let form = new FormData()
										form.append('home_banner', this.state.uploadedHomeBanner)
										form.append('mode', 'new')
										this.setState({ uploadedProgress: 'Uploading...' })
										await axios.post(`${baseURL}/post/uploadHomeBanner`, form, {
											headers: {
												'X-Auth-Token': localStorage.getItem('afroboostauth'),
											},
											onUploadProgress: this.uploadProgress,
										})
										alert('Your banner has been set successfully!')
										this.setState({
											uploadedLoginVideo: undefined,
											percentage: 0,
											uploadedProgress: undefined,
										})
									}}
								>
									<p style={{ margin: 0 }}>
										<b>{l[localStorage.getItem('language')]['setNewBanner']}</b>
									</p>
								</Button>
								{this.state.uploadedProgress === 'Uploading...' ? (
									<ProgressBar
										width='200px'
										margin='20px'
										completed={this.state.percentage}
									/>
								) : null}
							</div>
						</div>
						{/*<h2
              className="history-post-desc"
              style={{ fontSize: "20px", color: "white", marginTop: "20px" }}
            >
              &nbsp;&nbsp; Upload default banner
            </h2>
            <p
              className="history-post-desc"
              style={{
                fontSize: "16px",
                color: "white",
                marginTop: "10px",
                marginBottom: "10px",
              }}
            >
              &nbsp;&nbsp; You can upload a new default banner, or you can just
              press the Set default button.
            </p>
            <div className="admin-upload-file">
              <Button
                style={{
                  marginTop: 16,
                  height: "50px",
                  minWidth: "150px",
                  maxWidth: "300px",
                  alignSelf: "center",
                }}
                variant="contained"
                color="primary"
                onClick={() => {
                  this.attacherRef1.click();
                }}
                startIcon={
                  <img src="https://img.icons8.com/material-rounded/24/ffffff/upload--v1.png" />
                }
              >
                <b>Upload default banner</b>
              </Button>
              <input
                id="uploader2"
                onChange={(event: any) => {
                  this.setState({
                    uploadedDefaultBanner: event.target.files[0],
                  });
                  console.log(event.target.files[0]);
                }}
                style={{ display: "none" }}
                type="file"
                ref={(ref: any) => {
                  this.attacherRef1 = ref;
                  let uploader = document.getElementById("uploader2");
                  uploader.addEventListener("loadedmetadata", function () {
                    console.log("width:", this.videoWidth);
                    console.log("height:", this.videoHeight);
                  });
                }}
              />
              <p className="history-post-desc" style={{ color: "white" }}>
                {this.state.uploadedDefaultBanner
                  ? this.state.uploadedDefaultBanner.name
                  : "No image uploaded yet..."}
              </p>
            </div>
            <div className="admin-upload-file">
              <div style={{ display: "flex", flexDirection: "row" }}>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ marginRight: 10 }}
                  onClick={async () => {
                    let form = new FormData();
                    form.append(
                      "default_banner",
                      this.state.uploadedDefaultBanner
                    );
                    form.append("mode", "default");
                    this.setState({ uploadedProgress: "Uploading..." });
                    await axios.post(
                      "https://afroboost.com:3003/post/uploadHomeBanner",
                      form,
                      {
                        headers: {
                          "X-Auth-Token": localStorage.getItem("afroboostauth"),
                        },
                        onUploadProgress: this.uploadProgress,
                      }
                    );
                    alert("Your banner has been set successfully!");
                    this.setState({
                      uploadedDefaultBanner: undefined,
                      percentage: 0,
                      uploadedProgress: undefined,
                    });
                  }}
                >
                  <p style={{ margin: 0 }}>
                    <b>Set new default</b>
                  </p>
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ marginLeft: 10 }}
                  onClick={async () => {
                    this.setState({ uploadedProgress: "Uploading..." });
                    let form = new FormData();
                    form.append("mode", "oldDefault");
                    await axios.post(
                      "https://afroboost.com:3003/post/uploadHomeBanner",
                      form,
                      {
                        headers: {
                          "X-Auth-Token": localStorage.getItem("afroboostauth"),
                        },
                        onUploadProgress: this.uploadProgress,
                      }
                    );
                    alert("Your banner has been set successfully!");
                    this.setState({
                      uploadedDefaultBanner: undefined,
                      uploadedLoginVideo: undefined,
                      percentage: 0,
                      uploadedProgress: undefined,
                    });
                  }}
                >
                  <p style={{ margin: 0 }}>
                    <b>Set default</b>
                  </p>
                </Button>
              </div>
            </div>
            {this.state.uploadedProgress === "Uploading..." ? (
              <ProgressBar
                width="200px"
                margin="20px"
                completed={this.state.percentage}
              />
            ) : null}*/}
					</div>
				)
			case 'about-edit':
				return (
					<div className='admin-container'>
						<div className='admin-left'>
							<img
								src='https://img.icons8.com/ios/500/ffffff/about.png'
								style={{
									height: '150px',
									width: '150px',
									alignSelf: 'center',
									marginBottom: '20px',
								}}
								alt=''
							/>
							<h2
								className='page-title'
								style={{
									fontSize: '18px',
									alignItems: 'flex-end',
									alignSelf: 'center',
									marginLeft: '-12px',
								}}
							>
								<Spectrum />
								&nbsp;&nbsp; {l[localStorage.getItem('language')]['editAbout']}
							</h2>
						</div>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								width: '100%',
							}}
						>
							<h2
								className='history-post-desc'
								style={{
									fontSize: '20px',
									color: 'white',
									textAlign: 'center',
								}}
							>
								&nbsp;&nbsp; {l[localStorage.getItem('language')]['copyLinkText']}
							</h2>
							<div className='search' style={{ marginTop: 16, alignSelf: 'center' }}>
								<div className='adminpage__icon'>
									<IoGitBranchOutline />
								</div>
								{/* <GitBranchOutline
									cssClasses='search-icon'
									height='23px'
									width='23px'
									color={'#ffffff'}
								/> */}
								<input
									ref={ref => {
										this.attachedLink = ref
									}}
									placeholder='Link of the post...'
									autoComplete='off'
									type='text'
									id='search'
								/>
							</div>
							<div
								className='admin-upload-file'
								style={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
								}}
							>
								<Button
									variant='contained'
									color='primary'
									style={{ margin: 20 }}
									onClick={async () => {
										if (!this.attachedLink.value) return
										let id = this.attachedLink.value.split('/').pop()
										await axios.post(
											`${baseURL}/post/setAboutUsPost`,
											{ id: id },
											{
												headers: {
													'X-Auth-Token': localStorage.getItem('afroboostauth'),
												},
											},
										)
										setTimeout(
											alert('You have updated the about page successfully!'),
											1000,
										)
									}}
								>
									<p style={{ margin: 0 }}>
										{l[localStorage.getItem('language')]['changeNow']}
									</p>
								</Button>
							</div>
						</div>
					</div>
				)
			case 'general-conditions':
				return (
					<div className='admin-container'>
						<div className='admin-left'>
							<img
								src='https://img.icons8.com/ios/500/ffffff/terms-and-conditions.png'
								style={{
									height: '150px',
									width: '150px',
									alignSelf: 'center',
									marginBottom: '20px',
								}}
								alt=''
							/>
							<h2
								className='page-title'
								style={{
									fontSize: '18px',
									alignItems: 'flex-end',
									alignSelf: 'center',
									marginLeft: '-12px',
								}}
							>
								<Spectrum />
								&nbsp;&nbsp; {l[localStorage.getItem('language')]['generalConditions']}
							</h2>
						</div>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								width: '100%',
							}}
						>
							<h2
								className='history-post-desc'
								style={{
									fontSize: '20px',
									color: 'white',
									textAlign: 'center',
								}}
							>
								&nbsp;&nbsp;{' '}
								{l[localStorage.getItem('language')]['uploadGeneralConditions']}
							</h2>
							<div className='admin-upload-file'>
								<Button
									style={{
										marginTop: 16,
										height: '50px',
										minWidth: '150px',
										maxWidth: '300px',
										alignSelf: 'center',
									}}
									variant='contained'
									color='primary'
									onClick={() => {
										this.attacherRef.click()
									}}
									startIcon={
										<img
											src='https://img.icons8.com/material-rounded/24/ffffff/upload--v1.png'
											alt=''
										/>
									}
								>
									<b> {l[localStorage.getItem('language')]['uploadFile']}</b>
								</Button>
								<input
									id='uploader'
									onChange={(event: any) => {
										this.setState({
											uploadedTerms: event.target.files[0],
										})
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
								<p className='history-post-desc' style={{ color: 'white' }}>
									{this.state.uploadedTerms
										? this.state.uploadedTerms.name
										: 'No file uploaded yet...'}
								</p>
							</div>
							<div
								className='admin-upload-file'
								style={{
									/*borderBottom: "3px solid #650072",*/
									paddingBottom: '30px',
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
								}}
							>
								<Button
									variant='contained'
									color='primary'
									onClick={async () => {
										let form = new FormData()
										form.append('uploadedFile', this.state.uploadedTerms)
										this.setState({ uploadedProgress: 'Uploading...' })
										await axios.post(`${baseURL}/post/setTermsFile`, form, {
											headers: {
												'X-Auth-Token': localStorage.getItem('afroboostauth'),
											},
											onUploadProgress: this.uploadProgress,
										})
										setTimeout(alert('Your file has been uploaded successfully!'), 1000)
										this.setState({
											uploadedLoginVideo: undefined,
											percentage: 0,
											uploadedProgress: undefined,
											uploadedTerms: undefined,
										})
									}}
								>
									<p style={{ margin: 0 }}>
										<b> {l[localStorage.getItem('language')]['newFile']}</b>
									</p>
								</Button>
								<Button
									variant='contained'
									color='primary'
									href={`${baseURL}/getTermsFile`}
									style={{ marginTop: 20 }}
								>
									<p style={{ margin: 0 }}>
										<b> {l[localStorage.getItem('language')]['currentConditions']}</b>
									</p>
								</Button>
								{this.state.uploadedProgress === 'Uploading...' ? (
									<ProgressBar
										width='200px'
										margin='20px'
										completed={this.state.percentage}
									/>
								) : null}
							</div>
						</div>
					</div>
				)
			case 'manage-users':
				return <ManageUsers />
			case 'emoticons':
				return (
					<div
						className='admin-container v2_table_wrapper'
						style={{ flexDirection: 'column' }}
					>
						<Dialog
							title='Confirm'
							description='Do you want to delete It ?'
							open={this.state.showConfirm}
							handleClose={() => this.setState({ showConfirm: false })}
							handleSubmit={() => this.deleteEmojis()}
						/>
						<div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
							<Button
								disabled={this.state.uploadingEmoji}
								variant='contained'
								color='primary'
								onClick={() => {
									this.attacherRef.click()
								}}
								startIcon={
									this.state.uploadingEmoji ? (
										<CircularProgress size={24} style={{ color: 'white' }} />
									) : (
										<CloudUploadIcon />
									)
								}
							>
								<b>Upload Emoticon</b>
							</Button>
							<input
								id='uploader'
								onChange={async (event: any) => {
									this.setState({ uploadingEmoji: true })
									// upload image
									const data = new FormData()
									data.append('emoji', event.target.files[0])
									const res = await axios.post(`${baseURL}/emojis/`, data, {
										headers: {
											'X-Auth-Token': localStorage.getItem('afroboostauth'),
										},
									})
									this.setState({ uploadingEmoji: false })
									if (res.status === 200) {
										this.props.addToast('Emoticon uploaded successfully', {
											appearance: 'success',
											autoDismiss: true,
										})
										this.fetchEAvatars()
									} else {
										this.props.addToast('Failed to upload Emoticon', {
											appearance: 'error',
											autoDismiss: true,
										})
									}
								}}
								style={{ display: 'none' }}
								type='file'
								ref={(ref: any) => {
									this.attacherRef = ref
								}}
							/>
						</div>
						<div className='admin-emoticons'>
							{this.state.emojis.map((avatar, index) => {
								return (
									<div className='emoji' key={index}>
										<img
											width={'190px'}
											height={'auto'}
											style={{ padding: '0px 20px' }}
											src={`${baseURL}/imoticon/` + avatar}
											alt={'img'}
										/>
										<Button
											className='delete__button'
											variant='contained'
											color='primary'
											onClick={() => this.setState({ showConfirm: true, emoji: avatar })}
										>
											<Delete />
										</Button>
									</div>
								)
							})}
						</div>
					</div>
				)
		}
	}
	render() {
		return (
			<div className='admin-page-container'>
				<div className='admin-page-header adminpage__head'>
					<h2
						style={{
							display: 'flex',
							color: 'white',
							fontFamily: 'Montserrat',
							fontWeight: 'bold',
							marginBottom: 4,
							alignItems: 'center',
						}}
					>
						<div className='adminpage__icon__key'>
							<IoKeyOutline />
						</div>
						{/* <KeyOutline
							color={'#ffffff'}
							height='24px'
							width='24px'
							cssClasses='sidebar-icon'
						/> */}
						{l[localStorage.getItem('language')]['adminPage']}
					</h2>
				</div>
				<div className='admin-navbar'>
					<button
						className={
							this.state.currentPage === 'login-edit'
								? 'ccategory  transfer-button admin-nav_btn  admin-nav_btn1 '
								: 'category  transfer-button admin-nav_btn admin-nav_btn1  '
						}
						style={{ alignItems: 'center', marginLeft: 20 }}
						onClick={() => {
							this.setState({
								currentPage: 'login-edit',
							})
							this.attacherRef = undefined
							this.attacherRef1 = undefined
						}}
					>
						{l[localStorage.getItem('language')]['editIntroVideo']}
					</button>
					<button
						className={
							this.state.currentPage === 'home-banner'
								? 'ccategory  transfer-button admin-nav_btn'
								: 'category  transfer-button admin-nav_btn '
						}
						style={{ alignItems: 'center', marginLeft: 20 }}
						onClick={() => {
							this.setState({
								currentPage: 'home-banner',
							})
							this.attacherRef = undefined
							this.attacherRef1 = undefined
						}}
					>
						{l[localStorage.getItem('language')]['editBanner']}
					</button>
					<button
						className={
							this.state.currentPage === 'about-edit'
								? 'ccategory  transfer-button admin-nav_btn'
								: 'category  transfer-button admin-nav_btn'
						}
						style={{ alignItems: 'center', marginLeft: 20 }}
						onClick={() => {
							this.setState({
								currentPage: 'about-edit',
							})
							this.attacherRef = undefined
							this.attacherRef1 = undefined
						}}
					>
						{l[localStorage.getItem('language')]['editAbout']}
					</button>
					<button
						className={
							this.state.currentPage === 'general-conditions'
								? 'ccategory  transfer-button admin-nav_btn'
								: 'category  transfer-button admin-nav_btn'
						}
						style={{ alignItems: 'center', marginLeft: 20 }}
						onClick={() => {
							this.setState({
								currentPage: 'general-conditions',
							})
							this.attacherRef = undefined
							this.attacherRef1 = undefined
						}}
					>
						{l[localStorage.getItem('language')]['generalConditions']}
					</button>
					<button
						className={
							this.state.currentPage === 'manage-users'
								? 'ccategory  transfer-button admin-nav_btn'
								: 'category  transfer-button admin-nav_btn'
						}
						style={{ alignItems: 'center', marginLeft: 20 }}
						onClick={() => {
							this.setState({
								currentPage: 'manage-users',
							})
							this.attacherRef = undefined
							this.attacherRef1 = undefined
						}}
					>
						{l[localStorage.getItem('language')]['manageUsers']}
					</button>
					<button
						className={
							this.state.currentPage === 'emoticons'
								? 'ccategory  transfer-button admin-nav_btn'
								: 'category  transfer-button admin-nav_btn'
						}
						style={{ alignItems: 'center', marginLeft: 20 }}
						onClick={() => {
							this.setState({
								currentPage: 'emoticons',
							})
							this.attacherRef = undefined
							this.attacherRef1 = undefined
						}}
					>
						Emoticons
					</button>
				</div>
				{this.adminContent()}
			</div>
		)
	}
}

export default withToast(AdminPage)
