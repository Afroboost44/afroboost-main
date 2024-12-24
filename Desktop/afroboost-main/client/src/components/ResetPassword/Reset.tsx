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
import { useHistory } from 'react-router-dom'
import { baseURL } from '../../api'

const l = {
	en: English,
	fr: France,
	ge: Germany,
	sp: Spain,
}

export default function ResetPassword() {
	const history = useHistory()
	const alert = useAlert()
	const [email, setEmail] = useState('')
	const handleSubmit = async () => {
		const request = await axios.post(`${baseURL}/auth/forgot-password`, {
			mail_address: email,
		})
		console.log('Result kuch ye heu')
		console.log(request.data)
		alert.show(request.data.message)
	}
	return (
		<div className='aboutus'>
			<div className='aboutus-container'>
				<div>
					<p className='about-p'>
						<b> Problèmes de connexion ?</b>
						<br />
						<br />
						Connection problems? Entrez votre adresse e-mail, votre numéro de téléphone ou
						votre nom d'utilisateur et nous vous enverrons un lien pour revenir à votre
						compte.
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
							label='E-mail, téléphone ou nom d’utilisateur
                                Email, phone or username'
							type='email'
							fullWidth
						/>
						<br />
						<br /> <br />
						<Button onClick={handleSubmit} color='primary'>
							Envoyer un lien de connexion
						</Button>
						<div className='back-button__wrap'>
							<Button onClick={() => history.push('/')} color='primary'>
								Retour
							</Button>
						</div>
					</p>
				</div>
			</div>
		</div>
	)
}
