import "./Request.css";
import { useState } from "react";
import api from "../state/api";
import { Text, Input } from "@chakra-ui/react";

function Request() {
	const [content, setContent] = useState("");
	const [reward, setReward] = useState(0);
	const [deadline, setDeadline] = useState(0);

	const onSubmit = async (e) => {
		e.preventDefault();
		let receite = await api.submitRequest(content, reward, deadline);
		console.log(receite, "receite");
	};

	return (
		<div
			style={{
				margin: "30px 30px 30px 30px",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<div className="form-box" style={{ backgroundColor: "#e1eedd" }}>
				<form onSubmit={onSubmit}>
					<Text
						fontSize="xl"
						style={{
							margin: "20px 0px 0px 0px",
						}}
					>
						Content String:
					</Text>
					<Input
						style={{
							backgroundColor: "white",
							width: "400px",
						}}
						value={content}
						onChange={(e) => {
							setContent(e.target.value);
						}}
					/>
					<Text
						fontSize="xl"
						style={{
							margin: "20px 0px 0px 0px",
						}}
					>
						Reward:
					</Text>
					<Input
						style={{ backgroundColor: "white" }}
						type="number"
						value={reward}
						onChange={(e) => {
							setReward(e.target.value);
						}}
					></Input>
					<Text
						fontSize="xl"
						style={{
							margin: "20px 0px 0px 0px",
						}}
					>
						Deadline:
					</Text>
					<Input
						style={{ backgroundColor: "white" }}
						type="number"
						value={deadline}
						onChange={(e) => {
							setDeadline(e.target.value);
						}}
					></Input>

					<Text
						fontSize="xl"
						style={{
							margin: "20px 0px 0px 0px",
						}}
					>
						Submit:
					</Text>
					<Input type="submit" style={{ backgroundColor: "white" }}></Input>
				</form>
			</div>
		</div>
	);
}

export default Request;
