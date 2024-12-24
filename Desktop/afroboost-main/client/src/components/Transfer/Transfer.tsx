// @ts-nocheck
import React, { Component, useState } from 'react'
import './Transfer.css'
// import {
//   Ticket,
//   Wallet,
//   Heart,
//   MailUnread,
//   MusicalNotesOutline,
//   VideocamOutline,
//   ImageOutline,
//   PricetagsOutline,
//   BagHandleOutline,
//   CardOutline,
//   CashOutline,
// } from "react-ionicons";

import Spectrum from '../Spectrum/Spectrum'
import { PayPalButton } from 'react-paypal-button-v2'
import axios from 'axios'
import English from '../../english'
import France from '../../france'
import Germany from '../../germany'
import Spain from '../../spain'
import { FaBeer, FaMoneyBill, FaPercentage } from 'react-icons/fa'
import { baseURL, devURL } from '../../api'
import {
	IoBagHandleOutline,
	IoCashOutline,
	IoImageOutline,
	IoMailUnread,
	IoMusicalNotesOutline,
	IoPricetagsOutline,
	IoSaveSharp,
	IoVideocamOutline,
} from 'react-icons/io5'
import { BsCloudDownload, BsDownload, BsSave, BsTicket } from 'react-icons/bs'

import { saveAs } from 'file-saver'
import { jsPDF } from 'jspdf'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { BiCalendarEvent, BiCloudDownload, BiUpload } from 'react-icons/bi'
import voucherBack from './voucherback.png'
import voucherFront from './voucherfrontdefault.jpg'
import { RiUpload2Fill } from 'react-icons/ri'
import html2canvas from 'html2canvas'

const l = {
	en: English,
	fr: France,
	ge: Germany,
	sp: Spain,
}
interface IProps {}

interface IState {
	totalPrice: string
	totalBalance: number
	generatedVoucher: string
}

class Transfer extends Component<IProps, IState> {
	confirmVoucherInput?: HTMLInputElement | null

	constructor(props: IProps) {
		super(props)
		this.state = {
			totalPrice: '5.00',
			totalBalance: -1,
			generatedVoucher: 'Not generated yet',
			transferContent: 'withdraw',
			expiryDate: '',
			postsInfo: [],
			paymentResult: [],
			soldPostsInfo: [],
			buyersInfo: [],
			email: '',
			commissions: '',
			selectedDate: null,
			hover: false,
			file: null,
			voucherCurrencyValue: 'CHF',
		}
		axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*'
	}

	componentDidMount() {
		this.getBalance()
		this.getPaymentHistory()
		this.getSoldPosts()
	}

	async getBalance() {
		let balance = await axios.get(`${baseURL}/user/getBalance`, {
			headers: {
				'X-Auth-Token': localStorage.getItem('afroboostauth'),
			},
		})
		this.setState({ totalBalance: balance.data.message })
	}
	async getPaymentHistory() {
		try {
			let data = await axios.get(`${baseURL}/user/getPaymentHistory`, {
				headers: {
					'X-Auth-Token': localStorage.getItem('afroboostauth'),
				},
			})
			console.log('PAYMENT HISTORY: ', data)
			this.setState({
				postsInfo: data.data.message,
				paymentResult: data.data.message2,
			})
		} catch (error) {
			console.log(error)
		}
	}
	async getSoldPosts() {
		const data = await axios.get(`${baseURL}/user/getSoldPosts`, {
			headers: {
				'X-Auth-Token': localStorage.getItem('afroboostauth'),
			},
		})
		this.setState({
			soldPostsInfo: data.data.message,
		})
		console.log('SOLD POSTS INFO: ', this.state.soldPostsInfo)
	}
	subscriptionDetails(i) {
		switch (this.state.paymentResult[i]) {
			case 'monthly_sub':
				return 'Monthly subscription'
			case 'quareterly_sub':
				return 'Quarterly subscription'
			case 'annual_sub':
				return 'Annual subscription'
		}
	}

	handleDownloadPayments = () => {
		const { postsInfo } = this.state
		const doc = new jsPDF()

		postsInfo.forEach((itemArray, index) => {
			const library = this.state.paymentResult[index]
			const item = itemArray[0]

			if (item) {
				const imgData = `${devURL}/logoblack.png`
				const title = item.postTitle
				const description = item.postDescription
				const subType = library.additionalTag

				const productType = item.productType || ''
				const quantity = item.qunatity || ''
				const size = item.size || ''
				const dateBought = library.date ? new Date(library.date).toLocaleDateString() : ''
				const boughtFrom = item.name

				const price = library.value !== '0' ? library.value : item.postPrice
				// console.log('debug 2.0')
				// console.log(library.value !== '0' ? library.value : item.postPrice)

				doc.setFontSize(12)
				doc.text('Payments', 60, 10) // Modify the coordinates for the title

				doc.setFontSize(10)
				doc.addImage(imgData, 'JPEG', 10, 10, 40, 25)
				doc.text(`Title: ${title}`, 60, 20)
				doc.text(`Description:`, 60, 25)

				const splitDescription = doc.splitTextToSize(
					description,
					140, // Adjust the width as per your preference
				)
				const descriptionHeight = splitDescription.length * 6

				splitDescription.forEach((line, lineIndex) => {
					doc.text(line, 60, 30 + lineIndex * 5) // Adjust the vertical position as needed
				})

				const baseVerticalPosition = 30 + descriptionHeight

				doc.text(`Sub Type: ${subType}`, 60, baseVerticalPosition + 1) // Modify the coordinates for the sub type
				doc.text(`Product Type: ${productType}`, 60, baseVerticalPosition + 5) // Modify the coordinates for the product type
				doc.text(`Quantity: ${quantity}`, 60, baseVerticalPosition + 10) // Modify the coordinates for the quantity
				doc.text(`Size: ${size}`, 60, baseVerticalPosition + 15) // Modify the coordinates for the size
				doc.text(`Date Bought: ${dateBought}`, 60, baseVerticalPosition + 20) // Modify the coordinates for the date bought
				doc.text(`Bought From: ${boughtFrom}`, 60, baseVerticalPosition + 25) // Modify the coordinates for the bought from
				doc.text(`Price: CHF ${price}`, 60, baseVerticalPosition + 35) // Modify the coordinates for the price

				// verticalPosition += 50 // Increase the vertical position for the next payment

				if (index < postsInfo.length - 1) {
					doc.addPage()
				}
			}
		})

		doc.save('payments_data.pdf')
	}

