// @ts-nocheck
import React from 'react'
// import {
//   Heart,
//   MusicalNotesOutline,
//   VideocamOutline,
//   ImageOutline,
//   PricetagsOutline,
//   BagHandleOutline,
// } from "react-ionicons";
import './Afropost.css'
import English from '../../english'
import France from '../../france'
import Germany from '../../germany'
import Spain from '../../spain'
import Countdown from 'react-countdown'
import axios from 'axios'
import { FaImage } from 'react-icons/fa'
import {
	IoBagHandleOutline,
	IoMusicalNotesOutline,
	IoPricetag,
	IoVideocam,
} from 'react-icons/io5'
import { baseURL } from '../../api'
const l = {
	en: English,
	fr: France,
	ge: Germany,
	sp: Spain,
}
interface IAfropost {
	postID: number
	postTitle: string
	postDate: Date
	postBoosted: boolean
	postPrice: number
	posterName: string
	posterID: number
	postType: string
	postTimestamp?: string
}

interface IProps {
	post: IAfropost
}

class Afropost extends React.Component<IProps, {}> {
	constructor(props: IProps) {
		super(props)
		this.state = {
			monthly_price: '',
		}
		console.log(props)
	}

	async getMonthlyPrice() {
		let data = await axios.post(
			`${baseURL}/post/getMonthlyPrice`,
			{
				id: this.props.post.postID,
			},
			{
				headers: {
					'X-Auth-Token': localStorage.getItem('afroboostauth'),
				},
			},
		)
		if (data.data.message && data.data.message.length)
			this.setState({ monthly_price: data.data.message[0].monthly_price })
	}
	componentDidMount() {
		this.getMonthlyPrice()
	}

