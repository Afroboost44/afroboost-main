// @ts-nocheck
import React, { useEffect, useState } from 'react'
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
} from '@material-ui/core'
import Table from '@material-ui/core/Table'
import CircularProgress from '@material-ui/core/CircularProgress'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Badge from '@material-ui/core/Badge'
import moment from 'moment'
import Paper from '@material-ui/core/Paper'
import axios from 'axios'
import urls from '../../helpers/config'
import Slide from '@material-ui/core/Slide'
import './Subscriptions.css'
import { baseURL } from '../../api'

import { AiOutlineFileSearch } from 'react-icons/ai'
import { Console } from 'console'
import { BiCalendar, BiCheck } from 'react-icons/bi'
import { RiClockwiseLine } from 'react-icons/ri'
import { GoClock } from 'react-icons/go'
import { BsCheckSquareFill } from 'react-icons/bs'
import CheckMark from './Lotties/CheckMark'

const Transition = React.forwardRef(function Transition(
	props: TransitionProps & { children?: React.ReactElement<any, any> },
	ref: React.Ref<unknown>,
) {
	return <Slide direction='up' ref={ref} {...props} />
})

const PopupUserProducts = ({ show, onClose, postId }) => {
	const [subscriptions, setSubscriptions] = useState([])
	const [rows, setRows] = useState([])
	const [loading, setLoading] = useState(false)
	const [scanResult, setScanResult] = useState(false)
	const [validatesession, setValidatesession] = useState(false)
	// const [isValidated, setIsValidated] = useState(false)
	const refetchUserLibrary = async () => {
		setLoading(true)
		const res = await axios.get(`${baseURL}/post/v2/library/${postId}`, {
			headers: {
				'X-Auth-Token': localStorage.getItem('afroboostauth'),
			},
		})
		console.log('Debiuge pro max')
		console.log(res)
		if (res.data.libraries) {
			setSubscriptions(res.data.libraries)

			console.log('Main print')
			console.log(res.data.libraries)

			const _rows = res.data.libraries.map((item, index) => {
				let endDate = new Date(item.start_date)
				let sessionDate = new Date(item.session_date)

				endDate.setMonth(endDate.getMonth() + parseInt(item.valididy))

				if (item.validation === 1) {
					setValidatesession(prevState => ({
						...prevState,
						[index]: true,
					}))
				}

				// sessionDate.setMonth(endDate.getMonth() + parseInt(item.valididy))
				return {
					libraryid: item.libraryId,
					date: item.date,
					quantity: item.quantity,
					totalSession: item.total_session,
					qrstatus: item.qrstatus,
					endDate: endDate,
					sessionDate: sessionDate,
					sessionTime: item.session_time,
				}
			})

			setRows(_rows)
			// console.log('Row data')
			// console.log(_rows)
			// console.log(_rows[0].qrstatus)
			// setScanResult(_rows[0].qrstatus)
			setLoading(false)
		}
	}
	const handleValidate = async (row, index) => {
		console.log('Post is' + row.libraryid)
		const userConfirmed = window.confirm('Etes-vous sûr de vouloir valider?')
		if (userConfirmed) {
			const res = await axios.get(`${baseURL}/post/validateSession/${row.libraryid}`, {
				headers: {
					'X-Auth-Token': localStorage.getItem('afroboostauth'),
				},
			})
			if (res.data.code == 420) {
				alert(`Vous n'avez pas de séance disponible !`)
			} else if (res.data.code == 200) {
				console.log('User confirmed:', userConfirmed)

				refetchUserLibrary()
				console.log(res.data.message)

				setValidatesession(prevState => ({
					...prevState,
					[index]: true,
				}))
			} else {
				alert(`La séance n'est pas encore validée par le professeur`)
			}
		}
	}
	useEffect(() => {
		refetchUserLibrary()
	}, [])

	return (
		<Dialog
			TransitionComponent={Transition}
			open={show}
			fullWidth={true}
			className='user-products'
		>
			<DialogTitle>
				{/* {l[localStorage.getItem("language")]["liveStream"]} */}
				VOTRE ABONNEMENT A CE PRODUIT
			</DialogTitle>
			<DialogContent>
				{subscriptions && subscriptions.length === 0 ? (
					<div className='no_items' style={{ minHeight: '200px' }}>
						<p>Aucun abonnement.</p>
					</div>
				) : (
					<div className='subscriptions'>
						<TableContainer component={Paper}>
							<Table sx={{ minWidth: 350 }} stickyHeader aria-label='sticky table'>
								<TableHead>
									<TableRow>
										<TableCell>Date de souscription</TableCell>
										<TableCell>Sessions restantes</TableCell>
										<TableCell>Horaires</TableCell>
										<TableCell align='right'>Validité</TableCell>
										{/* {!validatesession && (
											<>
											</>
										)}
										{validatesession && (
											<>
												<TableCell align='right'>Date de la prochaine session</TableCell>
												<TableCell align='right'>Heure de la prochaine session</TableCell>
												<TableCell align='right'>Validité 1 Mois</TableCell>
											</>
										)} */}
									</TableRow>
								</TableHead>
								<TableBody>
									{loading ? (
										<div
											style={{
												display: 'flex',
												justifyContent: 'center',
												alignItems: 'center',
											}}
										>
											<CircularProgress />
										</div>
									) : (
										rows.map((row, index) => (
											<TableRow
												key={row.date}
												sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
											>
												{/* <TableCell component='th' scope='row'>
													{console.log('Row index is:' + index)}
													{moment(row.date).format('DD, MMM YYYY')}
												</TableCell> */}
												<TableCell>
													{validatesession[index] && row.sessionTime ? (
														moment(row.sessionDate).format('DD, MMM YYYY')
													) : (
														<div className='validatemodal__icon'>
															<BiCalendar />
														</div>
													)}
												</TableCell>
												<TableCell align='center'>
													<div
														style={{
															display: 'flex',
															// justifyContent: 'center',
															alignItems: 'center',
														}}
													>
														<div
															className='circle'
															style={{
																backgroundColor:
																	row.totalSession !== row.quantity && scanResult === true
																		? 'grey'
																		: '#2ec54f',
															}}
														>
															{row.quantity}
														</div>{' '}
														/ {row.totalSession}
													</div>
												</TableCell>
												<TableCell>
													{validatesession[index] && row.sessionTime ? (
														row.sessionTime
													) : (
														<div className='validatemodal__icon'>
															<GoClock />
														</div>
													)}
												</TableCell>
												<TableCell align='right'>
													{console.log(row)}
													{!validatesession[index] ? (
														<>
															<div
																onClick={() => {
																	handleValidate(row, index)
																}}
																className='checkvalidate'
															>
																<BsCheckSquareFill />
															</div>
														</>
													) : (
														<div className='animatedCheck'>
															<CheckMark />
														</div>
													)}
												</TableCell>
												{/* {validatesession[index] && (
													<>
														<TableCell align='right'>
															{row.sessionTime &&
																moment(row.sessionDate).format('DD, MMM YYYY')}
														</TableCell>
														<TableCell align='right'>{row.sessionTime}</TableCell>
														<TableCell align='right' className='qr_status'>
															{row.qrstatus === 1 ? (
																<div className='green__cirle'>
																	<BiCheck />
																</div>
															) : (
																<div className='green__cirle empty__cirle'>
																	<BiCheck />
																</div>
															)}
														</TableCell>
													</>
												)} */}
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</TableContainer>
					</div>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>CLOSE</Button>
			</DialogActions>
		</Dialog>
	)
}

export default PopupUserProducts