	handleSoldPostDownload = () => {
		const { soldPostsInfo } = this.state
		const doc = new jsPDF()

		soldPostsInfo.forEach((item, index) => {
			const library = this.state.paymentResult[index]
			if (item) {
				const imgData = `${devURL}/logoblack.png`
				const title = item.postTitle
				const description = item.postDescription || ''
				const subType = item.additionalTag

				const productType = item.productType
				const quantity = item.quantity || ''
				const size = item.size || ''
				const dateBought = new Date(item.date).toLocaleDateString()
				const boughtBy = item.buyerName
				// const price = library.value !== '0' ? library.value : item.postPrice
				const price = item.additionalTag ? item.libraryValue : item.postPrice

				doc.setFontSize(12)
				doc.text('Sold Posts Details:', 60, 10) // Modify the coordinates for the title
				doc.setFontSize(10)
				doc.addImage(imgData, 'JPEG', 10, 10, 40, 25) // Modify the coordinates and dimensions for the thumbnail
				doc.text(`Title: ${title}`, 60, 20) // Modify the coordinates for the title
				doc.text(`Description:`, 60, 25) // Adjust the vertical position as needed

				const splitDescription = doc.splitTextToSize(
					description,
					140, // Adjust the width as per your preference
				)

				// Calculate the height of the description dynamically
				const descriptionHeight = splitDescription.length * 6

				// Iterate through each line of the split description
				splitDescription.forEach((line, lineIndex) => {
					doc.text(line, 60, 30 + lineIndex * 5) // Adjust the vertical position as needed
				})

				const baseVerticalPosition = 30 + descriptionHeight

				doc.text(`Sub Type: ${subType}`, 60, baseVerticalPosition + 1) // Modify the coordinates for the sub type
				doc.text(`Product Type: ${productType}`, 60, baseVerticalPosition + 5) // Modify the coordinates for the product type
				doc.text(`Quantity: ${quantity}`, 60, baseVerticalPosition + 10) // Modify the coordinates for the quantity
				doc.text(`Size: ${size}`, 60, baseVerticalPosition + 15) // Modify the coordinates for the size
				doc.text(`Date Bought: ${dateBought}`, 60, baseVerticalPosition + 20) // Modify the coordinates for the date bought
				doc.text(`Bought By: ${boughtBy}`, 60, baseVerticalPosition + 25) // Modify the coordinates for the bought by
				doc.text(`Price: CHF ${price}`, 60, baseVerticalPosition + 35) // Modify the coordinates for the price

				if (index < soldPostsInfo.length - 1) {
					doc.addPage() // Add a new page for the next sold post
				}
			}
		})

		doc.save('Sold_posts_data.pdf')
	}

	handleDownloadTransactionHistory = () => {
		const { postsInfo, paymentResult } = this.state
		const doc = new jsPDF()

		postsInfo.forEach((itemArray, index) => {
			const library = this.state.paymentResult[index]
			const item = itemArray[0]
			if (item) {
				const imgData = `${devURL}/logoblack.png`
				const postTitle = item.postTitle
				const postDescription = item.postDescription

				const subType = paymentResult[index].additionalTag

				const productType = item.productType
				const quantity = item.qunatity
				const size = item.size || ''
				const dateBought = paymentResult[index].date
					? new Date(paymentResult[index].date).toLocaleDateString()
					: ''
				const boughtFrom = item.name
				const boughtBy = paymentResult[index].buyerName
				// const postPrice = paymentResult[index].additionalTag
				const postPrice = library.value !== '0' ? library.value : item.postPrice

				// console.log('debug1')
				// console.log(library.value)
				// // ? item.additionalTag
				// // : item.postPrice

				doc.setFontSize(12)
				doc.text('Transaction Details:', 60, 10) // Modify the coordinates for the title
				// Increase vertical position for the next element
				doc.setFontSize(10)
				doc.addImage(imgData, 'JPEG', 10, 10, 40, 25) // Modify the coordinates and dimensions for the image
				doc.text(`Post Title: ${postTitle}`, 60, 20) // Modify the coordinates for the post title
				doc.text(`Description: `, 60, 25) // Adjust the vertical position as needed

				const splitDescription = doc.splitTextToSize(
					postDescription,
					140, // Adjust the width as per your preference
				)

				const descriptionHeight = splitDescription.length * 6
				splitDescription.forEach((line, lineIndex) => {
					doc.text(line, 60, 30 + lineIndex * 5) // Adjust the vertical position as needed
				})

				const baseVerticalPosition = 30 + descriptionHeight

				doc.text(`Sub Type: ${subType}`, 60, baseVerticalPosition + 1) // Modify the coordinates for the sub type
				doc.text(`Product Type: ${productType}`, 60, baseVerticalPosition + 5) // Modify the coordinates for the product type
				doc.text(`Quantity: ${quantity}`, 60, baseVerticalPosition + 10) // Modify the coordinates for the quantity
				doc.text(`Size: ${size}`, 60, baseVerticalPosition + 15) // Modify the coordinates for the size
				doc.text(`Date Bought: ${dateBought}`, 60, baseVerticalPosition + 20) // Modify the coordinates for the date bought
				doc.text(`Bought From: ${boughtFrom}`, 60, baseVerticalPosition + 25) // Modify the coordinates for the bought from
				doc.text(`Bought By: ${boughtBy}`, 60, baseVerticalPosition + 30) // Modify the coordinates for the bought by
				doc.text(`Price: CHF ${postPrice}`, 60, baseVerticalPosition + 35) // Modify the coordinates for the price

				// Increase the vertical position for the next transaction

				if (index < postsInfo.length - 1) {
					doc.addPage()
				}
			}
		})

		doc.save('transaction_history.pdf')
	}

	getPostTypeIcon = postType => {
		switch (postType) {
			case 'audio':
				return audioIcon // Replace with the audio icon URL or import statement
			case 'video':
				return videoIcon // Replace with the video icon URL or import statement
			case 'image':
				return imageIcon // Replace with the image icon URL or import statement
			default:
				return priceTagsIcon // Replace with the default icon URL or import statement
		}
	}

	handleHover = () => {
		this.setState({ hover: true })
	}

	handleHoverEnd = () => {
		this.setState({ hover: false })
	}