	render() {
		return (
			<a href={'/post/' + this.props.post.postID}>
				<div className='afropost'>
					<div
						className='image'
						style={{
							backgroundImage: `url(${baseURL}/postThumbnail/${this.props.post.postID.toString()})`,
							height: 200,
							width: '100%',
							borderRadius: 24,
							backgroundSize: 'cover',
							backgroundPositionX: 'center',
						}}
					>
						<Countdown
							date={
								this.props.post.postTimestamp
									? new Date(parseInt(this.props.post.postTimestamp))
									: Date.now()
							}
							intervalDelay={0}
							precision={3}
							renderer={props => {
								if (props.total <= 0 || this.props.post.postTimestamp === null)
									return <div></div>
								// props.days
								// props.hours
								// props.minutes
								// props.seconds
								return (
									<div
										style={{
											display: 'flex',
											height: 70,
											backgroundColor: '#650072',
											borderRadius: 14,
											justifyContent: 'center',
										}}
									>
										<div
											style={{
												display: 'flex',
												marginLeft: 16,
												flexDirection: 'column',
												paddingBottom: 5,
												alignItems: 'center',
												justifyContent: 'center',
											}}
										>
											<span
												style={{
													fontFamily: 'Montserrat',
													fontWeight: 700,
													fontSize: 32,
												}}
											>
												{props.days <= 9 ? '0' + props.days : props.days}
											</span>
											<span
												style={{
													fontFamily: 'Montserrat',
													fontWeight: 600,
													fontSize: 10,
												}}
											>
												JOURS
											</span>
										</div>
										<div
											style={{
												display: 'flex',
												marginLeft: 16,
												flexDirection: 'column',
												paddingBottom: 5,
												alignItems: 'center',
												justifyContent: 'center',
											}}
										>
											<span
												style={{
													fontFamily: 'Montserrat',
													fontWeight: 700,
													fontSize: 32,
												}}
											>
												{props.hours <= 9 ? '0' + props.hours : props.hours}
											</span>
											<span
												style={{
													fontFamily: 'Montserrat',
													fontSize: 10,
													fontWeight: 600,
												}}
											>
												HORAIRE
											</span>
										</div>
										<div
											style={{
												display: 'flex',
												marginLeft: 16,
												flexDirection: 'column',
												paddingBottom: 5,
												alignItems: 'center',
												justifyContent: 'center',
											}}
										>
											<span
												style={{
													fontFamily: 'Montserrat',
													fontWeight: 700,
													fontSize: 32,
												}}
											>
												{props.minutes <= 9 ? '0' + props.minutes : props.minutes}
											</span>
											<span
												style={{
													fontFamily: 'Montserrat',
													fontSize: 10,
													fontWeight: 600,
												}}
											>
												MINUTE
											</span>
										</div>
										<div
											style={{
												display: 'flex',
												marginLeft: 16,
												marginRight: 16,
												flexDirection: 'column',
												paddingBottom: 5,
												alignItems: 'center',
												justifyContent: 'center',
											}}
										>
											<span
												style={{
													fontFamily: 'Montserrat',
													fontWeight: 700,
													fontSize: 32,
												}}
											>
												{props.seconds <= 9 ? props.seconds : props.seconds}
											</span>
											<span
												style={{
													fontFamily: 'Montserrat',
													fontSize: 10,
													fontWeight: 600,
												}}
											>
												SECONDES
											</span>
										</div>
									</div>
								)
							}}
						/>
					</div>
					<div className='afropost-container'>
						<p className='post-title'>{this.props.post.postTitle}</p>
						<span className='post-date'>
							{l[localStorage.getItem('language')]['posted']}{' '}
							{new Date(this.props.post.postDate).toLocaleDateString()}
						</span>
						<br />
						<div className='post-poster'>
							<div
								className='image'
								style={{
									backgroundImage: `url(${baseURL}/profileImage/${this.props.post.posterID.toString()}
									)`,
									height: 30,
									width: 30,
									borderRadius: 15,
									marginRight: 8,
									backgroundSize: 'cover',
									backgroundPositionX: 'center',
								}}
							/>
							<p>{this.props.post.posterName}</p>
						</div>
						<div className='post-meta'>
							{this.props.post.postType === 'audio' ? (
								// <MusicalNotesOutline
								//   color={"#ffffff"}
								//   height="30px"
								//   width="30px"
								//   cssClasses="heart-icon"
								// />
								<div className='post__icon'>
									<IoMusicalNotesOutline />
								</div>
							) : this.props.post.postType === 'video' ? (
								// <VideocamOutline
								//   color={"#ffffff"}
								//   height="30px"
								//   width="30px"
								//   cssClasses="heart-icon"
								// />
								<div className='post__icon'>
									<IoVideocam />
								</div>
							) : this.props.post.postType === 'merchandise' ? (
								// <BagHandleOutline
								//   color={"#ffffff"}
								//   height="30px"
								//   width="30px"
								//   style={{ paddingRight: "8px" }}
								// />
								<div className='post__icon'>
									<IoBagHandleOutline />
								</div>
							) : (
								// <ImageOutline
								//   color={"#ffffff"}
								//   height="30px"
								//   width="30px"
								//   cssClasses="heart-icon"
								// />
								<div className='post__icon'>
									<FaImage />
								</div>
							)}
							{/* <PricetagsOutline
                color={"#ffffff"}
                height="30px"
                width="30px"
                cssClasses="heart-icon"
              /> */}
							<div className='post__icon'>
								<IoPricetag />
							</div>
							<span
								style={{
									marginLeft: 2,
									marginRight: 8,
								}}
							>
								CHF{' '}
								{this.state.monthly_price
									? this.state.monthly_price
									: this.props.post.postPrice}
							</span>
							{this.props.post.postBoosted ? (
								<div
									style={{
										backgroundImage: 'url(boost.png)',
										height: '30px',
										width: '30px',
										borderRadius: 15,
										marginLeft: 8,
										backgroundSize: 'cover',
										backgroundPositionX: 'center',
									}}
								></div>
							) : (
								''
							)}
						</div>
					</div>
				</div>
			</a>
		)
	}
}

export default Afropost
