// @ts-nocheck
import React, { Component } from 'react'
import './AboutUs.css'
import Spectrum from './../Spectrum/Spectrum'
import English from '../../english'
import France from '../../france'
import Germany from '../../germany'
import Spain from '../../spain'
import axios from 'axios'
import { baseURL } from '../../api'
import Post from '../Post/Post'
const l = {
	en: English,
	fr: France,
	ge: Germany,
	sp: Spain,
}

export default class AboutUs extends Component<{}, IState> {
	constructor(props) {
		super(props)
		this.state = {
			getPostID: undefined,
			displayContent: false,
		}
	}
	async getAboutPostID() {
		try {
			const id = await axios.get(`${baseURL}/post/getAboutUsPost`, {
				headers: {
					'X-Auth-Token': localStorage.getItem('afroboostauth'),
				},
			})
			this.setState({ getPostID: id.data.message })
			this.setState({ displayContent: true })
			return id.data.message
		} catch (error) {
			console.log(error)
		}
	}

	componentDidMount(): void {
		this.getAboutPostID()
	}
	render() {
		const { getPostID } = this.state

		return (
			<>
				{getPostID ? (
					<div>
						<Post
							match={{
								params: {
									id: getPostID,
								},
							}}
						/>
					</div>
				) : (
					this.state.displaContent && (
						<div className='aboutus'>
							<h2 className='page-title' style={{ marginTop: 24, marginLeft: 35 }}>
								<Spectrum />
								&nbsp;&nbsp;{l[localStorage.getItem('language')]['aboutus']}
							</h2>

							<div
								className='aboutus-container'
								style={{
									display: 'flex',
									marginTop: 38,
									alignSelf: 'center',
									marginLeft: 35,
								}}
							>
								<div style={{ width: 300 }}>
									<img
										width='300px'
										style={{ borderRadius: 14 }}
										src='https://saiedmusic.com/wp-content/uploads/2022/09/music-rainbow.jpg'
										alt=''
									/>
									<img
										width='300px'
										style={{ borderRadius: 14, marginTop: 24 }}
										src='https://saiedmusic.com/wp-content/uploads/2022/09/music-rainbow.jpg'
										alt=''
									/>
								</div>

								<div>
									<p
										style={{
											color: 'white',
											fontFamily: 'Montserrat',
											marginLeft: 24,
											marginRight: 24,
										}}
									>
										<h1>Afroboost</h1>
										Afroboost est un concept qui regroupe toute une communauté qui a
										l'Afrique à coeur. <br /> <br />
										Le réseau Afroboost gravite autour d'un principe en particulier :
										l'union fait la force. Afroboost encourage la solidarité et permet à
										ses membres d'être plus forts économiquement. <br />
										Il donne une impulsion à vos idées et booste vos projets ou commerces
										en lien avec l'Afrique. <br />
										Afroboost vous accorde une visibilité et aide vos projets à prospérer.
										En jouant le rôle de moteur, Afroboost vous permettra de jouir d'une
										liberté financière inespérée. Une communauté dynamique En devenant
										membre de cette communauté dynamique, vous devenez de surcroît des
										Afroboosteurs. <br />
										<br />
										Un Afroboosteur est quelqu'un qui booste <br />
										<br />
										• physiquement par sa présence aux évènements
										<br />
										<br />
										• mentalement par la motivation et en faisant ressortir le meilleur de
										l'autre
										<br />
										<br />
										• économiquement par la collaboration dans des projets
										<br />
										<br />
										• l'image de sa communauté en mettant en valeur les produits de
										celle-ci.
										<br />
										<br />
										Le sport Afroboost est né d'un concept sportif de danse africaine
										urbaine et traditionnelle. Il vise plusieurs objectifs :<br />
										<br />
										• pratiquer du sport en s'amusant
										<br />
										<br />
										• allier l'activité physique et le chant
										<br />
										<br />
										• libérer l'esprit de tout tracas quotidien
										<br />
										<br />
										Avec Afroboost, le sport sort de ses carcans traditionnels, se défait
										de ses contraintes et devient un moment d'amusement sans pour autant
										perdre de vue votre but. Au cours d'Afroboost :<br />
										<br />
										• Vous tonifiez et musclez votre corps
										<br />
										<br />
										• Vous affinez votre silhouette
										<br />
										<br />
										• Vous brûlez près de 800 calories en une séance d'une heure
										<br />
										<br />
										• La différence se remarque après 6 semaines d'assiduité
										<br />
										<br />
										• L'effort est fourni sans s'en rendre compte
										<br />
										<br />
										• Le résultat est rapide, efficace et avec un bonus : la perte de
										poids
										<br />
										<br />
										Un engagement pour l'Afrique
										<br />
										<br />
										Le concept Afroboost va au-delà du sport. Bien qu'il dépasse les
										frontières du continent africain, Afroboost réunit tous ceux qui sont
										sensibles aux défis que rencontre l'Afrique.
										<br />
										<br />
										Afroboost se veut une boussole pour ceux qui souhaitent contribuer à
										l'essor d'une économie africaine solide et croissante. Ses membres ont
										compris la force et les profits du travail en synergie. Ils veulent
										promouvoir les cultures africaines dans toute leur richesse.
										<br />
										<br />
										Cet engagement pour une Afrique forte et solidaire est facilité par
										Afroboost. Car, ce concept a été pensé pour mettre en valeur vos
										projets, quel qu'en soit le domaine, afin qu'ils rayonnent et touchent
										un public le plus large possible.
										<br />
										<br />
										Un modèle gagnant-gagnant Le concept Afroboost repose sur un modèle
										gagnant-ganant. Chacune des initiatives bénéficie à tous ses membres.
										Ces derniers s'entraident, partagent leurs idées et s'apportent un
										soutien financier mutuel.
										<br />
										<br />
										Chaque membre constitue le maillon d'une chaîne de solidarité. Chaque
										abonné est à son tour client ou fournisseur de services.
										<br />
										<br />
										Grâce à Afroboost, vos abonnés deviennent de potentiels clients voire
										partenaires.
										<br />
										<br />
										Si ce concept te parle, si tu te sens l'âme d'un Afroboosteur,
										joins-toi à notre communauté ! Ta contribution commence dès
										maintenant. En partageant ce message, tu feras la différence. <br />
										<br />
										Ne brise pas la chaîne de la solidarité, parle du concept Afroboost
										autour de toi!
										<br />
										<br />
									</p>
								</div>
							</div>
						</div>
					)
				)}
			</>
		)
	}
}
