import Popup from 'reactjs-popup'
import ReactSwipe from 'react-swipe';
import _ from 'lodash';
import "../scss/style.scss";
import carsCatalog from '../infolib/carmodels.js';
import React from "react";
import PreloadImage from 'react-preload-image'

class Car extends React.Component {

    state = { show: false };
    reactSwipeEl;

    toggleInfo = (isClosed) => {
        this.setState({ show: isClosed });
    };

    render() {
        let car = this.props.data;
        if(car.alias)  {
            car = carsCatalog[car.alias];
            car.photos = this.props.data.photos;
        }

        return (car) ? <div className="auto-card-fullinfo">
            <div onClick={()=>this.toggleInfo(true)} style={{ backgroundImage: `url(/static/img/cars/${this.props.model}/${this.props.index}/1.jpg)` }}>
                <img className="imgse" src={`/static/img/cars/${this.props.model}/${this.props.index}/1.jpg`}/>
                {(car.capacity)?<div className="ac-capacity">{car.capacity} {(car.capacity%100%10>0&&car.capacity%100%10<5)?(car.capacity%100%10===1)?'место':'места':'мест'}</div>:null}
            </div>
            {(car.mark || car.model)?<div className="h3 bold">{car.mark || ''} {car.model || ''}</div>:null}
            {(car.price || car.runprice)?<div className="flex-block pos-center">
                {(car.price && car.price>0)?<div className="h4"><span className="bold blue">{car.price}р</span> в час</div>:null}
                {(car.runprice && car.runprice>0)?<div><span className="bold blue">{car.runprice}р</span> за км</div>:null}
            </div>:null}

            <Popup open={this.state.show}
                modal
                lockScroll
                closeOnEscape
                closeOnDocumentClick
                onClose={()=>{ this.toggleInfo(false)}}
                contentStyle={{background: 'transparent', width: '100%', maxWidth: '600px', padding: 0, border: 'none'}}>
                <div className="car-popup" onClick={() => this.reactSwipeEl.next()}>
                    <ReactSwipe className="car-p-photos"
                        swipeOptions={{ continuous: true }}
                        ref={el => (this.reactSwipeEl = el)}>
                        {_.map([ ...Array(car.photos).keys() ], index=><div key={index}>
                            <img className="imgse" src={`/static/img/cars/${this.props.model}/${this.props.index}/${index+1}.jpg`} alt=""/>
                            <PreloadImage src={`/static/img/cars/${this.props.model}/${this.props.index}/${index+1}.jpg`} />
                            </div>)}
                    </ReactSwipe>
                    <div className="car-p-controls">
                        <div className="close" onClick={()=>this.toggleInfo(false)}/>
                        {(car.photos>1)?<div className="controls">
                            <div className="prev" onClick={(e) => { this.reactSwipeEl.prev(); e.stopPropagation(); }}/>
                            <div className="next" onClick={(e) => { this.reactSwipeEl.next(); e.stopPropagation(); }}/>
                        </div>:null}
                    </div>
                </div>
            </Popup>
        </div> : null
    }
}

export default Car;