	handleFileChange = e => {
		const file = e.target.files[0]
		if (file) {
			this.setState({ file })
		}
	}
	handleDownload = () => {
		const rowElement = document.querySelector('.image__row')

		html2canvas(rowElement).then(canvas => {
			// Convert the canvas to base64 image data
			const dataURL = canvas.toDataURL('image/png')

			// Create a temporary anchor element to download the image
			const link = document.createElement('a')
			link.href = dataURL
			link.download = 'voucher.png'

			// Programmatically trigger the download
			link.click()
		})
	}

	handleSaveVoucher = () => {
		const rowElement = document.querySelector('.image__row')
		const generatedVoucherCode = this.state.generatedVoucher

		html2canvas(rowElement).then(canvas => {
			canvas.toBlob(blob => {
				const file = new File([blob], 'voucher.png', { type: 'image/png' })
				const formData = new FormData()
				formData.append('uploadedFile', file)
				formData.append('voucherCode', generatedVoucherCode)

				fetch(`${baseURL}/post/uploadVoucher`, {
					method: 'POST',
					headers: {
						'X-Auth-Token': localStorage.getItem('afroboostauth'), // Add the appropriate authentication token here
					},
					body: formData,
					voucherCode: generatedVoucherCode,
				})
					.then(response => {
						if (response.ok) {
							console.log('Image uploaded successfully!')
						} else {
							console.log('Image upload failed.')
						}
					})
					.catch(error => {
						console.error('Image upload error:', error)
					})
			})
		})
	}
	handleVoucherCurrency = e => {
		this.setState({ voucherCurrencyValue: e.target.value })
		this.forceUpdate()
	}

