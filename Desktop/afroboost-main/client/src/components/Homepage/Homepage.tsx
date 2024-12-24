// @ts-nocheck
import React from 'react'
import './Homepage.css'
import Spectrum from '../Spectrum/Spectrum'
import Category from '../Category/Category'
import FlatList from 'flatlist-react'
import Dropdown from 'react-dropdown'
import Afropost from '../Afropost/Afropost'
// import ReactTimeout from "react-timeout";
import 'react-dropdown/style.css'
// import {
//   AppsOutline,
//   GridOutline,
//   Search,
//   MusicalNotesOutline,
//   VideocamOutline,
//   ImageOutline,
//   PricetagsOutline,
// } from "react-ionicons";
import axios from 'axios'
// import Countdown from "react-countdown";
import English from '../../english'
import France from '../../france'
import Germany from '../../germany'
import Spain from '../../spain'
// import urls from '../../helpers/config'
import { baseURL } from '../../api'

import { BsGrid, BsGrid3X3Gap } from 'react-icons/bs'
import { AiOutlineTags } from 'react-icons/ai'
import { FaImage } from 'react-icons/fa'
import { HiOutlineMusicalNote, HiOutlineVideoCamera } from 'react-icons/hi2'

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
	postCategory: string
	postTimestamp: string
}

interface IState {
	postsList: IAfropost[]
	searchQuery: string
	sortType: string
	category: string
	postType: string
}

class Homepage extends React.Component<{}, IState> {
	categoriesList: string[]

	constructor(props: any) {
		super(props)

		this.categoriesList = [
			'Everything',
			'Entertainment',
			'Sport',
			'Music',
			'Film',
			'Services',
			'Podcasts',
			'Animations',
			'Tutorials',
		]
		this.state = {
			postsList: [],
			searchQuery: '',
			category: 'Everything',
			sortType: 'Latest posts',
			postType: 'Everything',
			categoriesOpened: false,
		}
		axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*'
	}

	async refetchPosts() {
		const homepageData = await axios.post(
			`${baseURL}/post/homepage`,
			{},
			{
				headers: {
					'X-Auth-Token': localStorage.getItem('afroboostauth'),
				},
			},
		)
		console.log(homepageData)
		localStorage.setItem('playlist', JSON.stringify(homepageData.data.message))
		this.setState({ postsList: homepageData.data.message })
	}

	componentDidMount() {
		this.refetchPosts().then(() => {
			setTimeout(() => {
				this.setState({ loading: false })
			}, 600)
		})
	}

