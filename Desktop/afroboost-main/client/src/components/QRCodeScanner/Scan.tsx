import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import './scan.css'
import './scan.css'
import { baseURL } from '../../api'
import { BsPass, BsTicketDetailedFill, BsTicketFill } from 'react-icons/bs'
import { MdDoneAll } from 'react-icons/md'

const Scan = () => {
	const [response, setResponse] = useState('')
	const [renderContent, setRenderContent] = useState(false)
	const [sessionsUsers, setSessionsUsers] = useState([])
	const [sessionsPosts, setsessionsPosts] = useState([])

	useEffect(() => {
		// Trigger the backend when the component mounts
		handleScanQRCode()
	}, [])

	const handleScanQRCode = async () => {
		try {
			const res = await axios.get(
				`${baseURL}/post/qrscan/${localStorage.getItem('afroboostid')}`,
				{
					headers: {
						'X-Auth-Token': localStorage.getItem('afroboostauth'),
					},
				},
			)

			// Assuming the backend returns a success response
			// setScanResult(true)
			localStorage.setItem('scanResult', 'true')
			setResponse('Session consumed successfully!')
			console.log('hello')
			console.log(res.data.results)
			console.log(res.data.users)
			console.log(res.data.posts)

			setSessionsUsers(res.data.users)
			setsessionsPosts(res.data.posts)
			res.data.code === 200 && setRenderContent(true)
		} catch (error) {
			console.error('Error consuming session:', error)
			// setScanResult(false)
			localStorage.setItem('scanResult', 'false')
			setResponse('Session consumption failed.')
			setRenderContent(false)
		}
	}

	return (
		<div className='scan'>
			<p>{response}</p>
			{renderContent && (
				<div className='scan__content'>
					<div className='sessions__participants'>
						<div className='participants__heading'>
							All participants
							<span className='green__tick'>
								<MdDoneAll />
							</span>
						</div>
						{sessionsUsers.map(user => (
							<div className='sessions__participant'>{user ? user.name : ''} </div>
						))}
					</div>
					<div className='sessions__posts'>
						<div className='participants__heading posts__heading'>
							All posts
							<span className='green__tick'>
								<MdDoneAll />
							</span>
						</div>
						{sessionsPosts.map(post => (
							<div className='sessions__participant sessions__post'>
								{post ? post.post_title : ''}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

export default Scan
