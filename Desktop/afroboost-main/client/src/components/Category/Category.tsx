//@ts-nocheck
import React from 'react'
import './Category.css'
import English from '../../english'
import France from '../../france'
import Germany from '../../germany'
import Spain from '../../spain'

const l = {
	en: English,
	fr: France,
	ge: Germany,
	sp: Spain,
}

interface IProps {
	category: string
	chosen: boolean
	onClick: any
}

class Category extends React.Component<IProps, {}> {
	constructor(props: IProps) {
		super(props)
	}

	render() {
		return (
			<a href='javascript:void(0)' onClick={this.props.onClick}>
				<div className={this.props.chosen ? 'ccategory' : 'category'}>
					<span className='category-name'>
						{l[localStorage.getItem('language')][this.props.category]}
					</span>
				</div>
			</a>
		)
	}
}

export default Category
