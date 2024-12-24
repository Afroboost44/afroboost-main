// @ts-nocheck
import React from 'react'
import './Sidebar.css'
import { Link } from 'react-router-dom'
import { GoogleLogin } from 'react-google-login'
// import {
//   Home,
//   LanguageOutline,
//   CallOutline,
//   RadioOutline,
//   HelpCircleOutline,
//   Eye,
//   EyeOff,
//   PersonAddOutline,
//   CloseOutline,
//   PushOutline,
//   Mail,
//   Heart,
//   PersonCircle,
//   Library,
//   Bookmark,
//   Wallet,
//   Exit,
//   MenuOutline,
//   KeyOutline,
// } from "react-ionicons";

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import axios from 'axios'
import Slide from '@material-ui/core/Slide'
import { TransitionProps } from '@material-ui/core/transitions'
import FacebookLogin from 'react-facebook-login'
import English from '../../english'
import France from '../../france'
import Germany from '../../germany'
import IconButton from '@material-ui/core/IconButton'
import Spain from '../../spain'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import InputAdornment from '@material-ui/core/InputAdornment'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import FilledInput from '@material-ui/core/FilledInput'
import { baseURL, devURL } from '../../api'

import { FiUserPlus } from 'react-icons/fi'
import { BiLogIn } from 'react-icons/bi'
import { IoCloseOutline, IoLibrary, IoLogOut, IoRadioOutline } from 'react-icons/io5'
import { BiMenu } from 'react-icons/bi'
import {
	// mujtaba
	AiOutlineHome,
	AiFillHeart,
	AiFillWallet,
	AiOutlineQuestionCircle,
} from 'react-icons/ai'
import { GoKey } from 'react-icons/go'
import { TbUserCircle } from 'react-icons/tb'
import { BsFillTelephoneFill } from 'react-icons/bs'
import { HiLanguage } from 'react-icons/hi2'

import { LoginSocialFacebook, LoginSocialGoogle } from 'reactjs-social-login'
import { FacebookLoginButton, GoogleLoginButton } from 'react-social-login-buttons'
import { gapi } from 'gapi-script'
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
interface IState {
	selectedPage: string | undefined
	mode: string
	enteredEmail: string
	enteredPassword: string
	enteredPasswordConfirm: string
	registerName: string
	showPassword: boolean
	registerUsername: string
	registerEmail: string
	registerPassword: string
	showPasswordConfirm: boolean
	registerPhone: string
	menuOpened: boolean
	languages: string

	contactEmail: string
	contactName: string
	contactMessage: string
	haveLive: ''
}

interface IProps {
	io: any
}

class Sidebar extends React.Component<IProps, IState> {
	constructor(props: any) {
		super(props)
		this.state = {
			selectedPage: undefined,
			mode: 'none',
			enteredEmail: '',
			enteredPassword: '',
			showPasswordConfirm: false,
			enteredPasswordConfirm: '',
			registerName: '',
			registerUsername: '',
			registerEmail: '',
			showPassword: false,
			registerPassword: '',
			registerPhone: '',
			menuOpened: false,
			languagesOpened: false,

			contactEmail: '',
			contactName: '',
			contactMessage: '',
			facebookText: false,
		}
		axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*'
	}

	checkLive = async () => {
		try {
			const res = await axios.get(
				`${baseURL}/post/checkLive/${localStorage.getItem('afroboostid')}`,
				{
					headers: {
						'X-Auth-Token': localStorage.getItem('afroboostauth'),
					},
				},
			)
			console.log(res.data)
			if (res.status === 200) {
				this.setState({ haveLive: res.data.live.id })
			}
		} catch (error) {
			console.error('Error fetching user list:', error)
		}
	}
	componentWillReceiveProps() {
		console.log('Changed')
	}

	componentDidMount() {
		this.setState({ selectedPage: window.location.href.split('/').pop() }, () => {
			console.log(this.state.selectedPage)
		})

		function start() {
			gapi.client.init({
				clientId:
					'795228212473-ftsk9hutibim1kqqqvqb8fberemu47h3.apps.googleusercontent.com',
				scope: '',
			})
		}

		gapi.load('client:auth2', start)

		this.checkLive()
	}

