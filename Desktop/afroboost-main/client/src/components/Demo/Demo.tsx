//@ts-nocheck
import React, { Component } from 'react';
import "./Demo.css";
import ReactPlayer from "react-player";
// import IndigoPlayer from "indigo-player";
// import { ArrowForwardCircle } from "react-ionicons";
import { Link, Redirect } from "react-router-dom";
import { baseURL } from '../../api';
import {BsFillArrowRightCircleFill} from 'react-icons/bs'
interface IState {
    playing: boolean;
}
class Demo extends Component<{}, IState> {
    constructor() {
        super();
        this.state = {
            playing: true,
            afroboostPlayer: undefined,
            player:'',
        }

    }

    render() {
        if(localStorage.getItem("afroboostauth") !== "guest") {
            return <Redirect to="/home" />
        }
        return <div className="demo">

            {/* <div
            className="videodemo"
            style={{ backgroundColor: "black", marginBottom: 8, height: "auto",  }}
           
            ref={(ref) => {
                let config = {
                    sources: [
                        {
                            type: "mp4",
                            src:
                                'https://afroboost.com:3003/afroboostvideo'
                        },
                    ],
                    ui: {
                        enabled: true,
                    },
                    autoplay: true,
                }; 
                if (ref && !this.state.afroboostPlayer) {
                    this.state.player = IndigoPlayer.init(ref, config);
                   this.state.player.on(IndigoPlayer.Events.STATE_ENDED, () => {
                    this.state.player.seekTo(0);
                    this.state.player.play();
                    });
                    this.setState({ afroboostPlayer: ref });
                }
            }}
        >
      
        
        </div> */}
            <div style={{ display: "flex", justifyContent: "center", backgroundColor: "#141414" }}>
                <div style={{ width: "90%" }}>
                    <ReactPlayer volume={0}
                        className="videodemo" 
                        width="100%" 
                        height="auto" 
                        playing={true} 
                        loop={true}
                        style={{ backgroundColor: "#141414", marginLeft: -19 }} 
                        controls={true} 
                        
                        url={`${baseURL}/afroboostvideo`} />
                </div>
            </div>
            <div className="bottom__wrapper">
                <div className="skipWrap">
                    <Link to="/home" className="skipButton">SKIP
                    <div className="skip__icon">

                    <BsFillArrowRightCircleFill/>
                    </div>
                    </Link>
                    {/* <ArrowForwardCircle color="white" height={"32px"} width={"32px"} /> */}
                    
                </div>
            </div>
        </div>
    }
}

export default Demo;