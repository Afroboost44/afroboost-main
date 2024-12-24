// @ts-nocheck
import React, { useEffect, useState } from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import Badge from '@material-ui/core/Badge'
import axios from 'axios'
import urls from '../../helpers/config'
import { ArrowBackOutline } from 'react-ionicons'
import { useHistory, useParams } from 'react-router'
import './Subscriptions.css'
import { baseURL } from '../../api'

const Subscriptions = () => {
	const [subscriptions, setSubscriptions] = useState([])
	const [quantity, setQuantity] = useState()
	const history = useHistory()
	const { postId } = useParams()
	const [rows, setRows] = useState([])
	const [confirm, setConfirm] = useState('')
	const [qrCodeURL, setQrCodeURL] = useState('')

	const refetchPosts = async () => {
		const res = await axios.get(`${baseURL}/post/v2/subscriptions/${postId}`, {
			headers: {
				'X-Auth-Token': localStorage.getItem('afroboostauth'),
			},
		})
		if (res.data.posts) {
			setSubscriptions(res.data.posts)

			const _rows = res.data.posts.map(item => ({
				name: item.name,
				email: item.mail_address,
				quantity: item.quantity,
				libraryId: item.libraryId,
				postCategory: item.post_category,
				totalSession: item.total_session,
			}))
			setRows(_rows)
		}

		console.log(res.data.qrCodeURL)
	}

	const updateParticipation = libraryId => {
		axios.put(
			`${baseURL}/post/v2/participation`,
			{
				id: libraryId,
				quantity: parseInt(quantity),
			},
			{
				headers: {
					'X-Auth-Token': localStorage.getItem('afroboostauth'),
				},
			},
		)
		setConfirm('')
	}

	useEffect(() => {
		refetchPosts()
	}, [])

	return subscriptions && subscriptions.length === 0 ? (
		<div className='no_items'>
			{console.log('ddd')}
			<p>Nobody subscribed to this product.</p>
			<div
				onClick={async () => {
					window.history.back()
				}}
				className='back'
			>
				<ArrowBackOutline color={'white'} height='28px' width='28px' />
				<span>Back</span>
			</div>
		</div>
	) : (
		<div className='subscriptions'>
			<div className='subscriptions__head'>
				<ArrowBackOutline
					onClick={async () => {
						history.goBack()
					}}
					color={'white'}
					height='28px'
					width='28px'
				/>
				<h4 style={{ color: 'white', fontSize: '19px' }} className='post_title'>
					{subscriptions[0].post_title}
				</h4>
			</div>
			<h4
				style={{
					textAlign: 'center',
					margin: '25px',
					color: 'white',
					fontSize: '19px',
					textTransform: 'uppercase',
				}}
			>
				Subscritions
			</h4>
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }} stickyHeader aria-label='sticky table'>
					<TableHead>
						<TableRow>
							<TableCell>Article</TableCell>
							<TableCell>Addresse Email</TableCell>
							<TableCell>Nombres de sessions</TableCell>
							<TableCell align='right'>Sessions Remaining</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{rows.map((row, i) => (
							<TableRow
								key={row.name}
								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
								<TableCell component='th' scope='row'>
									{row.name}
								</TableCell>
								<TableCell>{row.email}</TableCell>
								<TableCell>
									<div
										onClick={() => {
											updateParticipation(parseInt(row.libraryId))
										}}
										style={{
											display: 'flex',
											justifyContent: 'center',
											alignItems: 'center',
											cursor: 'pointer',
										}}
									>
										<div className='circle' style={{ backgroundColor: '#650072' }}>
											{row.quantity}
										</div>
										{row.libraryId === confirm && <span>Confirm</span>}
									</div>
								</TableCell>
								<TableCell align='right'>
									{row.postCategory === 'Sport' ? (
										<TextField
											margin='dense'
											InputProps={{
												inputProps: { min: 0, max: parseInt(row.totalSession) },
											}}
											style={{ margin: 0, marginBottom: '12px', width: '90px' }}
											type='number'
											onChange={(e: any) => {
												setConfirm(row.libraryId)
												const _rows = rows.map(r => {
													if (r.libraryId === row.libraryId) {
														r.quantity = e.target.value
													}
													return r
												})
												setRows(_rows)
												// updateParticipation(parseInt(row.libraryId));
												setQuantity(e.target.value)
											}}
											value={row.quantity}
											fullWidth
										/>
									) : (
										'_'
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</div>
	)
}

export default Subscriptions
