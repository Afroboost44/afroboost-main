import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode.react'
import axios from 'axios'
import TimePicker from 'react-time-picker'
import './scan.css'
import { baseURL, devURL } from '../../api'
import 'react-time-picker/dist/TimePicker.css'
import 'react-clock/dist/Clock.css'
import Modal from 'react-modal' // Import the modal library
import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@material-ui/core'
import { IoCheckmarkDoneCircleSharp, IoClose } from 'react-icons/io5'
import { HiUserGroup } from 'react-icons/hi2'
import { BiReset } from 'react-icons/bi'
const dummyUserList = [
	{ id: 1, name: 'John Doe', quantity: '3', total_session: '3', validation: true },
	{ id: 2, name: 'Jane Smith', quantity: '3', total_session: '3', validation: false },
	{ id: 3, name: 'Bob Johnson', quantity: '3', total_session: '3', validation: true },
]
const modalStyle = {
	overlay: {
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		zIndex: 1000,
	},
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		transform: 'translate(-50%, -50%)',
		padding: '2rem',
		border: '1px solid #ccc',
		borderRadius: '4px',
		// maxWidth: '500px',
		background: '#ffffff',
	},
}
const QRCodeGenerator = () => {
	const [sessiondate, setSessiondate] = useState('')
	const [sessiontimezone, setSessiontimezone] = useState('12:00 PM') // Set the default timezone
	const [validateSession, setValidateSession] = useState(false)
	const [readyforsession, setReadyforsession] = useState(false)
	const [showValidation, setShowValidation] = useState(false)
	const [checkStudentRegister, setCheckStudentRegister] = useState(false)
	const [todaySessionStatus, setTodaySessionStatus] = useState(false)

	const [showUserListModal, setShowUserListModal] = useState(false)
	const [userList, setUserList] = useState([])

	useEffect(() => {
		checkUserIsCouch()
		checkIsSessionAlreadyValidated()
		todaySessionCheck()
		checkIsStudentHave()
	}, [])

	const handleSubmit = async () => {
		const dataToSend = {
			sessiondate,
			sessiontimezone,
		}

		console.log('My Debug')
		console.log(dataToSend)

		try {
			const res = await axios.post(
				`${baseURL}/post/varify_session/${localStorage.getItem('afroboostid')}`,
				dataToSend, // Include the dataToSend object as the request payload
				{
					headers: {
						'X-Auth-Token': localStorage.getItem('afroboostauth'),
					},
				},
			)

			console.log('Backend response:', res.data)
			setValidateSession(true)
			alert('Validation de session réussie')
		} catch (error) {
			console.error('Error sending data to backend:', error)
			alert('La validation de la session échoue')
			setValidateSession(false)
		}
	}

	const handleReadyButton = () => {
		setReadyforsession(true)
	}

	function formatTimeToAMPM(timeString) {
		const [hours, minutes] = timeString.split(':')
		let period = 'AM'

		let hour = parseInt(hours, 10)
		if (hour === 0) {
			hour = 12
		} else if (hour >= 12) {
			period = 'PM'
			if (hour > 12) {
				hour -= 12
			}
		}

		const formattedTime = `${hour}:${minutes} ${period}`
		return formattedTime
	}
	const checkUserIsCouch = async () => {
		try {
			const res = await axios.get(
				`${baseURL}/post/checkUserIsCouch/${localStorage.getItem('afroboostid')}`,
				{
					headers: {
						'X-Auth-Token': localStorage.getItem('afroboostauth'),
					},
				},
			)
			if (res.data === 'OK') {
				setShowValidation(true)
			}
		} catch (error) {
			console.error('Error sending data to backend:', error)
		}
	}

	const checkIsStudentHave = async () => {
		try {
			const res = await axios.get(
				`${baseURL}/post/checkStudents/${localStorage.getItem('afroboostid')}`,
				{
					headers: {
						'X-Auth-Token': localStorage.getItem('afroboostauth'),
					},
				},
			)
			console.log('Whats we are getting from server')
			console.log(res)
			if (res.data === 'OK') {
				setCheckStudentRegister(true)
			}
		} catch (error) {
			console.error('Error sending data to backend:', error)
		}
	}
	const checkIsSessionAlreadyValidated = async () => {
		try {
			const res = await axios.get(
				`${baseURL}/post/checkIsSessionAlreadyValidated/${localStorage.getItem(
					'afroboostid',
				)}`,
				{
					headers: {
						'X-Auth-Token': localStorage.getItem('afroboostauth'),
					},
				},
			)
			if (res.data === 'OK') {
				handleReadyButton()
				setValidateSession(true)
			}
		} catch (error) {
			console.error('Error sending data to backend:', error)
		}
	}
	const todaySessionCheck = async () => {
		try {
			const res = await axios.get(
				`${baseURL}/post/todaySessionCheck/${localStorage.getItem('afroboostid')}`,
				{
					headers: {
						'X-Auth-Token': localStorage.getItem('afroboostauth'),
					},
				},
			)
			if (res.data === 'OK') {
				setTodaySessionStatus(true)
			} else {
				setTodaySessionStatus(false)
			}
		} catch (error) {
			console.error('Error sending data to backend:', error)
		}
	}

	// Function to fetch user list from the backend
	const fetchUserList = async () => {
		// setUserList(dummyUserList)
		try {
			const res = await axios.get(
				`${baseURL}/post/showStudents/${localStorage.getItem('afroboostid')}`,
				{
					headers: {
						'X-Auth-Token': localStorage.getItem('afroboostauth'),
					},
				},
			)
			console.log(res.data.students)
			setUserList(res.data.students) // Assuming the response is an array of user objects
		} catch (error) {
			console.error('Error fetching user list:', error)
		}
	}

	// Function to open the user list modal
	const openUserListModal = () => {
		setShowUserListModal(true)
		fetchUserList() // Fetch user list when the modal is opened
	}

	// Function to close the user list modal
	const closeUserListModal = () => {
		setShowUserListModal(false)
	}

	const handleStartSessionWithoutQR = async () => {
		try {
			const res = await axios.get(
				`${baseURL}/post/startsession/${localStorage.getItem('afroboostid')}`,
				{
					headers: {
						'X-Auth-Token': localStorage.getItem('afroboostauth'),
					},
				},
			)
			console.log(res.data.code)

			res.data.code == 200
				? window.location.reload()
				: alert("Aucun étudiant n'est encore validé merci de patienter")

			// window.location.reload()
		} catch (error) {
			console.error('Error fetching user list:', error)
		}
	}
	return (
		<div>
			{showValidation && (
				<div className='qrcode__canva'>
					{!readyforsession ? (
						<button onClick={handleReadyButton} className='validatebtn'>
							Valider la séance
						</button>
					) : !validateSession ? (
						<>
							<div className='session_row'>
								<label>Date:</label>
								<input
									className='timePicker__my'
									type='date'
									value={sessiondate}
									onChange={e => setSessiondate(e.target.value)}
									required
								/>
							</div>
							<div className='session_row'>
								<label>Temps de session:</label>
								{/* <select
									value={sessiontimezone}
									onChange={e => setSessionimezone(e.target.value)}
								>
									{timezones.map(tz => (
										<option key={tz} value={tz}>
											{tz}
										</option>
									))}
									
								</select> */}
								<div className='timePicker__my'>
									<TimePicker
										value={sessiontimezone}
										onChange={time => setSessiontimezone(formatTimeToAMPM(time))}
										// disableClock
									/>
								</div>
							</div>
							<button
								onClick={handleSubmit}
								className='validatebtn'
								style={{ padding: '0.5rem' }}
							>
								Allons-y
							</button>
						</>
					) : todaySessionStatus ? (
						<div className='QrSection'>
							{/* <QRCode value={`${baseURL}/validatesessionwithQR`} size={100} /> */}
							{/* Modal to show the user list */}
							<Modal
								isOpen={showUserListModal}
								onRequestClose={closeUserListModal}
								contentLabel='User List Modal'
								style={modalStyle} // Apply the custom styling to the modal
							>
								<div className='model__row'>
									<div className='btn__cross_div'>
										<button
											onClick={closeUserListModal}
											className='cross_btn'
											style={{ marginTop: '.5rem' }}
										>
											<IoClose />
										</button>
									</div>
									<h2>Liste des participants</h2>
								</div>
								<div
									style={{ height: '300px', overflow: 'auto' }}
									className='v2class_student'
								>
									<TableContainer component={Paper}>
										<Table stickyHeader aria-label='sticky table'>
											<TableHead className='stickyTableHead'>
												<TableRow>
													<TableCell>#</TableCell>
													<TableCell>Nom</TableCell>
													<TableCell>Sessions restantes</TableCell>
													<TableCell align='right'>Statut de validation</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{userList.map((user, index) =>
													user.quantity > 0 ? (
														<TableRow
															key={user.id}
															className='tableRow'
															// sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
														>
															{console.log(`${user}`)}
															<TableCell component='th' scope='row'>
																<div
																	onClick={() => {
																		window.location.href = `${devURL}/profile/${user.username}`
																	}}
																	className='image student_profile'
																	style={{
																		backgroundImage: `url(${baseURL}/profileImage/${user.studentId.toString()}
									)`,
																		height: 50,
																		width: 50,
																		borderRadius: 15,
																		marginRight: 8,
																		backgroundSize: 'cover',
																		backgroundPositionX: 'center',
																	}}
																/>
															</TableCell>
															<TableCell component='th' scope='row'>
																{user.student_name}
															</TableCell>
															<TableCell component='th' scope='row' align='center'>
																{user.total_session
																	? `${user.quantity}/${user.total_session}`
																	: '-'}
															</TableCell>
															<TableCell
																component='th'
																scope='row'
																align='right'
																// className='headofcirle'
															>
																{user.total_session ? (
																	user.validation ? (
																		<div className='green__cirle1'></div>
																	) : (
																		<div className='green__cirle1 empty__cirle'></div>
																	)
																) : (
																	'-'
																)}
															</TableCell>
														</TableRow>
													) : null,
												)}
											</TableBody>
										</Table>
									</TableContainer>
								</div>
							</Modal>

							{/* Button to show the user list modal */}
							{checkStudentRegister ? (
								<div className='button__row_qr'>
									<button onClick={openUserListModal} className='validatebtn studentbtn'>
										<span className='qr__icon'>
											<HiUserGroup />
										</span>{' '}
										Statut d'étudiant
									</button>
									<button
										onClick={handleStartSessionWithoutQR}
										className='validatebtn studentbtn'
									>
										<span className='qr__icon'>
											<IoCheckmarkDoneCircleSharp />
										</span>{' '}
										Démarrer la session
									</button>
									<button
										onClick={() => {
											setValidateSession(false)
										}}
										className='resetbtn'
									>
										<span className='qr__icon'>
											<BiReset />
										</span>{' '}
										<span className='resetbtntext'>Temps de mise à jour</span>
									</button>
								</div>
							) : (
								''
							)}
						</div>
					) : (
						"La séance d'aujourd'hui est terminée"
					)}
				</div>
			)}
		</div>
	)
}

export default QRCodeGenerator

// 		<QRCode value={qrDataToGenerate} size={100} />
