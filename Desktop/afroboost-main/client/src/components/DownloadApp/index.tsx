import React, { useState, useEffect } from 'react'
import './style.css'

const DownloadAppPrompt = () => {
	const [showPrompt, setShowPrompt] = useState(false)

	useEffect(() => {
		// Show the prompt after a delay
		const timer = setTimeout(() => {
			setShowPrompt(true)
		}, 3000) // Show after 3 seconds
		const timer2 = setTimeout(() => {
			setShowPrompt(false)
		}, 10000)
		return () => clearTimeout(timer)
	}, [])

	const handleClose = () => {
		setShowPrompt(false)
	}

	return (
		showPrompt && (
			<div className='download-app-prompt'>
				<div className='prompt-message'>
					<p>Download our app for a better experience!</p>
					<button onClick={handleClose}>Close</button>
					<a href='YOUR_APP_LINK' target='_blank' rel='noopener noreferrer'>
						<button>Download</button>
					</a>
				</div>
			</div>
		)
	)
}

export default DownloadAppPrompt
