import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode.react'
import io from 'socket.io-client'

const QRValidation = () => {
	const [qrData, setQrData] = useState(null)

	useEffect(() => {
		const socket = io('http://localhost:5000')

		// Listening for 'qrDataProcessed' event from the backend
		socket.on('qrDataProcessed', processedData => {
			// Update the React component state with the processed data received from the backend
			setQrData(processedData)
		})

		// Clean up the socket connection on component unmount
		return () => {
			socket.disconnect()
		}
	}, [])

	const handleQRScan = data => {
		// Send the scanned data to the backend using a POST request
		fetch('/qr-data', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ qrData: data }),
		})
			.then(response => response.json())
			.then(data => {
				console.log(data.message)
			})
			.catch(error => {
				console.error('Error sending QR code data:', error)
			})

		// Update the state to hide the QR code
		setQrData(null)
	}

	const renderQRCode = () => {
		// Check if qrData is null, and if it is, render the QR code
		if (qrData === null) {
			return (
				<QRCode
					value={`http://192.168.18.14:3003/post/sessionvalidationwithqr/`}
					size={80}
				/>
			)
		}
		// Otherwise, if qrData is not null, display the processed data
		return <p>Processed QR Data: {qrData}</p>
	}

	return (
		<div>
			{renderQRCode()}
			{/* Trigger the QR code scanner on button click */}
			<button onClick={() => setQrData('YOUR_QR_CODE_DATA_HERE')}>Scan QR Code</button>
		</div>
	)
}

export default QRValidation
