import React from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import './style.css'
import { BiCross } from "react-icons/bi";
const ScreenRecorder = () => {
	const {
		status,
		startRecording,
		stopRecording,
		mediaBlobUrl,
		clearBlobUrl
	} = useReactMediaRecorder({ screen: true });

	const handleDownload = () => {
		if (mediaBlobUrl) {
			const a = document.createElement("a");
			a.href = mediaBlobUrl;
			a.download = "recorded-video.mp4";
			a.click();
		}
	};

	const handleReset = () => {
		stopRecording(); // Stop the recording
		clearBlobUrl(); // Clear the mediaBlobUrl
	};

	return (
		<div>

			{!mediaBlobUrl ? (
				<div className="row_btn">
					<button onClick={startRecording} className="rec_btn">Commencer l'enregistrement</button>
					<div className="row_btn">
						{status === 'recording' && (
							<div className="row_btn">
								<p className="rec_status">{status}</p>
								<button onClick={stopRecording} className="rec_btn">

									Arrête d'enregistrer</button>
							</div>
						)}
					</div>
				</div>
			) : (
				<>
					<div className="row_btn">
						<button onClick={handleDownload} className="rec_btn">Télécharger</button>
						<button onClick={handleReset} className="rec_btn">Enregistrer à nouveau</button>
					</div>
				</>
			)}

			{/*
      <video src={mediaBlobUrl} controls autoPlay loop />
       */}
		</div>
	);
};

export default ScreenRecorder;
