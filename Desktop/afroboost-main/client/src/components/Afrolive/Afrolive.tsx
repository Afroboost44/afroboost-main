// @ts-nocheck
import React from 'react'
import '../Afropost/Afropost.css'
import English from '../../english'
import France from '../../france'
import Germany from '../../germany'
import Spain from '../../spain'
import Countdown from 'react-countdown'
import { IoPricetagsOutline } from 'react-icons/io5'
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
	postPrice: number
	posterName: string
	posterID: number
	postTimestamp?: string
}

interface IProps {
	post: IAfropost
}

class Afropost extends React.Component<IProps, {}> {
	constructor(props: IProps) {
		super(props)
		console.log(props)
	}

	render() {
		return (
			<a href={'/live/' + this.props.post.postID}>
				<div className='afropost'>
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
										borderRadius: 14,
										justifyContent: 'center',
										fontSize: 16,
										fontWeight: 'bold',
										height: 40,
										alignItems: 'center',
									}}
								>
									<span>
										{props.days}d &nbsp;&nbsp; {props.hours}h&nbsp;&nbsp; {props.minutes}
										m&nbsp;&nbsp;{props.seconds}s{' '}
									</span>
								</div>
							)
						}}
					/>

					<div
						className='image'
						style={{
							backgroundImage: `url(${baseURL}/static/${this.props.post.postID}/thumbnail.jpg)`,
							height: 200,
							width: '100%',
							borderRadius: 24,
							backgroundSize: 'cover',
							backgroundPositionX: 'center',
						}}
					></div>
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
									backgroundImage: `url(${baseURL}/profileImage/${this.props.post.posterID.toString()})`,
									height: 30,
									width: 30,
									borderRadius: 15,
									marginRight: 8,
									backgroundSize: 'cover',
									backgroundPosition: 'center',
								}}
							/>

							<p>{this.props.post.posterName}</p>
						</div>
						<div className='post-meta'>
							{/* <PricetagsOutline
								color={'#ffffff'}
								height='30px'
								width='30px'
								cssClasses='heart-icon'
							/> */}
							<div className='afrolive__icon'>
								<IoPricetagsOutline />
							</div>
							<span
								style={{
									marginLeft: 2,
									marginRight: 8,
								}}
							>
								CHF {this.props.post.postPrice || 0}
							</span>
						</div>
					</div>
				</div>
			</a>
		)
	}
}

export default Afropost
