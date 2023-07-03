//@ts-nocheck
import '../types'

export function calculateImpliedVolatility(underlyingValue, optionPrice, strikePrice, riskFreeRate, optionType, expiryDate) {
    // Precison to imply the accuracy of volatilty
    const precision = 0.001;
	// max itreations number of max tries to optimize. (generally optimizes on 12-15 itrations)
    const maxIterations = 100;
    const currentDate = new Date();

    // Calculate the expiry time difference in years to denote IV. 
    const expiryTime = (expiryDate - currentDate + 55800000) / (252 * 24 * 60 * 60 * 128);
    let volatility = 0.5; // Initial guess for implied volatility

    // Define the option pricing function based on the option type (call or put)
    function optionPricingFunction(volatility) {
        const d1 = (Math.log(underlyingValue / strikePrice) + (riskFreeRate + 0.5 * volatility * volatility) * expiryTime) / (volatility * Math.sqrt(expiryTime));
        const d2 = d1 - volatility * Math.sqrt(expiryTime);

        if (optionType === "call") {
            return underlyingValue * Math.exp(-riskFreeRate * expiryTime) * normalCDF(d1) - strikePrice * Math.exp(-riskFreeRate * expiryTime) * normalCDF(d2) - optionPrice;
        } else if (optionType === "put") {
            return strikePrice * Math.exp(-riskFreeRate * expiryTime) * normalCDF(-d2) - underlyingValue * Math.exp(-riskFreeRate * expiryTime) * normalCDF(-d1) - optionPrice;
        }
    }

    // (CDF) for a standard normal distribution
    function normalCDF(x) {
        return (1 + erf(x / Math.sqrt(2))) / 2;
    }

    // Define the error function (erf) for newton raphson methods CDF. 
    function erf(x) {
        const a1 = 0.254829592;
        const a2 = -0.284496736;
        const a3 = 1.421413741;
        const a4 = -1.453152027;
        const a5 = 1.061405429;
        const p = 0.3275911;

        const sign = (x >= 0) ? 1 : -1;
        const absX = Math.abs(x);

        const t = 1.0 / (1.0 + p * absX);
        const y = ((((a5 * t + a4) * t) + a3) * t + a2) * t + a1;

        return sign * (1 - y * Math.exp(-absX * absX));
    }

    // Perform the Newton-Raphson iteration to find implied volatility
    let i = 0;
    let optionValue = optionPricingFunction(volatility);
    let vega = 0;

    while (Math.abs(optionValue - optionPrice) > precision && i < maxIterations) {
        const d1 = (Math.log(underlyingValue / strikePrice) + (riskFreeRate + 0.5 * volatility * volatility) * expiryTime) / (volatility * Math.sqrt(expiryTime));
        vega = underlyingValue * Math.exp(-riskFreeRate * expiryTime) * Math.sqrt(expiryTime) * normalCDF(d1);

        volatility = volatility - (optionValue - optionPrice) / vega;
        optionValue = optionPricingFunction(volatility);

        i++;
    }

    const d1 = (Math.log(underlyingValue / strikePrice) + (riskFreeRate + 0.5 * volatility * volatility) * expiryTime) / (volatility * Math.sqrt(expiryTime));
    const d2 = d1 - volatility * Math.sqrt(expiryTime);
    const delta = (optionType === "call") ? normalCDF(d1) : -normalCDF(-d1);
    const gamma = normalCDF(d1) / (underlyingValue * volatility * Math.sqrt(expiryTime));
    const theta = -(underlyingValue * volatility * normalCDF(d1)) / (365 * 2 * Math.sqrt(expiryTime)) - riskFreeRate * strikePrice * Math.exp(-riskFreeRate * expiryTime) * normalCDF(d2) / 252;
    vega = underlyingValue * Math.sqrt(expiryTime) * normalCDF(d1) / 365;

    return {
        iv: volatility,
        delta,
        gamma,
        theta,
        vega,
    };
}

function extractOptionData(stock: Stock): {
	optionType: string
	spotPrice: number
	strikePrice: number
	riskFreeRate: number
	timeToExpiry: number
	marketPrice: number
} {
	const option = stock.options[0]

	const optionType = option.type === 'cal' ? 'call' : 'put'
	const spotPrice = option.data[0].ltp
	const strikePrice = option.strike || 0
	const riskFreeRate = 0
	const timeToExpiry = (option.expiry_date - Date.now()) / (1000 * 60 * 60 * 24)
	const marketPrice = option.data[0].ltp

	return {
		optionType,
		spotPrice,
		strikePrice,
		riskFreeRate,
		timeToExpiry,
		marketPrice
	}
}
