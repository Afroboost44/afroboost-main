import React from 'react';
import "./Spectrum.css";

class Spectrum extends React.PureComponent {
    render() {
        return (
            <div id='bars'>
                <div className='bar'></div>
                <div className='bar'></div>
                <div className='bar'></div>
                <div className='bar'></div>
                <div className='bar'></div>
                <div className='bar'></div>
                <div className='bar'></div>
                <div className='bar'></div>
                <div className='bar'></div>
                <div className='bar'></div>
            </div>

        );
    }
}

export default Spectrum;