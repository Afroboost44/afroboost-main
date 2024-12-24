// @ts-nocheck
import React from 'react'
import './Live.css'
import Afrolive from '../Afrolive/Afrolive'
import FlatList from 'flatlist-react'
import Spectrum from '../Spectrum/Spectrum'
import axios from 'axios'
import { baseURL } from '../../api'
class Live extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			liveList: [],
		}
	}

	async getAllLives() {
		let request = await axios.get(`${baseURL}/post/live`, {
			headers: {
				'X-Auth-Token': localStorage.getItem('afroboostauth'),
			},
		})
		console.log(request)
		if (request.status === 200) {
			this.setState({ liveList: request.data.lives })
		}
	}

	componentDidMount() {
		this.getAllLives()
	}

	render() {
		return (
			<div className='live'>
				<div>
					<h2 className='page-title'>
						<Spectrum />
						&nbsp;&nbsp;Afroboost Live
					</h2>
				</div>

				<div style={{ width: window.innerWidth < 600 ? '100%' : 500 }}>
					<div className='upload-icons-div-live' style={{ marginBottom: 20 }}>
						<a
							className='choose-upload-live'
							onClick={async () => {
								let request = await axios.post(
									`${baseURL}/post/live`,
									{},
									{
										headers: {
											'X-Auth-Token': localStorage.getItem('afroboostauth'),
										},
									},
								)
								if (request.status === 200) {
									console.log(request.data)
									// window.location.href = `/live/${request.data.insertId}`
									window.location.href = `/live`
								}
							}}
						>
							<img
								src='https://img.icons8.com/ios/60/8E2B9C/radio-waves.png'
								className='dialog-upload-icon'
							/>
							<p className='choose-upload-text-live'>Start Live</p>
						</a>
					</div>
				</div>
				<div>
					<FlatList
						list={this.state.liveList}
						renderItem={(item: any, index: number) => {
							return (
								<Afrolive
									key={index}
									post={{
										postDate: item.countdown,
										postPrice: item.price,
										postTitle: item.title,
										posterID: item.poster_id,
										posterName: item.name,
										postID: item.id,
										postTimestamp: parseInt(item.countdown),
									}}
								/>
							)
						}}
						sort={{
							by: [
								{
									key: 'postDate',
									descending: this.state.sortType === 'Latest posts',
								},
							],
						}}
						displayGrid
						gridGap='30px'
						minColumnWidth='250px'
					/>
				</div>
			</div>
		)
	}
}

export default Live
