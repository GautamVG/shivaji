import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import Company from './company'

@Entity()
class CompanyMarketData extends BaseEntity {
	@PrimaryColumn()
	timestamp: number

	@ManyToOne(() => Company, (company) => company.market_data)
	company: Company

	@Column()
	// last traded quantity
	ltq: number

	@Column()
	// last traded price
	ltp: number

	@Column()
	// volume
	vol: number

	@Column()
	// bid price
	bid: number

	@Column()
	// ask price
	ask: number

	@Column()
	// bid quantity
	bid_qty: number

	@Column()
	// ask quantity
	ask_qty: number

	@Column()
	// open interest
	oi: number

	@Column()
	// previous open interest
	prev_oi: number

	@Column()
	// previous close price
	prev_close_price: number
}

export default CompanyMarketData