	render() {
		return (
			<div className='homepage'>
				<h2 className='page-title'>
					<Spectrum />
					&nbsp;&nbsp;{l[localStorage.getItem('language')]['homepage']}
				</h2>
				<div className='filters'>
					<div className='search' style={{ marginRight: 20 }}>
						{/* <Search
              cssClasses="search-icon"
              height="23px"
              width="23px"
              color={"#ffffff"}
            /> */}
						<input
							onChange={(event: any) => {
								this.setState({ searchQuery: event.target.value })
							}}
							placeholder={l[localStorage.getItem('language')]['searchAfroboost']}
							autoComplete='off'
							type='text'
							id='search'
						/>
					</div>

					<Dropdown
						className='dropdown-menu'
						controlClassName='dropdown-menu-control'
						placeholderClassName='dropdown-menu-placeholder'
						menuClassName='dropdown-menu-menu'
						onChange={(event: any) => {
							this.setState({ sortType: event.value })
						}}
						arrowClassName='dropdown-menu-arrow'
						options={[
							{
								label: l[localStorage.getItem('language')]['Latest posts'],
								value: 'Latest posts',
							},
							{
								label: l[localStorage.getItem('language')]['Oldest posts'],
								value: 'Oldest posts',
							},
						]}
						value={'Latest posts'}
						placeholder='Select an option'
					/>

					<div className='types'>
						&nbsp;
						<button
							// href="javascript:void(0)"
							onClick={() => {
								this.setState({ postType: 'Everything' })
							}}
							className='icon_Button'
						>
							{/* <GridOutline
                color={"#ffffff"}
                height="30px"
                width="30px"
                cssClasses="heart-icon"
              /> */}
							<div className='home__icon'>
								<BsGrid />
							</div>
						</button>
						&nbsp;
						<button
							// href="javascript:void(0)"
							onClick={() => {
								this.setState({ postType: 'audio' })
							}}
							className='icon_Button'
						>
							{/* <MusicalNotesOutline
                color={"#ffffff"}
                height="30px"
                width="30px"
                cssClasses="heart-icon"
              /> */}
							<div className='home__icon'>
								<HiOutlineMusicalNote />
							</div>
						</button>
						&nbsp;
						<button
							// href="javascript:void(0)"
							onClick={() => {
								this.setState({ postType: 'video' })
							}}
							className='icon_Button'
						>
							{/* <VideocamOutline
                color={"#ffffff"}
                height="30px"
                width="30px"
                cssClasses="heart-icon"
              /> */}
							<div className='home__icon'>
								<HiOutlineVideoCamera />
							</div>
						</button>
						&nbsp;
						<button
							// href="javascript:void(0)"
							onClick={() => {
								this.setState({ postType: 'image' })
							}}
							className='icon_Button'
						>
							{/* <ImageOutline
                color={"#ffffff"}
                height="30px"
                width="30px"
                cssClasses="heart-icon"
              /> */}
							<div className='home__icon'>
								<FaImage />
							</div>
						</button>
						&nbsp;
						<button
							// href="javascript:void(0)"
							onClick={() =>
								this.setState({ categoriesOpened: !this.state.categoriesOpened })
							}
							className='icon_Button'
						>
							{/* <AppsOutline
                color={'#ffffff'}
                height="30px"
                width="30px"
                cssClasses="heart-icon"
              /> */}
							<div className='home__icon'>
								<BsGrid3X3Gap />
							</div>
						</button>
						&nbsp;
						<button
							// href="javascript:void(0)"
							onClick={() => {
								this.setState({ postType: 'merchandise' })
							}}
							className='icon_Button'
						>
							{/* <PricetagsOutline
                color={"#ffffff"}
                height="30px"
                width="30px"
                cssClasses="heart-icon"
              /> */}
							<div className='home__icon'>
								<AiOutlineTags />
							</div>
						</button>
					</div>
				</div>
				<div
					style={{
						width: '100%',
						height: '20vw',
						borderRadius: '24px',
						aspectRatio: '4/1',
						marginTop: '30px',
						marginBottom: '10px',
					}}
				>
					<img
						src={`${baseURL}/afroboostbanner`}
						style={{
							width: '100%',
							height: '20vw',
							aspectRatio: '4/1',
							borderRadius: '24px',
							objectFit: 'cover',
						}}
						alt=''
					/>
				</div>
				<div className='categories'>
					{this.state.categoriesOpened ? (
						<FlatList
							list={this.categoriesList}
							renderItem={(item: string, index: number) => (
								<Category
									onClick={() => {
										this.setState({ category: item })
									}}
									chosen={item === this.state.category}
									key={index}
									category={item}
								/>
							)}
						/>
					) : null}
				</div>

				<div className='posts'>
					{this.state.postsList.length ? (
						<FlatList
							list={this.state.postsList}
							renderItem={(item: IAfropost, index: number) => {
								if (
									item.postTitle.startsWith('(Hidden)') &&
									item.posterID.toString() !== localStorage.getItem('afroboostid') &&
									'14' !== localStorage.getItem('afroboostid')
								)
									return

								return <Afropost key={item.postID} post={item} />
							}}
							sort={{
								by: [
									{
										key: 'postDate',
										descending: this.state.sortType === 'Latest posts',
									},
								],
							}}
							filterBy={(item: IAfropost) => {
								return (
									item.postTitle
										.toLowerCase()
										.includes(this.state.searchQuery.toLowerCase()) &&
									(item.postCategory === this.state.category ||
										this.state.category === 'Everything') &&
									(item.postType === this.state.postType ||
										this.state.postType === 'Everything')
								)
							}}
							displayGrid
							gridGap='30px'
							minColumnWidth='250px'
						/>
					) : null}
				</div>
			</div>
		)
	}
}

export default Homepage
