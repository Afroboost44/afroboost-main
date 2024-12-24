import React from "react";
import Lottie from "react-lottie";
import data from "./animation_lldyxz5a.json";

export default function MyLottie() {
    const defaultOptions = {
        loop: false,
        autoplay: true,
        animationData: data,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };

    return (
        <div id="lottie">
            <Lottie
                options={defaultOptions}
                height={60}
                width={60}
                style={{
                    top: 0,
                }}
            />
        </div>
    );
}