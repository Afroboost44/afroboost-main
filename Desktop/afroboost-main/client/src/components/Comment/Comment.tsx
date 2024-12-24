// @ts-nocheck
import axios from 'axios'
import React, { Component } from 'react'
import './Comment.css'
import { baseURL, devURL } from '../../api'

interface IProps {
	posterID: number
	posterName: string
	parentID: number
	commentTimestamp: number
	commentContent: string
	commenterUsername: string
	commentID: number
	removeComment: any
	inputRef: any
}

class Comment extends Component<IProps, {}> {
	constructor(props: IProps) {
		super(props)
		console.log(this.props.removeComment)
	}
	render() {
		return (
			<div className='comment'>
				<div className='post-poster'>
					<div
						className='image'
						style={{
							backgroundImage:
								`url(${baseURL}/profileImage/` + this.props.posterID.toString() + ')',
							height: 30,
							width: 30,
							borderRadius: 15,
							marginRight: 8,
							backgroundSize: 'cover',
							backgroundPositionX: 'center',
						}}
					/>

					<a href={`${devURL}/profile/` + this.props.commenterUsername}>
						<p
							style={{
								color: 'white',
								fontFamily: 'Montserrat',
								fontWeight: 'bold',
								marginLeft: 12,
							}}
						>
							{this.props.posterName}
						</p>
					</a>
				</div>
				<span
					style={{
						color: 'white',
						fontFamily: 'Montserrat',
						fontWeight: 500,
						fontSize: 12,
					}}
				>
					{this.props.commentContent}
				</span>
				<br />
				<span
					style={{
						color: 'white',
						fontFamily: 'Montserrat',
						fontWeight: 500,
						fontSize: 12,
					}}
				>
					{new Date(this.props.commentTimestamp).toLocaleDateString()} at{' '}
					{new Date(this.props.commentTimestamp).toLocaleTimeString()}
					{this.props.posterID.toString() === localStorage.getItem('afroboostid') && (
						<>
							<button
							className='A__BTN'
								style={{
									color: 'white',
									fontFamily: 'Montserrat',
									fontWeight: 500,
								}}
								// href='javascript:void(0)'
								onClick={async () => {
									await axios.post(
										`${baseURL}/post/removeComment`,
										{
											id: this.props.commentID,
										},
										{
											headers: {
												'X-Auth-Token': localStorage.getItem('afroboostauth'),
											},
										},
									)

									window.location.reload()
								}}
							>
								&nbsp; - &nbsp; Delete
							</button>
							<button
							className='A__BTN'
								style={{
									color: 'white',
									fontFamily: 'Montserrat',
									fontWeight: 500,
								}}
								// href='javascript:void(0)'
								onClick={async () => {
									this.props.parentRef.setState({
										mode: 'editComment',
										editingCommentID: this.props.commentID,
										editingComment: this.props.commentContent,
									})
								}}
							>
								&nbsp; - &nbsp; Edit
							</button>
						</>
					)}
				</span>
			</div>
		)
	}
}

export default Comment
