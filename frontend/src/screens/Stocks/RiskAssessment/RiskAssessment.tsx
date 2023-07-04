import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	ToggleButton,
	ToggleButtonGroup,
} from "@mui/material";
import { useState } from "react";

type RiskLevels = "high" | "hedge" | "low";

interface OptionDisplay {
	id: string;
	strike: number;
	ltp: number;

	type: "cal" | "put";
}

type Props = {
	spot_price: number;
	strike_price: number;
	type: "cal" | "put";
	puts: OptionDisplay[];
	calls: OptionDisplay[];
};

const RiskAssessment = (props: Props) => {
	const [risk, setRisk] = useState("hedge");
	const [calculatedOption, setCalculatedOption] =
		useState<OptionDisplay | null>(null);

	const handleChange = (
		_event: React.MouseEvent<HTMLElement>,
		newAlignment: RiskLevels
	) => {
		setRisk(newAlignment);
		console.log(newAlignment);
		const opt = getRiskOptions(newAlignment);
		if (opt) setCalculatedOption(opt);
	};

	function getRiskOptions(risk: RiskLevels) {
		const { spot_price, strike_price, type, puts, calls } = props;

		let direction: "up" | "down";
		if (type == "cal") direction = "down";
		if (type == "put") direction = "up";
		console.log(direction!);

		let gap = Math.abs(spot_price - strike_price);
		console.log("Gap: ", gap);

		if (risk == "low") gap *= 2 / 3;
		else if (risk == "high") gap *= 1 / 3;
		console.log("Adjusted gap: ", gap);

		let target = spot_price + (direction! == "down" ? gap : -gap);
		console.log("Target: ", target);

		puts.sort((a, b) => a.ltp - b.ltp);
		calls.sort((a, b) => a.ltp - b.ltp);

		console.log(puts);
		console.log(calls);

		let option: OptionDisplay;
		if (type == "cal") {
			for (let i = 0; i < puts.length; i++) {
				if (puts[i].strike >= target) {
					option = puts[i];
					break;
				}
			}
		} else {
			for (let i = 0; i < calls.length; i++) {
				if (calls[i].strike > target) {
					option = calls[i - 1];
					break;
				}
			}
		}

		console.log(option!);
		return option!;
	}

	return (
		<Box>
			<ToggleButtonGroup
				color="primary"
				value={risk}
				exclusive
				onChange={handleChange}
			>
				<ToggleButton value="low">Low Risk</ToggleButton>
				<ToggleButton value="hedge">Hedge</ToggleButton>
				<ToggleButton value="high">High Risk</ToggleButton>
			</ToggleButtonGroup>

			<TableContainer
				sx={{
					border: "1px solid #ccc",
					borderRadius: "4px",
					overflow: "hidden",
					width: "90%",
					marginTop: "1rem",
				}}
			>
				<Table>
					<TableHead></TableHead>
					<TableBody>
						{calculatedOption && (
							<TableRow>
								<TableCell
									sx={{ borderBottom: "1px solid #ccc" }}
								>
									{calculatedOption.id}
								</TableCell>
								<TableCell
									sx={{ borderBottom: "1px solid #ccc" }}
								>
									{calculatedOption.type == "put"
										? "PUT"
										: "CALL"}
								</TableCell>
								<TableCell
									sx={{
										borderBottom: "1px solid #ccc",
										textAlign: "end",
									}}
								>
									₹ {calculatedOption.ltp / 100}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
};

export default RiskAssessment;