	render() {
		return (
			<div className='sidebar'>
				<Dialog
					open={this.state.mode === 'invalid-register'}
					TransitionComponent={Transition}
					keepMounted
					onClose={() => {
						this.setState({ mode: 'login' })
					}}
					aria-labelledby='alert-dialog-slide-title'
					aria-describedby='alert-dialog-slide-description'
				>
					<DialogTitle id='alert-dialog-slide-title'>
						{'Registration unsuccessful'}
					</DialogTitle>
					<DialogContent>
						<DialogContentText id='alert-dialog-slide-description'>
							Please fill out the registration form with valid information and try again.
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
				<Dialog
					open={this.state.mode === 'invalid'}
					TransitionComponent={Transition}
					keepMounted
					onClose={() => {
						this.setState({ mode: 'register' })
					}}
					aria-labelledby='alert-dialog-slide-title'
					aria-describedby='alert-dialog-slide-description'
				>
					<DialogTitle id='alert-dialog-slide-title'>
						{'Invalid e-mail or password'}
					</DialogTitle>
					<DialogContent>
						<DialogContentText id='alert-dialog-slide-description'>
							Please enter a valid e-mail address and password and try logging in again.
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button
							onClick={() => {
								this.setState({ mode: 'login' })
							}}
							color='primary'
						>
							OK
						</Button>
					</DialogActions>
				</Dialog>
				<Dialog
					bodyStyle={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
					TransitionComponent={Transition}
					style={{ textAlign: 'center', justifyContent: 'center' }}
					open={this.state.mode === 'login'}
					onClose={() => {}}
					aria-labelledby='form-dialog-title'
				>
					<div style={{ marginTop: 24 }}>
						<img src={`${baseURL}/header_logo`} alt='logo' id='logo' />
					</div>
					<DialogTitle style={{ textAlign: 'center' }} id='form-dialog-title'>
						<b>LOG IN TO AFROBOOST</b>
					</DialogTitle>
					<DialogContent>
						<DialogContentText>
							Log in to Afroboost by entering your e-mail and password or join the
							community by registering using the button below.
						</DialogContentText>
						<TextField
							onChange={(e: any) => {
								this.setState({ enteredEmail: e.target.value })
							}}
							variant='filled'
							autoFocus
							margin='dense'
							id='name'
							label='Enter your e-mail address'
							type='email'
							fullWidth
						/>
						<FormControl style={{ marginTop: 10 }} fullWidth variant='filled'>
							<InputLabel style={{ marginTop: -4 }} htmlFor='filled-adornment-password'>
								Enter your password
							</InputLabel>
							<FilledInput
								onChange={(e: any) => {
									this.setState({ enteredPassword: e.target.value })
								}}
								variant='filled'
								margin='dense'
								id='filled-adornment-password'
								label='Enter your password'
								type={this.state.showPassword ? 'text' : 'password'}
								endAdornment={
									<InputAdornment position='end'>
										<IconButton
											aria-label='toggle password visibility'
											onClick={() =>
												this.setState({
													showPassword: !this.state.showPassword,
												})
											}
											edge='end'
										>
											{this.state.showPassword ? <Visibility /> : <VisibilityOff />}
										</IconButton>
									</InputAdornment>
								}
								fullWidth
							/>
						</FormControl>
						{/* <div className='social__container'>
							Or
							<div className='social__logins'>
								<LoginSocialGoogle
									redirect_uri='https://afroboost.com'
									className='social__login'
									client_id='795228212473-ftsk9hutibim1kqqqvqb8fberemu47h3.apps.googleusercontent.com'
									discoveryDocs={['claims_supported']} // Note: It should be an array
									access_type='offline'
									onResolve={async ({ provider, data }) => {
										console.log(data)

										try {
											const loginResponse = await axios.post(`${baseURL}/auth/login`, {
												mail_address: data.email,
												password: data.access_token,
											})

											if (loginResponse.status === 200) {
												localStorage.setItem('afroboostauth', loginResponse.data.message)
												localStorage.setItem(
													'afroboostname',
													loginResponse.data.fullName || '',
												)
												localStorage.setItem(
													'afroboostusername',
													loginResponse.data.username || '',
												)
												localStorage.setItem('afroboostid', loginResponse.data.userID)
												return window.location.reload()
											} else {
												this.setState({ mode: 'invalid' })
											}
										} catch (error) {
											this.setState({ mode: 'invalid' })
										}
									}}
									onReject={err => {
										alert('Invalid credentials' + err)
									}}
								>
									<GoogleLoginButton>
										<span style={{ color: 'black' }}>Login with Google</span>
									</GoogleLoginButton>
								</LoginSocialGoogle>

								<LoginSocialFacebook
									className='social__login'
									appId='310387871559527'
									onResolve={async ({ provider, data }) => {
										console.log(data)

										try {
											const loginResponse = await axios.post(`${baseURL}/auth/login`, {
												mail_address: data.email,
												password: data.accessToken,
											})

											if (loginResponse.status === 200) {
												localStorage.setItem('afroboostauth', loginResponse.data.message)
												localStorage.setItem(
													'afroboostname',
													loginResponse.data.fullName || '',
												)
												localStorage.setItem(
													'afroboostusername',
													loginResponse.data.username || '',
												)
												localStorage.setItem('afroboostid', loginResponse.data.userID)
												return window.location.reload()
											} else {
												this.setState({ mode: 'invalid' })
											}
										} catch (error) {
											this.setState({ mode: 'invalid' })
										}
									}}
									onReject={err => {
										console.log('Invalid credentails' + err)
									}}
								>
									<FacebookLoginButton>
										<span>Login with Facebook</span>
									</FacebookLoginButton>
								</LoginSocialFacebook>
							</div>
						</div> */}
						{/* <GoogleLogin
							clientId='795228212473-ftsk9hutibim1kqqqvqb8fberemu47h3.apps.googleusercontent.com'
							buttonText='Login using Google'
							style={{ fontFamily: 'Montserrat' }}
							onSuccess={async response => {
								console.log('responseresponse', response)
								try {
									const request = await axios.get(
										`${baseURL}/auth/social_login?type=google`,
										{
											headers: {
												id_token: response.tokenObj.id_token,
											},
										},
									)
									if (request.status === 200) {
										localStorage.setItem('afroboostauth', request.data.message)
										localStorage.setItem('afroboostname', request.data.fullName)
										localStorage.setItem('afroboostusername', request.data.username)
										localStorage.setItem('afroboostid', request.data.userID)
										return window.location.reload()
									}
									this.setState({ mode: 'invalid' })
								} catch (error) {
									this.setState({ mode: 'invalid' })
								}
							}}
							onFailure={error => {
								console.log(error)
							}}
							cookiePolicy={'single_host_origin'}
						/> */}
						{/* <FacebookLogin
							appId='885375138823671'
							cssClasses='fbloginbtn'
							icon='fa-facebook'
							disableMobileRedirect={true}
							fields='name,email,picture'
							onClick={async response => {}}
							callback={async response => {
								try {
									const request = await axios.post(`${baseURL}/auth/login`, {
										mail_address: response.email,
										password: response.id,
									})
									if (request.status === 200) {
										localStorage.setItem('afroboostauth', request.data.message)
										localStorage.setItem('afroboostname', request.data.fullName)
										localStorage.setItem('afroboostusername', request.data.username)
										localStorage.setItem('afroboostid', request.data.userID)
										return window.location.reload()
									}
									this.setState({ mode: 'invalid' })
								} catch (error) {
									this.setState({ mode: 'invalid' })
								}
							}}
						/> */}
						<DialogContentText style={{ marginTop: 14 }}>
							By logging in you accept our{' '}
							<a href={`${baseURL}/getTermsFile`}>terms of service.</a>
						</DialogContentText>
						<DialogContentText style={{ marginTop: 14 }}>
							Forgot your password? <a href={`${devURL}/reset`}>Reset it here.</a>
						</DialogContentText>
					</DialogContent>
					<DialogActions style={{ justifyContent: 'center', marginTop: 14 }}>
						<Button
							onClick={async () => {
								try {
									const request = await axios.post(`${baseURL}/auth/login`, {
										mail_address: this.state.enteredEmail,
										password: this.state.enteredPassword,
									})
									if (request.status === 200) {
										localStorage.setItem('afroboostauth', request.data.message)
										localStorage.setItem('afroboostname', request.data.fullName)
										localStorage.setItem('afroboostusername', request.data.username)
										localStorage.setItem('afroboostid', request.data.userID)
										return window.location.reload()
									}
									this.setState({ mode: 'invalid' })
								} catch (error) {
									this.setState({ mode: 'invalid' })
								}
							}}
							color='primary'
						>
							LOG IN
						</Button>
						<Button
							onClick={() => {
								this.setState({ mode: 'none' })
							}}
							color='primary'
						>
							CLOSE
						</Button>
					</DialogActions>
				</Dialog>

				<Dialog
					TransitionComponent={Transition}
					style={{ textAlign: 'center', justifyContent: 'center' }}
					open={this.state.mode === 'register'}
					onClose={() => {}}
					aria-labelledby='form-dialog-title'
				>
					<a style={{ marginTop: 24 }} href='#'>
						<img src={`${baseURL}/header_logo`} alt='logo' id='logo' />
					</a>
					<DialogTitle style={{ textAlign: 'center' }} id='form-dialog-title'>
						<b>REGISTER TO AFROBOOST</b>
					</DialogTitle>
					<DialogContent>
						<DialogContentText>
							Welcome to Afroboost! Please fill in the form below in order to register
							into Afroboost platform and start sharing your amazing content!
						</DialogContentText>
						<TextField
							autoFocus
							margin='dense'
							variant='filled'
							id='name'
							label='Enter your full name'
							type='text'
							value={this.state.registerName}
							onChange={e => this.setState({ registerName: e.target.value })}
							fullWidth
						/>
						<TextField
							variant='filled'
							margin='dense'
							id='name'
							label='Enter your desired username (all lowercase, without spaces)'
							type='text'
							value={this.state.registerUsername}
							onChange={e => {
								const username = e.target.value.toLowerCase().replace(/\s/g, '') // Convert to lowercase and remove spaces
								this.setState({ registerUsername: username })
							}}
							fullWidth
						/>

						<TextField
							variant='filled'
							margin='dense'
							id='name'
							label='Enter your e-mail address here'
							value={this.state.registerEmail}
							onChange={e => this.setState({ registerEmail: e.target.value })}
							type='mail'
							fullWidth
						/>
						<FormControl style={{ marginTop: 10 }} fullWidth variant='filled'>
							<InputLabel
								fullWidth
								style={{ marginTop: -4 }}
								htmlFor='filled-adornment-password'
							>
								Enter your password (at least 8 characters long)
							</InputLabel>
							<FilledInput
								variant='filled'
								margin='dense'
								id='filled-adornment-password'
								type='password'
								value={this.state.registerPassword}
								onChange={e => this.setState({ registerPassword: e.target.value })}
								fullWidth
								type={this.state.showPassword ? 'text' : 'password'}
								endAdornment={
									<InputAdornment position='end'>
										<IconButton
											aria-label='toggle password visibility'
											onClick={(e: any) =>
												this.setState({
													showPassword: !this.state.showPassword,
												})
											}
											onMouseDown={(e: any) => {}}
											edge='end'
										>
											{this.state.showPassword ? <Visibility /> : <VisibilityOff />}
										</IconButton>
									</InputAdornment>
								}
							/>
						</FormControl>
						<FormControl style={{ marginTop: 10 }} fullWidth variant='filled'>
							<InputLabel
								fullWidth
								style={{ marginTop: -4 }}
								htmlFor='filled-adornment-password'
							>
								Confirm your password
							</InputLabel>
							<FilledInput
								variant='filled'
								margin='dense'
								id='filled-adornment-password'
								type='password'
								value={this.state.enteredPasswordConfirm}
								onChange={e => this.setState({ enteredPasswordConfirm: e.target.value })}
								fullWidth
								type={this.state.showPasswordConfirm ? 'text' : 'password'}
								endAdornment={
									<InputAdornment position='end'>
										<IconButton
											aria-label='toggle password visibility'
											onClick={(e: any) =>
												this.setState({
													showPasswordConfirm: !this.state.showPasswordConfirm,
												})
											}
											onMouseDown={(e: any) => {}}
											edge='end'
										>
											{this.state.showPasswordConfirm ? (
												<Visibility />
											) : (
												<VisibilityOff />
											)}
										</IconButton>
									</InputAdornment>
								}
							/>
						</FormControl>
						<TextField
							variant='filled'
							margin='dense'
							id='name'
							label='Enter your phone number here'
							type='text'
							value={this.state.registerPhone}
							onChange={e => this.setState({ registerPhone: e.target.value })}
							fullWidth
						/>
						{/* <GoogleLogin
							clientId='795228212473-ftsk9hutibim1kqqqvqb8fberemu47h3.apps.googleusercontent.com'
							buttonText='Register with Google 3.0'
							style={{ fontFamily: 'Montserrat' }}
							className='googleRegistration d'
							onClick={async response => {
								try {
									const request = await axios.post(`${baseURL}/auth/register`, {
										name: response.profileObj.name,
										username: response.profileObj.givenName + new Date().valueOf(),
										mail_address: response.profileObj.email,
										password: response.profileObj.googleId,
									})
									if (request.status === 200) {
										try {
											const request = await axios.post(`${baseURL}/auth/login`, {
												mail_address: response.profileObj.email,
												password: response.profileObj.googleId,
											})
											if (request.status === 200) {
												localStorage.setItem('afroboostauth', request.data.message)
												localStorage.setItem('afroboostname', request.data.fullName)
												localStorage.setItem('afroboostusername', request.data.username)
												localStorage.setItem('afroboostid', request.data.userID)
												return window.location.reload()
											}
											this.setState({ mode: 'invalid' })
										} catch (error) {
											this.setState({ mode: 'invalid' })
										}
									}
									this.setState({ mode: 'invalid-register' })
								} catch (error) {
									console.log(error)
								}
							}}
							onFailure={error => {
								console.log(error)
							}}
							cookiePolicy={'single_host_origin'}
						/> */}
						{/* myfacebooklogin */}
						{/* <div className='social__container'>
							Or
							<div className='social__logins'>
								<LoginSocialGoogle
									className='social__login'
									client_id='795228212473-ftsk9hutibim1kqqqvqb8fberemu47h3.apps.googleusercontent.com'
									discoveryDocs={['claims_supported']} // Note: It should be an array
									access_type='offline'
									onResolve={async ({ provider, data }) => {
										console.log(data)
										try {
											const registerResponse = await axios.post(
												`${baseURL}/auth/register`,
												{
													name: data.name,
													username: data.given_name.toLowerCase(),
													mail_address: data.email,
													password: data.access_token,
												},
											)

											if (registerResponse.status === 200) {
												try {
													const loginResponse = await axios.post(
														`${baseURL}/auth/login`,
														{
															mail_address: data.email,
															password: data.access_token,
														},
													)

													if (loginResponse.status === 200) {
														localStorage.setItem(
															'afroboostauth',
															loginResponse.data.message,
														)
														localStorage.setItem(
															'afroboostname',
															loginResponse.data.fullName,
														)
														localStorage.setItem(
															'afroboostusername',
															loginResponse.data.username,
														)
														localStorage.setItem('afroboostid', loginResponse.data.userID)
														return window.location.reload()
													} else {
														this.setState({ mode: 'invalid' })
													}
												} catch (error) {
													this.setState({ mode: 'invalid' })
												}
											} else {
												this.setState({ mode: 'invalid-register' })
											}
										} catch (error) {
											console.log(error)
										}
									}}
									onReject={err => {
										alert('Invalid credentials' + err)
									}}
								>
									<GoogleLoginButton>
										<span style={{ color: 'black' }}>Register with Google</span>
									</GoogleLoginButton>
								</LoginSocialGoogle>

								<LoginSocialFacebook
									className='social__login'
									appId='310387871559527'
									onResolve={async ({ provider, data }) => {
										console.log(data)
										try {
											const registerResponse = await axios.post(
												`${baseURL}/auth/register`,
												{
													name: data.name,
													username: data.first_name.toLowerCase().replace(/\s+/g, ''),
													mail_address: data.email,
													password: data.accessToken,
												},
											)

											if (registerResponse.status === 200) {
												try {
													const loginResponse = await axios.post(
														`${baseURL}/auth/login`,
														{
															mail_address: data.email,
															password: data.accessToken,
														},
													)

													if (loginResponse.status === 200) {
														localStorage.setItem(
															'afroboostauth',
															loginResponse.data.message,
														)
														localStorage.setItem(
															'afroboostname',
															loginResponse.data.fullName,
														)
														localStorage.setItem(
															'afroboostusername',
															loginResponse.data.username,
														)
														localStorage.setItem('afroboostid', loginResponse.data.userID)
														return window.location.reload()
													} else {
														this.setState({ mode: 'invalid' })
													}
												} catch (error) {
													this.setState({ mode: 'invalid' })
												}
											} else {
												this.setState({ mode: 'invalid-register' })
											}
										} catch (error) {
											console.log(error)
										}
									}}
									onReject={err => {
										console.log('Invalid credentails' + err)
									}}
								>
									<FacebookLoginButton>
										<span>Register with Facebook</span>
									</FacebookLoginButton>
								</LoginSocialFacebook>
							</div>
						</div> */}
						{/* <LoginSocialInstagram
							client_id='3687810478155353'
							client_secret='116f7b92a90ce263dc00092761c80bcb'
							redirect_uri='http://localhost:3000'
							// onLoginStart=http://localhost:3000/{() => alert('Login start')}
							// onLogoutSuccess={() => alert('Login end')}
							onResolve={res => {
								console.log(res)
							}}
							onReject={err => {
								console.log('Invalid credentails' + err)
							}}
						>
							<InstagramLoginButton />
						</LoginSocialInstagram> */}
						{/* <FacebookLogin
							appId='1691476321298691'
							cssClasses='fbloginbtn'
							icon='fa-facebook'
							textButton='Register with Facebook'
							disableMobileRedirect={true}
							fields='name,email,picture'
							onSuccess={async response => {}}
							callback={async response => {
								if (this.state.enteredPasswordConfirm !== this.state.registerPassword)
									return this.setState({ mode: 'invalid-register' })
								try {
									const request = await axios.post(`${baseURL}/auth/register`, {
										name: response.name,
										username: response.name.split(' ')[0] + new Date().valueOf(),
										mail_address: response.email,
										password: response.id,
									})
									if (request.status === 200) {
										try {
											const request = await axios.post(`${baseURL}/auth/login`, {
												mail_address: response.email,
												password: response.id,
											})
											if (request.status === 200) {
												localStorage.setItem('afroboostauth', request.data.message)
												localStorage.setItem('afroboostname', request.data.fullName)
												localStorage.setItem('afroboostusername', request.data.username)
												localStorage.setItem('afroboostid', request.data.userID)
												return window.location.reload()
											}
											this.setState({ mode: 'invalid' })
										} catch (error) {
											this.setState({ mode: 'invalid' })
										}
									}
									this.setState({ mode: 'invalid-register' })
								} catch (error) {
									console.log(error)
								}
							}}
						/> */}
						<DialogContentText style={{ marginTop: 14 }}>
							By registering you accept our{' '}
							<a href={`${baseURL}/getTermsFile`}>terms of service.</a>
						</DialogContentText>
					</DialogContent>
					<DialogActions style={{ justifyContent: 'center', marginTop: 14 }}>
						<Button
							onClick={async () => {
								if (
									this.state.registerName == '' ||
									this.state.registerEmail == '' ||
									this.state.registerPassword == '' ||
									this.state.registerUsername == ''
								) {
									alert('Veuillez remplir tous les champs requis')
								} else {
									try {
										const request = await axios.post(`${baseURL}/auth/register`, {
											name: this.state.registerName,
											username: this.state.registerUsername,
											mail_address: this.state.registerEmail,
											password: this.state.registerPassword,
											phone_number: this.state.registerPhone,
										})
										if (request.status === 200) {
											try {
												const request = await axios.post(`${baseURL}/auth/login`, {
													mail_address: this.state.registerEmail,
													password: this.state.registerPassword,
												})
												if (request.status === 200) {
													localStorage.setItem('afroboostauth', request.data.message)
													localStorage.setItem('afroboostname', request.data.fullName)
													localStorage.setItem('afroboostusername', request.data.username)
													localStorage.setItem('afroboostid', request.data.userID)
													return window.location.reload()
												}
												this.setState({ mode: 'invalid' })
											} catch (error) {
												this.setState({ mode: 'invalid' })
											}
										}
										this.setState({ mode: 'invalid-register' })
									} catch (error) {
										this.setState({ mode: 'invalid-register' })
									}
								}
							}}
							color='primary'
						>
							REGISTER
						</Button>
						<Button
							onClick={() => {
								this.setState({ mode: 'none' })
							}}
							color='primary'
						>
							CLOSE
						</Button>
					</DialogActions>
				</Dialog>
				<div
					style={{
						backgroundImage: `url( ${baseURL}/profileImage/${localStorage.getItem(
							'afroboostid',
						)})`,
						height: 150,
						width: 150,
						borderRadius: '50%',
						marginTop: 20,
						backgroundSize: '120%',
						backgroundPositionX: 'center',
					}}
				/>
				<span
					style={{
						color: 'white',
						fontSize: 24,
						fontWeight: 'bold',
						marginTop: 14,
						borderBottom: '1px solid white',
					}}
				>
					{localStorage.getItem('afroboostname')}
				</span>

				{localStorage.getItem('afroboostauth') !== 'guest' ? (
					<>
						{this.state.menuOpened ? (
							// <CloseOutline
							//   color={"#00000"}
							//   cssClasses="menu-button"
							//   onClick={() => this.setState({ menuOpened: false })}
							//   height="22px"
							//   width="22px"
							// />
							<div
								className='menu__icon menu-button'
								onClick={() => this.setState({ menuOpened: false })}
							>
								<IoCloseOutline />
							</div>
						) : (
							// <MenuOutline
							//   color={"#00000"}
							//   cssClasses="menu-button"
							//   onClick={() => this.setState({ menuOpened: true })}
							//   height="22px"
							//   width="22px"
							// />

							<div
								className='menu__icon menu-button'
								onClick={() => this.setState({ menuOpened: true })}
							>
								<BiMenu />
							</div>
						)}
						{this.state.menuOpened ? (
							<div className='mycollapse-menu'>
								<span onClick={() => this.setState({ selectedPage: undefined })}>
									<Link
										className='sidebar-button'
										style={{ marginTop: 14, display: 'flex' }}
										to='/'
									>
										{/* <Home
                      color={"#ffffff"}
                      height="22px"
                      width="22px"
                      cssClasses="sidebar-icon"
                    /> */}
										<div className='sidebar__icon'>
											<AiOutlineHome />
										</div>
										<span
											className={
												this.state.selectedPage
													? 'disappearing-button-homepage sidebar-button'
													: 'sidebar-button'
											}
											style={{
												color: 'white',
												fontSize: 18,
												marginTop: 4,
												fontWeight: 600,
											}}
										>
											{l[localStorage.getItem('language')].homepage}
										</span>
									</Link>
								</span>
								{localStorage.getItem('afroboostid') === '4' ? (
									<span onClick={() => this.setState({ selectedPage: 'admin' })}>
										<Link
											className='sidebar-button'
											style={{ marginTop: 14, display: 'flex' }}
											to='/admin'
										>
											{/* <KeyOutline
                        color={"#ffffff"}
                        height="22px"
                        width="22px"
                        cssClasses="sidebar-icon"
                      /> */}
											<div className='sidebar__icon'>
												<GoKey />
											</div>
											<span
												className={
													this.state.selectedPage === 'admin'
														? 'sidebar-button'
														: 'disappearing-button sidebar-button'
												}
												style={{
													color: 'white',
													fontSize: 16,
													marginTop: 4,
													fontWeight: 600,
												}}
											>
												Admin
											</span>
										</Link>
									</span>
								) : null}
								<span onClick={() => this.setState({ selectedPage: 'profile' })}>
									<a
										className='sidebar-button'
										style={{ marginTop: 14, display: 'flex' }}
										href={'/profile/' + localStorage.getItem('afroboostusername')}
									>
										{/* <PersonCircle
                      color={"#ffffff"}
                      height="24px"
                      width="24px"
                      cssClasses="sidebar-icon"
                    /> */}
										<div className='sidebar__icon'>
											<TbUserCircle />
										</div>
										<span
											className={
												this.state.selectedPage === 'profile'
													? 'sidebar-button'
													: 'sidebar-button disappearing-button'
											}
											style={{
												color: 'white',
												fontSize: 18,
												marginTop: 4,
												fontWeight: 600,
											}}
										>
											{l[localStorage.getItem('language')].profile}
										</span>
									</a>
								</span>

								<span onClick={() => this.setState({ selectedPage: 'library' })}>
									<Link
										className='sidebar-button'
										style={{ marginTop: 14, display: 'flex' }}
										to='/library'
									>
										{/* <Library
                      color={"#ffffff"}
                      height="22px"
                      width="22px"
                      cssClasses="sidebar-icon"
                    /> */}
										<div className='sidebar__icon'>
											<IoLibrary />
										</div>
										<span
											className={
												this.state.selectedPage === 'library'
													? 'sidebar-button'
													: 'disappearing-button sidebar-button'
											}
											style={{
												color: 'white',
												fontSize: 18,
												marginTop: 4,
												fontWeight: 600,
											}}
										>
											{l[localStorage.getItem('language')].library}
										</span>
									</Link>
								</span>
								<span onClick={() => this.setState({ selectedPage: 'live' })}>
									{/* mujtaba */}

									<Link
										className='sidebar-button'
										style={{ marginTop: 14, display: 'flex' }}
										to={`/live/${this.state.haveLive ? this.state.haveLive : ''}`}
										// to={`/live`}
									>
										<div className='sidebar__icon'>
											<IoRadioOutline />
										</div>
										<span
											className={
												this.state.selectedPage === 'live'
													? 'sidebar-button'
													: 'disappearing-button sidebar-button'
											}
											style={{
												color: 'white',
												fontSize: 18,
												marginTop: 4,
												fontWeight: 600,
											}}
										>
											Live
										</span>
									</Link>
								</span>
								<span onClick={() => this.setState({ selectedPage: 'liked' })}>
									<Link
										className='sidebar-button'
										style={{ marginTop: 14, display: 'flex' }}
										to='/liked'
									>
										{/* <Heart
                      color={"#ffffff"}
                      height="22px"
                      width="22px"
                      cssClasses="sidebar-icon"
                    /> */}
										<div className='sidebar__icon'>
											<AiFillHeart />
										</div>
										<span
											className={
												this.state.selectedPage === 'liked'
													? 'sidebar-button'
													: 'sidebar-button disappearing-button-heart'
											}
											style={{
												color: 'white',
												fontSize: 18,
												marginTop: 4,
												fontWeight: 600,
											}}
										>
											{' '}
											{l[localStorage.getItem('language')].liked}
										</span>
									</Link>
								</span>
								<span onClick={() => this.setState({ selectedPage: 'transfer' })}>
									<Link
										className='sidebar-button'
										style={{ marginTop: 14, display: 'flex' }}
										to='/transfer'
									>
										{/* <Wallet
                      color={"#ffffff"}
                      height="24px"
                      width="24px"
                      cssClasses="sidebar-icon"
                    /> */}
										<div className='sidebar__icon'>
											<AiFillWallet />
										</div>
										<span
											className={
												this.state.selectedPage === 'transfer'
													? 'sidebar-button'
													: 'sidebar-button disappearing-button'
											}
											style={{
												color: 'white',
												fontSize: 18,
												marginTop: 4,
												fontWeight: 600,
											}}
										>
											{' '}
											{l[localStorage.getItem('language')].transfer}
										</span>
									</Link>
								</span>
								<span onClick={() => this.setState({ selectedPage: 'aboutus' })}>
									<Link
										className='sidebar-button'
										style={{ marginTop: 14, display: 'flex' }}
										to='/aboutus'
									>
										{/* <HelpCircleOutline
                      color={"#ffffff"}
                      height="24px"
                      width="24px"
                      cssClasses="sidebar-icon"
                    /> */}
										<div className='sidebar__icon'>
											<AiOutlineQuestionCircle />
										</div>
										<span
											className={
												this.state.selectedPage === 'aboutus'
													? 'sidebar-button'
													: 'sidebar-button disappearing-button'
											}
											style={{
												color: 'white',
												fontSize: 18,
												marginTop: 4,
												fontWeight: 600,
											}}
										>
											{' '}
											{l[localStorage.getItem('language')].aboutus}
										</span>
									</Link>
								</span>

								<span onClick={() => this.setState({ mode: 'contact' })}>
									<Link
										className='sidebar-button'
										style={{ marginTop: 14, display: 'flex' }}
										onClick={async () => {
											const request = await axios.post(
												`${baseURL}/user/gomessage`,
												{
													targetID: 7,
												},
												{
													headers: {
														'X-Auth-Token': localStorage.getItem('afroboostauth'),
													},
												},
											)
											//(
											// 	localStorage.getItem('afroboostid') === 4
											// 		? (window.location.href = `${devURL}/messages`)
											// 		: (window.location.href = `${devURL}/chat/3`),
											// )
											window.location.href = `${devURL}/messages`
										}}
									>
										{/* <CallOutline
                      color={"#ffffff"}
                      height="24px"
                      width="24px"
                      cssClasses="sidebar-icon"
                    /> */}
										<div className='sidebar__icon'>
											<BsFillTelephoneFill />
										</div>
										<span
											className={
												this.state.selectedPage === 'contact'
													? 'sidebar-button'
													: 'sidebar-button disappearing-button'
											}
											style={{
												color: 'white',
												fontSize: 18,
												marginTop: 4,
												fontWeight: 600,
											}}
										>
											{' '}
											{l[localStorage.getItem('language')].contact}
										</span>
									</Link>
								</span>
								<span
									onClick={() => {
										localStorage.setItem('afroboostauth', 'guest')
										localStorage.setItem('afroboostname', 'Not logged in')
										localStorage.setItem('afroboostusername', '#')
										localStorage.setItem('afroboostid', '-1')
										window.location.href = '/'
									}}
								>
									<button
										// href="javascript:void(0)"
										className='sidebar-button'
										style={{ marginTop: 14, display: 'flex' }}
									>
										{/* <Exit
                      color={"#ffffff"}
                      height="24px"
                      width="24px"
                      cssClasses="sidebar-icon"
                    /> */}
										<div className='sidebar__icon'>
											<IoLogOut />{' '}
										</div>
										<span
											className={'disappearing-button'}
											style={{
												color: 'white',
												fontSize: 18,
												marginTop: 4,
												fontWeight: 600,
											}}
										>
											{' '}
											{l[localStorage.getItem('language')].logout}
										</span>
									</button>
								</span>
								<span
									onClick={() => {
										this.setState({
											languagesOpened: !this.state.languagesOpened,
										})
									}}
								>
									<button
										className='sidebar-button'
										style={{ marginTop: 14, display: 'flex' }}
										// href="javascript:void(0)"
									>
										{/* <LanguageOutline
                      color={"#ffffff"}
                      height="24px"
                      width="24px"
                      cssClasses="sidebar-icon"
                    /> */}
										<div className='sidebar__icon' style={{ display: 'flex' }}>
											<HiLanguage />
											<span
												className='mobile_view_sidebar_icon'
												style={{
													color: 'white',
													fontSize: 18,
													marginTop: 4,
													fontWeight: 600,
												}}
											>
												Languages
											</span>
										</div>
										<span
											className={'disappearing-button-homepage'}
											style={{
												color: 'white',
												fontSize: 18,
												marginTop: 4,
												fontWeight: 600,
											}}
										>
											{' '}
											Languages
										</span>
									</button>
								</span>
							</div>
						) : null}
					</>
				) : (
					<>
						<span onClick={() => this.setState({ mode: 'login' })}>
							<button
								// href="javascript:void(0)"
								className='sidebar-button'
								style={{ marginTop: 14, display: 'flex' }}
							>
								{/* <PushOutline
                  color={"#ffffff"}
                  height="24px"
                  width="24px"
                  cssClasses="sidebar-icon"
                /> */}

								<div className='custom__icon'>
									<BiLogIn />
								</div>
								<span
									className={
										this.state.selectedPage === 'transfer' ? '' : 'disappearing-button'
									}
									style={{
										color: 'white',
										fontSize: 18,
										marginTop: 4,
										fontWeight: 600,
									}}
								>
									{' '}
									Login
								</span>
							</button>
						</span>
						<span
							onClick={() => {
								this.setState({ mode: 'register' })
							}}
						>
							<button
								className='sidebar-button'
								style={{ marginTop: 14, display: 'flex' }}
								// href="javascript:void(0)"
							>
								{/* <PersonAddOutline
                  color={"#ffffff"}
                  height="24px"
                  width="24px"
                  cssClasses="sidebar-icon"
                /> */}

								<div className='custom__icon'>
									<FiUserPlus />
								</div>
								<span
									className={'disappearing-button'}
									style={{
										color: 'white',
										fontSize: 18,
										marginTop: 4,
										fontWeight: 600,
									}}
								>
									{' '}
									Register
								</span>
							</button>
						</span>
					</>
				)}
				{this.state.menuOpened && localStorage.getItem('afroboostauth') !== 'guest' ? (
					this.state.languagesOpened ? (
						<div className='languages' style={{ display: 'flex' }}>
							<button
								// href="javascript:void(0)"
								onClick={() => {
									localStorage.setItem('language', 'en')
									window.location.reload()
								}}
								className='buttonlang'
							>
								<img src={`${devURL}/uk.png`} width='35px' height='35px' alt='' />
							</button>
							<button
								// href="javascript:void(0)"
								onClick={() => {
									localStorage.setItem('language', 'fr')
									window.location.reload()
								}}
								className='buttonlang'
							>
								<img src={`${devURL}/france.png`} width='35px' height='35px' alt='' />
							</button>
							<button
								// href="javascript:void(0)"
								onClick={() => {
									localStorage.setItem('language', 'ge')
									window.location.reload()
								}}
								className='buttonlang'
							>
								<img src={`${devURL}/germany.png`} width='35px' height='35px' alt='' />
							</button>
							<button
								// href="javascript:void(0)"
								onClick={() => {
									localStorage.setItem('language', 'sp')
									window.location.reload()
								}}
								className='buttonlang'
							>
								<img src={`${devURL}/spain.png`} width='35px' height='35px' alt='' />
							</button>
						</div>
					) : null
				) : null}
			</div>
		)
	}
}

export default Sidebar
