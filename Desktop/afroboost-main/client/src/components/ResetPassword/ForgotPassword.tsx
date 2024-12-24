// @ts-nocheck
import React, { Component, useState } from 'react'
import './Reset.css'
import Spectrum from '../Spectrum/Spectrum'
import English from '../../english'
import France from '../../france'
import Germany from '../../germany'
import Spain from '../../spain'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { useAlert } from 'react-alert'
import axios from 'axios'
import { baseURL } from '../../api'

const l = {
	en: English,
	fr: France,
	ge: Germany,
	sp: Spain,
}

export default function ResetPassword() {
	const alert = useAlert()
	const [email, setEmail] = useState('')
	const uId = window.location.pathname
	const handleSubmit = async () => {
		const request = await axios.post(`${baseURL}/auth/reset-password`, {
			password: email,
			id: uId.split('/')[2],
		})
		console.log('request')
		console.log(request)
		alert.show(request.data.message)
	}
	return (
		<div className='aboutus'>
			<div>
				<p
					className='forgotpass'
					style={{ color: 'white', fontFamily: 'Montserrat', textAlign: 'center' }}
				>
					<b> Créer un mot de passe</b>
					<br />
					<br />
					<br />
					<br />
					<TextField
						onChange={(e: any) => {
							setEmail(e.target.value)
						}}
						variant='filled'
						autoFocus
						margin='dense'
						id='name'
						label='nouveau mot de passe'
						type='password'
						fullWidth
					/>
					<br />
					<br /> <br />
					<Button onClick={handleSubmit} color='primary'>
						réinitialiser le mot de passe
					</Button>
					{/* <br /><br />
 <h3>OU</h3>
 <br/>

 <b>Créer un compte</b>
 <br/> <br /> <br /><hr/><br /> <b>Retour connexion
</b> */}
				</p>
			</div>
		</div>
	)
}
