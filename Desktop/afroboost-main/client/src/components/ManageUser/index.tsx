import React, { useEffect, useState } from 'react'
import './style.css'
import { baseURL } from '../../api'
import axios from 'axios'
import { useToasts } from 'react-toast-notifications'
import { BsWhatsapp } from 'react-icons/bs'
import { RiDeleteBin6Line } from 'react-icons/ri'

const ManageUsers = () => {
	const { addToast } = useToasts()
	const [users, setUsers] = useState([])

	const getUsers = async () => {
		const res = await axios.get(`${baseURL}/api/v2/get-users`)
		setUsers(res.data)
	}

	const deleteUser = async (userId, name) => {
		if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${name} de Afroboost ?`)) {
			try {
				await axios.delete(`${baseURL}/api/v2/delete-user/${userId}`)
				setUsers(users.filter(user => user.id !== userId))

				addToast('User deleted successfully', { appearance: 'success' })
			} catch (error) {
				console.error('Error deleting user:', error)
				addToast('Issue to delete user', { appearance: 'warning' })
			}
		}
	}

	const sendEmail = async email => {
		window.location.href = `mailto:${email}`
	}

	const getCountryCode = phoneNumber => {
		const trimmedNumber = phoneNumber.replace(/\s+/g, '')

		if (
			trimmedNumber.startsWith('074') ||
			trimmedNumber.startsWith('075') ||
			trimmedNumber.startsWith('076') ||
			trimmedNumber.startsWith('077') ||
			trimmedNumber.startsWith('079') ||
			trimmedNumber.startsWith('078')
		) {
			return '41' // Switzerland
		}
		if (trimmedNumber.startsWith('06') || trimmedNumber.startsWith('07')) {
			return '33' // France
		}

		return ''
	}

	const formatPhoneNumber = phoneNumber => {
		let formattedNumber = phoneNumber.replace(/\s+/g, '')

		if (!formattedNumber.startsWith('+')) {
			const countryCode = getCountryCode(formattedNumber)
			if (countryCode) {
				formattedNumber = `+${countryCode}${formattedNumber}`
			}
		}

		return formattedNumber
	}
	const sendWhatsAppMessage = phoneNumber => {
		const formattedNumber = formatPhoneNumber(phoneNumber)
		window.open(`https://wa.me/${formattedNumber}`, '_blank')
	}

	useEffect(() => {
		getUsers()
	}, [])

	return (
		<div className='v2_container v2_table_wrapper'>
			<table className='v2_table'>
				<thead>
					<tr>
						<th className='v2_th'>Nom</th>
						<th className='v2_th'>E-mail</th>
						<th className='v2_th'>Numéro de téléphone</th>
						<th className='v2_th'>Date d'adhésion</th>
						<th className='v2_th'>Balance</th>
						<th className='v2_th'>Actions</th>
					</tr>
				</thead>
				<tbody>
					{users.map((user, index) => (
						<tr key={index} className='v2_tr'>
							<td className='v2_td'>{user.name}</td>
							<td className='v2_td'>{user.mail_address}</td>
							<td className='v2_td v2__whatsaapbtn'>
								{user.phone_number}

								{user.phone_number && (
									<button onClick={() => sendWhatsAppMessage(user.phone_number)}>
										<BsWhatsapp />
									</button>
								)}
							</td>
							<td className='v2_td'>{user.balance}</td>
							<td className='v2_td'>{new Date(user.date_joined).toLocaleDateString()}</td>
							<td className='v2_td v2_btn_row'>
								<button
									className='v2_btn v2_userdeletebtn'
									onClick={() => deleteUser(user.id, user.name)}
								>
									<RiDeleteBin6Line />
								</button>
								<button className='v2_btn' onClick={() => sendEmail(user.mail_address)}>
									Envoyer un e-mail
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export default ManageUsers
