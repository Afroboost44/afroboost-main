import React from 'react'
import Spectrum from '../Spectrum/Spectrum'
import Category from '../Category/Category'
import FlatList from 'flatlist-react'
import Dropdown from 'react-dropdown'
import Afropost from '../Afropost/Afropost'
import 'react-dropdown/style.css'
// import { GridOutline, Search, MusicalNotesOutline, VideocamOutline, ImageOutline } from "react-ionicons";
import axios from 'axios'
import English from '../../english'
import France from '../../france'
import Germany from '../../germany'
import Spain from '../../spain'
import { baseURL } from '../../api'
import { BiSearch } from 'react-icons/bi'
import { IoGridOutline, IoImageOutline, IoMusicalNotesOutline, IoVideocamOutline } from 'react-icons/io5'
import './Liked.css'
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

	postTimestamp: string
	posterID: number
	postType: string
	postCategory: string
}

interface IState {
	postsList: IAfropost[]
	searchQuery: string
	sortType: string
	category: string
	postType: string
}

class Liked extends React.Component<{}, IState> {
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
		}
	}

	async refetchPosts() {
		const homepageData = await axios.post(
			`${baseURL}/post/liked`,
			{},
			{
				headers: {
					'X-Auth-Token': localStorage.getItem('afroboostauth'),
				},
			},
		)
		this.setState({ postsList: homepageData.data.message })
	}

	componentDidMount() {
		this.refetchPosts()
	}

	render() {
		return (
			<div className='homepage'>
				<h2 className='page-title'>
					<Spectrum />
					&nbsp;&nbsp;{l[localStorage.getItem('language')]['liked']}
				</h2>
				<div className='filters'>
					<div className='search' style={{ marginRight: 20 }}>
						<div className='liked__icon'>
							<BiSearch />
						</div>
						{/* <Search
                            cssClasses="search-icon"
                            height="23px"
                            width="23px"
                            color={'#ffffff'}
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
							// href='javascript:void(0)'
							onClick={() => {
								this.setState({ postType: 'Everything' })
							}}
							className='liked__button'
						>
							<div className='liked__icon'>
								<IoGridOutline />
							</div>
							{/* <GridOutline
								color={'#ffffff'}
								height='30px'
								width='30px'
								cssClasses='heart-icon'
							/> */}
						</button>
						&nbsp;
						<button
							// href='javascript:void(0)'
							onClick={() => {
								this.setState({ postType: 'audio' })
							}}
							className='liked__button'
						>
							<div className='liked__icon'>
								<IoMusicalNotesOutline />
							</div>
							{/* <MusicalNotesOutline
								color={'#ffffff'}
								height='30px'
								width='30px'
								cssClasses='heart-icon'
							/> */}
						</button>
						&nbsp;
						<button
							// href='javascript:void(0)'
							onClick={() => {
								this.setState({ postType: 'video' })
							}}
							className='liked__button'
						>
							<div className='liked__icon'>
								<IoVideocamOutline />
							</div>
							{/* <VideocamOutline
								color={'#ffffff'}
								height='30px'
								width='30px'
								cssClasses='heart-icon'
							/> */}
						</button>
						&nbsp;
						<button
							// href='javascript:void(0)'
							onClick={() => {
								this.setState({ postType: 'image' })
							}}
							className='liked__button'
						>
							<div className='liked__icon'>
								<IoImageOutline />
							</div>
							{/* <ImageOutline
								color={'#ffffff'}
								height='30px'
								width='30px'
								cssClasses='heart-icon'
							/> */}
						</button>
					</div>
				</div>
				<div className='categories'>
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
								console.log(item.postCategory)
								console.log(this.state.category)
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

export default Liked
