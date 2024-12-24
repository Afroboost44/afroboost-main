// @ts-nocheck
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { ToastProvider, useToasts } from 'react-toast-notifications'
import { transitions, positions, Provider as AlertProvider } from 'react-alert'
// @ts-ignore
import AlertTemplate from 'react-alert-template-basic'

import Modal from 'react-modal' // Import the react-modal component
import notificationSound from './assets/notification.mp3' // Replace with the actual path to your audio file

// Set the app element for screen readers
Modal.setAppElement('#root') // '#root' should match the root element's ID in your HTML file

const options = {
	// you can also just use 'bottom center'
	position: positions.BOTTOM_CENTER,
	timeout: 5000,
	offset: '30px',
	// you can also just use 'scale'
	transition: transitions.SCALE,
}

const Inner = () => {
	const { addToast } = useToasts()
	const playNotificationSound = () => {
		const audio = new Audio(notificationSound)
		audio.play()
	}
	const addToastFunc = (notificationText, referenceLink) => {
		playNotificationSound()
		addToast(
			<a style={{ color: 'white' }} href={referenceLink}>
				{notificationText}
			</a>,
			{ appearance: 'info' },
		)
	}
	if (!addToast) return <div></div>
	return (
		<div>
			<AlertProvider template={AlertTemplate} {...options}>
				{' '}
				<App addToastFunc={addToastFunc} />
			</AlertProvider>
		</div>
	)
}

ReactDOM.render(
	<React.StrictMode>
		<ToastProvider PlacementType='top-right' autoDismissTimeout={4000} autoDismiss={true}>
			<Inner />
		</ToastProvider>
	</React.StrictMode>,
	document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
