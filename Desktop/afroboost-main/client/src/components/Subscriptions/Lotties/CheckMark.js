import React from "react";
import Lottie from "react-lottie";
import data from "./animation_lloq99yo.json";
export default function CheckMark() {
    const defaultOptions = {
        loop: false,
        autoplay: true,
        animationData: data,

        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };

    return (
        <div id="lottie" className="lottie-container">
            <Lottie
                options={defaultOptions}
                height={45}
                width={45}
                style={{
                    top: 0,
                    right: 0


                }}
            />
        </div>
    );
}