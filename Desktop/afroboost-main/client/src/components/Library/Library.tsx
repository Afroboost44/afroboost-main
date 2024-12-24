// @ts-nocheck
import React from 'react'
import Spectrum from '../Spectrum/Spectrum'
import Category from '../Category/Category'
import FlatList from 'flatlist-react'
import Dropdown from 'react-dropdown'
import Afropost from '../Afropost/Afropost'
import 'react-dropdown/style.css'
import axios from 'axios'
import English from '../../english'
import France from '../../france'
import Germany from '../../germany'
import Spain from '../../spain'
import './Library.css'
import { BsGrid, BsGrid3X3Gap, BsSearch } from 'react-icons/bs'
import { FaImage } from 'react-icons/fa'
import { HiOutlineMusicalNote, HiOutlineVideoCamera } from 'react-icons/hi2'
import { baseURL } from '../../api'
import { FiDelete } from 'react-icons/fi'
import { BiDownload } from 'react-icons/bi'
import { MdDeleteForever } from 'react-icons/md'

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
	postTimestamp: string
	postCategory: string
}

interface IState {
	postsList: IAfropost[]
	searchQuery: string
	sortType: string
	category: string
	postType: string
	categoriesOpened: boolean
	showVouchers: boolean
}

class Library extends React.Component<{}, IState> {
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

		const afroboostid = localStorage.getItem('afroboostid')
		if (afroboostid === '4') {
			this.categoriesList.push('Vouchers')
		}
		this.state = {
			postsList: [],
			vouchersList: [],
			searchQuery: '',
			category: 'Everything',
			sortType: 'Latest posts',
			postType: 'Everything',
			categoriesOpened: true,
		}
		axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*'
	}

	async refetchPosts() {
		const homepageData = await axios.post(
			`${baseURL}/post/library`,
			{},
			{
				headers: {
					'X-Auth-Token': localStorage.getItem('afroboostauth'),
				},
			},
		)
		console.log(homepageData)
		this.setState({ postsList: homepageData.data.message })
	}
	async fetchVouchers() {
		console.log('button working....')
		try {
			const vouchers = await axios.get(`${baseURL}/getVouchers`, {
				headers: {
					'X-Auth-Token': localStorage.getItem('afroboostauth'),
				},
			})
			console.log(vouchers)
			this.setState({ vouchersList: vouchers.data.message })
		} catch (error) {
			console.error(error)
		}
	}

	deleteVoucher(voucherID) {
		axios
			.post(
				`${baseURL}/post/deleteVoucher`,
				{ voucherID },
				{
					headers: {
						'X-Auth-Token': localStorage.getItem('afroboostauth'),
					},
				},
			)
			.then(() => {
				alert('Voucher deleted successfully')
				// Voucher deleted successfully, update the state or perform any other necessary actions
				console.log('Voucher deleted')
			})
			.catch(error => {
				// Handle any errors that occur during the deletion process
				console.error(error)
			})
	}

	downloadVoucher(imageURL) {
		fetch(imageURL)
			.then(response => response.blob())
			.then(blob => {
				const url = URL.createObjectURL(blob)
				const link = document.createElement('a')
				link.href = url
				link.download = 'voucher.png'
				link.click()
				URL.revokeObjectURL(url)
			})
			.catch(error => {
				console.error('Error downloading voucher:', error)
			})
	}

	componentDidMount() {
		this.refetchPosts()
		this.fetchVouchers()
	}

	render() {
		return (
			<div className='homepage'>
				<h2 className='page-title'>
					<Spectrum />
					&nbsp;&nbsp;{l[localStorage.getItem('language')]['library']}
				</h2>
				<div className='filters'>
					<div className='search' style={{ marginRight: 20 }}>
						<div className='search__icon'>
							<BsSearch />
						</div>
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
							onClick={() => {
								this.setState({ postType: 'Everything' })
							}}
							className='library__button'
						>
							<div className='library__icon'>
								<BsGrid />
							</div>
						</button>
						&nbsp;
						<button
							onClick={() => {
								this.setState({ postType: 'audio' })
							}}
							className='library__button'
						>
							<div className='library__icon'>
								<HiOutlineMusicalNote />
							</div>
						</button>
						&nbsp;
						<button
							onClick={() => {
								this.setState({ postType: 'video' })
							}}
							className='library__button'
						>
							<div className='library__icon'>
								<HiOutlineVideoCamera />
							</div>
						</button>
						&nbsp;
						<button
							onClick={() => {
								this.setState({ postType: 'image' })
							}}
							className='library__button'
						>
							<div className='library__icon'>
								<FaImage />
							</div>
						</button>
						&nbsp;
						<button
							onClick={() =>
								this.setState({ categoriesOpened: !this.state.categoriesOpened })
							}
							className='library__button'
						>
							<div className='library__icon'>
								<BsGrid3X3Gap />
							</div>
						</button>
					</div>
				</div>
				<div className='categories'>
					{this.state.categoriesOpened ? (
						<FlatList
							list={this.categoriesList}
							renderItem={(item: string, index: number) => (
								<Category
									onClick={() => {
										this.setState({ category: item })
										if (item === 'Vouchers') {
											this.fetchVouchers()
											this.setState({ showVouchers: true })
										} else {
											// this.setState({ category: item })
											this.setState({ showVouchers: false })
										}
									}}
									chosen={item === this.state.category}
									key={index}
									category={item}
								/>
							)}
						/>
					) : null}
				</div>
				{!this.state.showVouchers ? (
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
				) : (
					<div className='vouchers'>
						{this.state.vouchersList.length ? (
							this.state.vouchersList.map((voucher, index) => (
								<div key={index} className='voucher__row'>
									<img src={voucher.imageURL} alt={`Voucher ${index}`} />
									<div className='voucher__actionsbtn'>
										<div
											className='delete__btn'
											onClick={() => this.deleteVoucher(voucher.voucherID)}
										>
											<MdDeleteForever />
										</div>
										<div
											className='delete__btn download__btn'
											onClick={() => this.downloadVoucher(voucher.imageURL)}
										>
											<BiDownload />
										</div>
									</div>
								</div>
							))
						) : (
							<p>No vouchers available</p>
						)}
					</div>
				)}
			</div>
		)
	}
}

export default Library