	displayTransferContent() {
		switch (this.state.transferContent) {
			case 'withdraw':
				return (
					<div className='transfer-content'>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								minWidth: '28%',
								marginTop: '50px',
								alignItems: 'center',
							}}
						>
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
								}}
							>
								<img
									src='https://img.icons8.com/wired/150/ffffff/money-transfer.png'
									alt=''
								/>
							</div>
							<h2 className='page-title transfer-title'>
								<Spectrum />
								&nbsp;&nbsp;
								{l[localStorage.getItem('language')]['withdrawFunds']}
							</h2>
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', width: '80%' }}>
							<span
								style={{
									color: 'white',
									fontFamily: 'Montserrat',
									fontWeight: 500,
								}}
							>
								{l[localStorage.getItem('language')]['withdrawFundsText']}
							</span>
							<div className='search' style={{ marginTop: 16 }}>
								{/* <MailUnread
                  cssClasses="search-icon"
                  height="23px"
                  width="23px"
                  color={"#ffffff"}
                /> */}
								<div className='transfer__icon mail__icon'>
									<IoMailUnread />
								</div>

								<input
									ref={ref => {
										this.mailReference = ref
									}}
									placeholder='Your e-mail address...'
									autoComplete='off'
									type='text'
									id='search'
								/>
							</div>
							<p
								style={{
									color: 'white',
									fontFamily: 'Montserrat',
									fontWeight: 500,
									marginTop: 24,
									marginBottom: 14,
								}}
							>
								{l[localStorage.getItem('language')]['carefulText']}
							</p>
							<button
								onClick={async () => {
									if (!this.mailReference) return
									if (this.state.totalBalance === 0) {
										return alert(
											'You do not reach minimal amount of funds to withdraw them.',
										)
									}
									if (this.mailReference.value.trim().length < 6) {
										return alert('Please enter a valid e-mail address.')
									}
									await axios.post(
										`${baseURL}/user/withdrawBalance`,
										{
											mail: this.mailReference.value,
										},
										{
											headers: {
												'X-Auth-Token': localStorage.getItem('afroboostauth'),
											},
										},
									)
									this.getBalance()
									console.log(this.state.totalBalance)
									alert(
										'Funds withdrawn successfully. You can expect them on the PayPal account associated with your e-mail in the next 7 to 14 working days.',
									)
								}}
								className='transfer__button requestwithdrawalbtn'
							>
								<p
									style={{
										color: 'white',
										fontFamily: 'Montserrat',
										fontWeight: 500,
										marginTop: 24,
										marginBottom: 14,
									}}
								>
									{l[localStorage.getItem('language')]['requestWithdraw']}
								</p>
							</button>
						</div>
					</div>
				)
			case 'deposit':
				return (
					<div className='transfer-content'>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								minWidth: '28%',
								alignItems: 'center',
								marginTop: '50px',
							}}
						>
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
								}}
							>
								<img src='https://img.icons8.com/wired/150/ffffff/donate.png' alt='' />
							</div>
							<h2 className='page-title transfer-title'>
								<Spectrum />
								&nbsp;&nbsp;
								{l[localStorage.getItem('language')]['depositFunds']}
							</h2>
						</div>
						<div>
							<span
								style={{
									color: 'white',
									fontFamily: 'Montserrat',
									fontWeight: 500,
								}}
							>
								{l[localStorage.getItem('language')]['depositFundsText']}
							</span>
							<div className='search' style={{ marginTop: 16 }}>
								<span
									style={{
										color: 'white',
										cursor: 'default',
										fontFamily: 'Montserrat',
										fontWeight: 'bold',
										height: 23,
										width: 23,
										background: 'linear-gradient(#4c06a0, #620178)',
										borderRadius: 23,
										paddingLeft: 14,
										paddingRight: 26,
										paddingTop: 14,
										paddingBottom: 14,
										lineHeight: 1.4,
									}}
								>
									CHF
								</span>
								<input
									ref={(ref: HTMLInputElement) => (this.depositInput = ref)}
									value={this.state.totalPrice}
									onChange={(e: any) => {
										e.target.value = Math.abs(Math.max(5.0, e.target.value))
										e.target.value = parseFloat(e.target.value).toFixed(2)
										this.setState({ totalPrice: e.target.value })
									}}
									placeholder='Enter amount to deposit'
									autoComplete='off'
									type='number'
									step='0.50'
									id='search'
								/>
							</div>
							<p
								style={{
									color: 'white',
									fontFamily: 'Montserrat',
									fontWeight: 500,
									marginTop: 24,
									marginBottom: 14,
								}}
							>
								Total price after calculating the transaction fees will be:{' '}
							</p>
							<h1
								style={{
									color: 'white',
									fontFamily: 'Montserrat',
									fontWeight: 'bold',
									fontSize: 30,
								}}
							>
								CHF{' '}
								{(
									parseFloat(this.state.totalPrice) +
									0.3 +
									parseFloat(this.state.totalPrice) * 0.05
								).toFixed(2)}
							</h1>
							{/* // 'AUzmLyP11v7on8QS8-3zRCpDRFXLY5wfa5XlzRoz8MS5hRIeqg5x-YH7TOGs3Qd5wz0LSOX90OVuVCWf', */}
							<PayPalButton
								amount={(
									parseFloat(this.state.totalPrice) +
									0.3 +
									parseFloat(this.state.totalPrice) * 0.05
								).toFixed(2)}
								currency='CHF'
								options={{
									currency: 'CHF',
									clientId:
										'AUzmLyP11v7on8QS8-3zRCpDRFXLY5wfa5XlzRoz8MS5hRIeqg5x-YH7TOGs3Qd5wz0LSOX90OVuVCWf',
								}}
								shippingPreference='NO_SHIPPING' // default is "GET_FROM_FILE"
								onSuccess={async (details: any, data: any) => {
									// OPTIONAL: Call your server to save the transaction
									const transactionConfirmation = await axios.post(
										`${baseURL}/user/transactionCallback`,
										{
											transaction: details,
										},
										{
											headers: {
												'X-Auth-Token': localStorage.getItem('afroboostauth'),
											},
										},
									)

									this.getBalance()
									alert('Transaction made successfully')
									return transactionConfirmation
								}}
							/>
						</div>
					</div>
				)
			case 'voucher':
				return (
					<div className='transfer-content'>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								minWidth: '28%',
								alignItems: 'center',
							}}
						>
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
								}}
							>
								<img
									src='https://img.icons8.com/wired/150/ffffff/membership-card.png'
									alt=''
								/>
							</div>
							<h2 className='page-title transfer-title'>
								<Spectrum />
								&nbsp;&nbsp;{l[localStorage.getItem('language')]['voucherCode']}
							</h2>
						</div>
						<div style={{ alignSelf: 'center' }}>
							<span
								style={{
									color: 'white',
									fontFamily: 'Montserrat',
									fontWeight: 500,
								}}
							>
								{l[localStorage.getItem('language')]['voucherMessage']}
							</span>

							<div className='search' style={{ marginTop: 16 }}>
								<div className='transfer__icon'>
									<BsTicket />
								</div>
								{/* <Ticket
                  cssClasses="search-icon"
                  height="23px"
                  width="23px"
                  color={"#ffffff"}
                /> */}
								<form>
									<input
										ref={ref => (this.confirmVoucherInput = ref)}
										placeholder={l[localStorage.getItem('language')]['enterVoucher']}
										autoComplete='off'
										type='text'
										id='search'
									/>
								</form>
							</div>
							<button
								// href="javascript:void(0)"
								style={{
									textDecoration: 'underline',
									textDecorationColor: 'white',
								}}
								onClick={async () => {
									try {
										if (!this.confirmVoucherInput) return
										const request = await axios.post(
											`${baseURL}/user/activateVoucher`,
											{
												code: this.confirmVoucherInput?.value,
											},
											{
												headers: {
													'X-Auth-Token': localStorage.getItem('afroboostauth'),
												},
											},
										)
										this.getBalance()
									} catch (error) {
										alert('Invalid code. Please enter a valid code and try again.')
									}
								}}
								className='transfer__button'
							>
								<p
									style={{
										color: 'white',
										fontFamily: 'Montserrat',
										fontWeight: 500,
										marginTop: 24,
										marginBottom: 14,
									}}
								>
									{l[localStorage.getItem('language')]['activateVoucher']}{' '}
								</p>
							</button>
						</div>
					</div>
				)
			case 'payment-history':
				if (!this.state.postsInfo[0]) {
					return (
						<div
							style={{
								display: 'flex',
								width: '90%',
								alignItems: 'center',
								justifyContent: 'center',
								flexDirection: 'column',
							}}
						>
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
									marginTop: '30px',
								}}
							>
								<img
									src='https://img.icons8.com/ios/150/ffffff/activity-history.png'
									alt=''
								/>
							</div>
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
								}}
							>
								<h2
									className='page-title transfer-title'
									style={{
										display: 'flex',
										marginLeft: '-30px',
									}}
								>
									<Spectrum />
									&nbsp;&nbsp; {l[localStorage.getItem('language')]['payments']}
								</h2>
							</div>
							<p
								style={{
									color: 'white',
									fontFamily: 'Montserrat',
									fontWeight: 500,
								}}
							>
								{l[localStorage.getItem('language')]['nothingBought']}
							</p>
						</div>
					)
				} else {
					return (
						<div className='history-container'>
							<div className='left-transfer-content'>
								<div
									style={{
										display: 'flex',
										justifyContent: 'center',
										marginTop: '50px',
									}}
								>
									<img
										src='https://img.icons8.com/ios/150/ffffff/activity-history.png'
										style={{ height: '150px', width: '150px' }}
										alt=''
									/>
								</div>
								<div
									style={{
										display: 'flex',
										justifyContent: 'center',
									}}
								>
									<h2
										className='page-title transfer-title'
										style={{
											display: 'flex',
										}}
									>
										<Spectrum />
										&nbsp;&nbsp;{l[localStorage.getItem('language')]['payments']}
									</h2>
								</div>
							</div>
							<div
								style={{
									display: 'flex',
									flexDirection: 'column-reverse',
									alignSelf: 'center',
								}}
							>
								{this.state.postsInfo.map((itemArray, index) => {
									let library = this.state.paymentResult[index]
									let item = itemArray[0]
									if (item) {
										return (
											<div key={index} className='history-div'>
												<div
													style={{
														display: 'flex',
														alignItems: 'center',
													}}
												>
													{item.postType === 'audio' ? (
														// <MusicalNotesOutline
														//   color={"#ffffff"}
														//   height="40px"
														//   width="40px"
														//   cssClasses="heart-icon"
														// />

														<div className='transfer__icon'>
															<IoVideocamOutline />
														</div>
													) : item.postType === 'video' ? (
														// <VideocamOutline
														//   color={"#ffffff"}
														//   height="40px"
														//   width="40px"
														//   cssClasses="heart-icon"
														// />
														<div className='transfer__icon'>
															<IoVideocamOutline />
														</div>
													) : item.postType === 'image' ? (
														// <ImageOutline
														//   color={"#ffffff"}
														//   height="40px"
														//   width="40px"
														//   cssClasses="heart-icon"
														// />
														<div className='transfer__icon'>
															<IoImageOutline />
														</div>
													) : (
														// <PricetagsOutline
														//   color={"#ffffff"}
														//   height="40px"
														//   width="40px"
														//   cssClasses="heart-icon"
														// />
														<div className='transfer__icon'>
															<IoPricetagsOutline />
														</div>
													)}
													<p className='history-post-title'>{item.postTitle}</p>
												</div>
												<div>
													<p className='history-post-desc'>{item.postDescription}</p>
												</div>
												<div>
													<div>
														{library.additionalTag ? (
															<p className='history-post-desc'>
																<b> {l[localStorage.getItem('language')]['subType']}:</b>{' '}
																{this.subscriptionDetails(library.additionalTag)}
															</p>
														) : null}
														{library.productType ? (
															<span
																style={{
																	display: 'flex',
																	flexDirection: 'row',
																	justifyContent: 'space-between',
																	alignItems: 'center',
																}}
															>
																<p className='history-post-desc'>
																	<b>
																		{' '}
																		{l[localStorage.getItem('language')]['productType']}:
																	</b>{' '}
																	{item.productType}
																</p>
																<p className='history-post-desc'>
																	<b>
																		{l[localStorage.getItem('language')]['quantity']}:
																	</b>{' '}
																	{item.qunatity}
																</p>
																{item.size ? (
																	<p className='history-post-desc'>
																		<b>{l[localStorage.getItem('language')]['size']}:</b>{' '}
																		{item.size}
																	</p>
																) : null}
															</span>
														) : null}
														{library.date ? (
															<p className='history-post-desc'>
																<b>
																	{' '}
																	{l[localStorage.getItem('language')]['dateBought']}:
																</b>{' '}
																{new Date(library.date).toLocaleDateString()}
															</p>
														) : null}
														<div className='post-poster'>
															<p
																className='history-post-desc'
																style={{ paddingRight: '12px' }}
															>
																<b>
																	{' '}
																	{l[localStorage.getItem('language')]['boughtFrom']}:
																</b>
															</p>
															<div
																className='image'
																style={{
																	backgroundImage:
																		`url(${baseURL}/profileImage/` + item.posterID + ')',
																	height: 30,
																	width: 30,
																	borderRadius: 15,
																	marginRight: 8,
																	backgroundSize: 'cover',
																	backgroundPositionX: 'center',
																}}
															/>
															<p className='history-post-desc'>{item.name}</p>
														</div>
													</div>
													<div
														style={{
															display: 'flex',
															justifyContent: 'flex-end',
															alignItems: 'center',
														}}
													>
														{/* <BagHandleOutline
                              color={"#ffffff"}
                              height="30px"
                              width="30px"
                              style={{ paddingRight: "8px" }}
                            /> */}
														<div className='transfer__icon'>
															<IoBagHandleOutline />
														</div>
														{library.additionalTag ? (
															<p className='history-post-price'>CHF {library.value}</p>
														) : (
															<p className='history-post-price'>CHF {item.postPrice}</p>
														)}
													</div>
												</div>
											</div>
										)
									}
								})}

								<button className='download_pdfbtn' onClick={this.handleDownloadPayments}>
									<div className='download__text'>(all)</div>

									<div className='download__icon'>
										<BsDownload />
									</div>
								</button>
							</div>
						</div>
					)
				}
			case 'recieved-payment':
				if (!this.state.soldPostsInfo[0]) {
					return (
						<div
							style={{
								display: 'flex',
								width: '90%',
								alignItems: 'center',
								justifyContent: 'center',
								flexDirection: 'column',
							}}
						>
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<div
									style={{
										display: 'flex',
										justifyContent: 'center',
										marginTop: '30px',
									}}
								>
									<img src='https://img.icons8.com/ios/150/ffffff/receive-euro.png' />
								</div>
								<div
									style={{
										display: 'flex',
										justifyContent: 'center',
									}}
								>
									<h2
										className='page-title'
										style={{
											display: 'flex',
											margin: 0,
											marginLeft: '10px',
										}}
									>
										<Spectrum />
										&nbsp;&nbsp; {l[localStorage.getItem('language')]['soldPosts']}
									</h2>
								</div>
							</div>
							<p
								style={{
									color: 'white',
									fontFamily: 'Montserrat',
									fontWeight: 500,
									marginTop: '60px',
								}}
							>
								{l[localStorage.getItem('language')]['noSoldPosts']}
							</p>
						</div>
					)
				} else {
					return (
						<div className='history-container'>
							<div className='left-transfer-content'>
								<div
									style={{
										display: 'flex',
										justifyContent: 'center',
										marginTop: '30px',
									}}
								>
									<img
										src='https://img.icons8.com/ios/150/ffffff/receive-euro.png'
										style={{ height: '150px', width: '150px' }}
									/>
								</div>
								<div
									style={{
										display: 'flex',
										justifyContent: 'center',
									}}
								>
									<h2
										className='page-title transfer-title'
										style={{
											display: 'flex',
											margin: 0,
											marginLeft: '10px',
										}}
									>
										<Spectrum />
										&nbsp;&nbsp;{l[localStorage.getItem('language')]['soldPosts']}
									</h2>
								</div>
							</div>
							<div
								style={{
									display: 'flex',
									flexDirection: 'column-reverse',
									alignSelf: 'center',
								}}
							>
								{this.state.soldPostsInfo.map((item, index) => {
									if (item) {
										let libraryValue = item.libraryValue * 0.8
										libraryValue = parseFloat(libraryValue.toFixed(3))
										let postPrice = item.postPrice * 0.8
										postPrice = parseFloat(postPrice.toFixed(3))
										return (
											<div key={index} className='history-div'>
												<div>
													<div
														style={{
															display: 'flex',
															flexDirection: 'row',
															alignItems: 'center',
														}}
													>
														{item.postType === 'audio' ? (
															// <MusicalNotesOutline
															//   color={"#ffffff"}
															//   height="40px"
															//   width="40px"
															//   cssClasses="heart-icon"
															// />
															<div className='transfer__icon'>
																<IoMusicalNotesOutline />
															</div>
														) : item.postType === 'video' ? (
															// <VideocamOutline
															//   color={"#ffffff"}
															//   height="40px"
															//   width="40px"
															//   cssClasses="heart-icon"
															// />
															<div className='transfer__icon'>
																<IoVideocamOutline />
															</div>
														) : item.postType === 'image' ? (
															// <ImageOutline
															//   color={"#ffffff"}
															//   height="40px"
															//   width="40px"
															//   cssClasses="heart-icon"
															// />
															<div className='transfer__icon'>
																<IoImageOutline />
															</div>
														) : (
															// <PricetagsOutline
															//   color={"#ffffff"}
															//   height="40px"
															//   width="40px"
															//   cssClasses="heart-icon"
															// />
															<div className='transfer__icon'>
																<IoPricetagsOutline />
															</div>
														)}
														<p className='history-post-title'>{item.postTitle}</p>
													</div>
													<p className='history-post-desc'>{item.postDescription}</p>
												</div>
												<div>
													<div>
														{item.additionalTag ? (
															<p className='history-post-desc'>
																<b> {l[localStorage.getItem('language')]['subType']}:</b>{' '}
																<b>{this.subscriptionDetails(item.additionalTag)}</b>
															</p>
														) : null}
														{item.productType ? (
															<span
																style={{
																	display: 'flex',
																	flexDirection: 'row',
																	justifyContent: 'space-between',
																	alignItems: 'center',
																}}
															>
																<p className='history-post-desc'>
																	<b>
																		{' '}
																		{l[localStorage.getItem('language')]['productType']}:
																	</b>{' '}
																	{item.productType}
																</p>
																<p className='history-post-desc'>
																	<b>
																		{' '}
																		{l[localStorage.getItem('language')]['quantity']}:
																	</b>{' '}
																	{item.quantity}
																</p>
																{item.size ? (
																	<p className='history-post-desc'>
																		<b> {l[localStorage.getItem('language')]['size']}:</b>{' '}
																		{item.size}
																	</p>
																) : null}
															</span>
														) : null}
														{item.date ? (
															<p className='history-post-desc'>
																<b>
																	{' '}
																	{l[localStorage.getItem('language')]['dateBought']}:
																</b>{' '}
																<b>{new Date(item.date).toLocaleDateString()}</b>
															</p>
														) : null}
														<div className='post-poster'>
															<p
																className='history-post-desc'
																style={{ paddingRight: '12px' }}
															>
																<b> {l[localStorage.getItem('language')]['boughtBy']}:</b>
															</p>
															<div
																className='image'
																style={{
																	backgroundImage:
																		`url(${baseURL}/profileImage/` + item.buyerID + ')',
																	height: 30,
																	width: 30,
																	borderRadius: 15,
																	marginRight: 8,
																	backgroundSize: 'cover',
																	backgroundPositionX: 'center',
																}}
															/>
															<p className='history-post-desc'>{item.buyerName}</p>
														</div>
													</div>
													<div
														style={{
															display: 'flex',
															flexDirection: 'row',
															justifyContent: 'flex-end',
															alignItems: 'center',
														}}
													>
														<div className='transfer__icon'>
															<IoCashOutline />
														</div>
														{/* <CashOutline
                              color={"#ffffff"}
                              height="30px"
                              width="30px"
                              cssClasses="heart-icon"
                              style={{ marginRight: 0 }}
                            /> */}
														{item.additionalTag ? (
															<p className='history-post-price'>CHF {libraryValue}</p>
														) : (
															<p className='history-post-price'>CHF {postPrice}</p>
														)}
													</div>
												</div>
											</div>
										)
									}
								})}
								<button className='download_pdfbtn' onClick={this.handleSoldPostDownload}>
									<div className='download__text'>(all)</div>

									<div className='download__icon'>
										<BsDownload />
									</div>
								</button>
							</div>
						</div>
					)
				}
			case 'admin':
				return (
					<div className='transfer-content'>
						<div>
							<h2 className='page-title'>
								<Spectrum />
								&nbsp;&nbsp; {l[localStorage.getItem('language')]['voucherGenerator']}
							</h2>
							<span
								style={{
									color: 'white',
									fontFamily: 'Montserrat',
									fontWeight: 500,
								}}
							>
								{l[localStorage.getItem('language')]['voucherGeneratorText']}
							</span>
							<div className='vouchers_valueRow'>
								<div
									className='search search_voucher searcheffect__none'
									style={{ marginTop: 16 }}
								>
									<div className='transfer__icon'>
										<IoMailUnread />
									</div>

									<form>
										<input
											placeholder={l[localStorage.getItem('language')]['emailVoucher']}
											autoComplete='off'
											type='text'
											onChange={e => this.setState({ email: e.target.value })}
											value={this.state.email}
											className='recever__email'
										/>
									</form>
								</div>
								<div
									className='search search_voucher searcheffect__none'
									style={{ marginTop: 16 }}
								>
									<div className='transfer__icon'>
										<FaMoneyBill />
									</div>
									{/* <div className='transfer__icon'></div> */}
									<input
										placeholder='commissions(%)'
										autoComplete='off'
										type='number'
										min='0'
										max='100'
										onChange={e => {
											let inputValue = parseFloat(e.target.value)
											if (!isNaN(inputValue)) {
												inputValue = Math.max(0, Math.min(inputValue, 100))
												this.setState({ commissions: inputValue })
											}
										}}
										value={this.state.commissions}
										id='search'
									/>
								</div>
								{/* //picdate */}
								<div
									className='search search_voucher searcheffect__none'
									style={{ marginTop: 16 }}
								>
									<div className='transfer__icon'>
										<BiCalendarEvent />
									</div>

									<form>
										<DatePicker
											className='datePicker'
											placeholderText='Expiry date'
											autoComplete='off'
											selected={this.state.selectedDate}
											onChange={date => this.setState({ selectedDate: date })}
										/>
									</form>
								</div>
							</div>
							{/* 
							<p
								style={{
									color: 'white',
									fontFamily: 'Montserrat',
									fontWeight: 500,
									marginTop: 24,
									marginBottom: 14,
								}}
							>
								{l[localStorage.getItem('language')]['voucherCodeIs']}:
							</p> */}

							<div className='image__row'>
								<div className='image__column voucher__front'>
									{/* mujtaba */}
									<div className='image-uploader'>
										<div
											className={`image-container ${this.state.hover ? 'hovered' : ''}`}
											onMouseEnter={this.handleHover}
											onMouseLeave={this.handleHoverEnd}
										>
											{this.state.hover && (
												<label htmlFor='imageUpload' className='upload-label'>
													<RiUpload2Fill className='upload-icon' />
												</label>
											)}
											<input
												id='imageUpload'
												type='file'
												accept='image/*'
												style={{ display: 'none' }}
												onChange={this.handleFileChange}
											/>
											<img
												src={
													this.state.file
														? URL.createObjectURL(this.state.file)
														: voucherFront
												}
												alt=''
												className='image'
											/>
										</div>
									</div>

									{/* <img src={voucherFront} alt='' /> */}
									<div className='voucher__chf'>
										<span className='voucher__chf--text'>
											<input
												id='chfCurrency__input'
												ref={(ref: HTMLInputElement) => (this.voucherCurrency = ref)}
												onChange={this.handleVoucherCurrency}
												value={this.state.voucherCurrencyValue}
												placeholder='CHF'
												autoComplete='CHF'
												type='text'
											/>
										</span>
										<span className='voucher__chf--value'>
											<input
												id='chf__input'
												ref={(ref: HTMLInputElement) => (this.voucherInput = ref)}
												onChange={(e: any) => {
													e.target.value = Math.abs(Math.max(0.0, e.target.value))
													e.target.value = parseFloat(e.target.value).toFixed(2)
												}}
												placeholder={l[localStorage.getItem('language')]['enterAmount']}
												autoComplete='off'
												type='number'
												step='0.50'
											/>
										</span>
									</div>
								</div>
								<div className='image__column voucher__back'>
									<img src={voucherBack} alt='' />
									<div className='voucher__code'>{this.state.generatedVoucher}</div>
									<div className='voucher__expiryDate'>
										{this.state.selectedDate
											? this.state.selectedDate.toLocaleDateString()
											: "Date d'expiration"}
									</div>
								</div>
							</div>
							<div className='button__row'>
								<button
									// href='javascript:void(0)'
									className='vouchergeneratebtn'
									onClick={async () => {
										if (!this.voucherInput) return

										let exactDate = new Date(this.state.selectedDate)
										exactDate.setDate(exactDate.getDate() + 1)

										const request = await axios.post(
											`${baseURL}/user/generateVoucher`,
											{
												value: this.voucherInput.value,
												email: this.state.email,
												expirydate: exactDate,
												commissions: this.state.commissions,
											},
											{
												headers: {
													'X-Auth-Token': localStorage.getItem('afroboostauth'),
												},
											},
										)
										this.setState({ generatedVoucher: request.data.message })
									}}
								>
									{l[localStorage.getItem('language')]['generateANewCode']}
								</button>

								{this.state.generatedVoucher !== 'Not generated yet' ? (
									<div style={{ display: 'flex', gap: '1rem' }}>
										<button
											onClick={this.handleSaveVoucher}
											className='download__voucher'
										>
											<IoSaveSharp /> Save Voucher
										</button>
										<button onClick={this.handleDownload} className='download__voucher'>
											<BsDownload /> Download Voucher
										</button>
									</div>
								) : (
									''
								)}
							</div>
						</div>
					</div>
				)
			case 'admin-library':
				return (
					<div className='history-container'>
						<div className='left-transfer-content'>
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
									marginTop: '30px',
								}}
							>
								<img
									src='https://img.icons8.com/wired/500/ffffff/ledger.png'
									style={{ height: '150px', width: '150px' }}
									alt=''
								/>
							</div>
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
								}}
							>
								<h2
									className='page-title transfer-title'
									style={{
										display: 'flex',
									}}
								>
									<Spectrum />
									&nbsp;&nbsp; {l[localStorage.getItem('language')]['transactions']}
								</h2>
							</div>
						</div>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column-reverse',
								alignSelf: 'center',
							}}
						>
							{this.state.postsInfo.map((itemArray, index) => {
								let library = this.state.paymentResult[index]
								let item = itemArray[0]
								if (item) {
									return (
										<div key={index} className='history-div'>
											<div
												style={{
													display: 'flex',
													alignItems: 'center',
												}}
											>
												{item.postType === 'audio' ? (
													// <MusicalNotesOutline
													//   color={"#ffffff"}
													//   height="40px"
													//   width="40px"
													//   cssClasses="heart-icon"
													// />
													<div className='transfer__icon'>
														<IoMusicalNotesOutline />
													</div>
												) : item.postType === 'video' ? (
													// <VideocamOutline
													//   color={"#ffffff"}
													//   height="40px"
													//   width="40px"
													//   cssClasses="heart-icon"
													// />
													<div className='transfer__icon'>
														<IoVideocamOutline />
													</div>
												) : item.postType === 'image' ? (
													// <ImageOutline
													//   color={"#ffffff"}
													//   height="40px"
													//   width="40px"
													//   cssClasses="heart-icon"
													// />
													<div className='transfer__icon'>
														<IoImageOutline />
													</div>
												) : (
													// <PricetagsOutline
													//   color={"#ffffff"}
													//   height="40px"
													//   width="40px"
													//   cssClasses="heart-icon"
													// />
													<div className='transfer__icon'>
														<IoPricetagsOutline />
													</div>
												)}
												<p className='history-post-title'>{item.postTitle}</p>
											</div>
											<div>
												<p className='history-post-desc'>{item.postDescription}</p>
											</div>
											<div>
												<div>
													{library.additionalTag ? (
														<p className='history-post-desc'>
															<b> {l[localStorage.getItem('language')]['subType']}:</b>{' '}
															{this.subscriptionDetails(library.additionalTag)}
														</p>
													) : null}
													{library.productType ? (
														<span
															style={{
																display: 'flex',
																flexDirection: 'row',
																justifyContent: 'space-between',
																alignItems: 'center',
															}}
														>
															<p className='history-post-desc'>
																<b>
																	{' '}
																	{l[localStorage.getItem('language')]['productType']}:
																</b>{' '}
																{item.productType}
															</p>
															<p className='history-post-desc'>
																<b> {l[localStorage.getItem('language')]['qunatity']}:</b>{' '}
																{item.qunatity}
															</p>
															{item.size ? (
																<p className='history-post-desc'>
																	<b> {l[localStorage.getItem('language')]['size']}:</b>{' '}
																	{item.size}
																</p>
															) : null}
														</span>
													) : null}
													{library.date ? (
														<p className='history-post-desc'>
															<b> {l[localStorage.getItem('language')]['dateBought']}:</b>{' '}
															{new Date(library.date).toLocaleDateString()}
														</p>
													) : null}
													<div className='post-poster'>
														<p
															className='history-post-desc'
															style={{ paddingRight: '12px' }}
														>
															<b> {l[localStorage.getItem('language')]['boughtFrom']}:</b>
														</p>
														<div
															className='image'
															style={{
																backgroundImage:
																	`url(${baseURL}/profileImage/` + item.posterID + ')',
																height: 30,
																width: 30,
																borderRadius: 15,
																marginRight: 8,
																backgroundSize: 'cover',
																backgroundPositionX: 'center',
															}}
														/>
														<p className='history-post-desc'>{item.name}</p>
													</div>
													<div className='post-poster'>
														<p
															className='history-post-desc'
															style={{ paddingRight: '12px' }}
														>
															<b> {l[localStorage.getItem('language')]['boughtBy']}:</b>
														</p>
														<div
															className='image'
															style={{
																backgroundImage:
																	`url(${baseURL}/profileImage/` +
																	this.state.paymentResult[index].buyerID +
																	')',
																height: 30,
																width: 30,
																borderRadius: 15,
																marginRight: 8,
																backgroundSize: 'cover',
																backgroundPositionX: 'center',
															}}
														/>
														<p className='history-post-desc'>
															{this.state.paymentResult[index].buyerName}
														</p>
													</div>
												</div>
												<div
													style={{
														display: 'flex',
														justifyContent: 'flex-end',
														alignItems: 'center',
													}}
												>
													<div className='transfer__icon'>
														<IoBagHandleOutline />
													</div>
													{/* <BagHandleOutline
                            color={"#ffffff"}
                            height="30px"
                            width="30px"
                            style={{ paddingRight: "8px" }}
                          /> */}
													{library.additionalTag ? (
														<p className='history-post-price'>CHF {library.value}</p>
													) : (
														<p className='history-post-price'>CHF {item.postPrice}</p>
													)}
												</div>
											</div>
										</div>
									)
								}
							})}

							<button
								className='download_pdfbtn'
								onClick={this.handleDownloadTransactionHistory}
							>
								<div className='download__text'>(all)</div>

								<div className='download__icon'>
									<BsDownload />
								</div>
							</button>
						</div>
					</div>
				)
		}
	}

	depositInput?: HTMLInputElement
	voucherInput?: HTMLInputElement
	voucherCurrency?: HTMLInputElement
	mailReference?: HTMLInputElement | null

	render() {
		return (
			<div
				style={{
					marginLeft: 24,
					marginRight: 24,
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<div className='transfer-balance'>
					<h2
						style={{
							color: 'white',
							fontFamily: 'Montserrat',
							fontWeight: 'bold',
							marginBottom: 4,
						}}
					>
						{l[localStorage.getItem('language')]['yourBalance']}
					</h2>
					<h1
						style={{
							color: 'white',
							fontFamily: 'Montserrat',
							fontWeight: 'bold',
							marginTop: 0,
							fontSize: 40,
							marginBottom: 8,
						}}
					>
						CHF{' '}
						{this.state.totalBalance === -1
							? 'Loading...'
							: this.state.totalBalance.toFixed(2)}
					</h1>
					<span
						style={{
							color: 'white',
							fontFamily: 'Montserrat',
							fontWeight: 500,
						}}
					>
						{l[localStorage.getItem('language')]['useYourBalance']}
					</span>
				</div>
				<div className='transfer'>
					<div className='transfer-nav' style={{ alignSelf: 'center' }}>
						<a
							className={
								this.state.transferContent === 'withdraw'
									? 'ccategory transfer-button'
									: 'category transfer-button'
							}
							onClick={() => {
								this.setState({
									transferContent: 'withdraw',
								})
							}}
						>
							{l[localStorage.getItem('language')]['withdrawFunds']}
						</a>
						<a
							className={
								this.state.transferContent == 'deposit'
									? 'ccategory transfer-button'
									: 'category transfer-button'
							}
							onClick={() => {
								this.setState({ transferContent: 'deposit' })
							}}
						>
							{l[localStorage.getItem('language')]['depositFunds']}
						</a>
						<a
							className={
								this.state.transferContent == 'voucher'
									? 'ccategory transfer-button'
									: 'category transfer-button'
							}
							onClick={() =>
								this.setState({
									transferContent: 'voucher',
								})
							}
						>
							{l[localStorage.getItem('language')]['voucherCode']}
						</a>
						<a
							className={
								this.state.transferContent == 'payment-history'
									? 'ccategory transfer-button'
									: 'category transfer-button'
							}
							onClick={() =>
								this.setState({
									transferContent: 'payment-history',
								})
							}
						>
							{l[localStorage.getItem('language')]['payments']}
						</a>
						<a
							className={
								this.state.transferContent == 'recieved-payment'
									? 'ccategory transfer-button'
									: 'category transfer-button'
							}
							onClick={() =>
								this.setState({
									transferContent: 'recieved-payment',
								})
							}
						>
							{l[localStorage.getItem('language')]['soldPosts']}
						</a>
						{localStorage.getItem('afroboostid') == 4 && (
							<a
								className={
									this.state.transferContent == 'admin'
										? 'ccategory transfer-button'
										: 'category transfer-button'
								}
								onClick={() =>
									this.setState({
										transferContent: 'admin',
									})
								}
							>
								{l[localStorage.getItem('language')]['voucherGenerator']}
							</a>
						)}

						{localStorage.getItem('afroboostid') == 4 && (
							<a
								className={
									this.state.transferContent == 'admin-library'
										? 'ccategory transfer-button'
										: 'category transfer-button'
								}
								onClick={() =>
									this.setState({
										transferContent: 'admin-library',
									})
								}
							>
								{l[localStorage.getItem('language')]['transactions']}
							</a>
						)}
					</div>
					{this.state.transferContent == 'recieved-payment' ? (
						<p
							style={{
								color: 'white',
								fontFamily: 'Montserrat',
								fontWeight: 400,
								textAlign: 'center',
								margin: 20,
							}}
						>
							{l[localStorage.getItem('language')]['youGetPercent']}
						</p>
					) : null}
					{this.displayTransferContent()}
				</div>
			</div>
		)
	}
}
export default Transfer
