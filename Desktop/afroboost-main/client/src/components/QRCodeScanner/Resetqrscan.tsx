import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import './scan.css'
import './scan.css'
import { baseURL } from '../../api'

const ResetQRscan = () => {
	const [response, setResponse] = useState('')

	useEffect(() => {
		// Trigger the backend when the component mounts
		handleScanQRCode()
	}, [])

	const handleScanQRCode = async () => {
		try {
			const res = await axios.get(`${baseURL}/post/resetqrscan`, {
				headers: {
					'X-Auth-Token': localStorage.getItem('afroboostauth'),
				},
			})

			// Assuming the backend returns a success response
			// setScanResult(true)
			setResponse('QR reset successfully!')
			console.log('hello===================')
			// console.log(res.data.message)
		} catch (error) {
			console.error('Error consuming session:', error)
			console.log('hello=================== fail')
			// setScanResult(false)
			setResponse('QR reset fail!')
		}
	}

	return (
		<div className='scan'>
			<p>{response}</p>
		</div>
	)
}

export default ResetQRscan
