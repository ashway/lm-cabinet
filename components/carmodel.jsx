import Link from 'next/link'
import "../scss/style.scss";
import carsList from '../infolib/carmodels.js';
import carsListAdd from '../infolib/cars.js';
import Car from './car.jsx';

export default (props) => {
    let car = carsList[props.alias];
    if(car.isCar && car.type && car.index) car.photos = carsListAdd[car.type][car.index-1].photos;
    return (car)?(car.isCar)?<Car model={car.type} index={car.index} data={car}/>:<Link href={car.url}>
        <a className="auto-card">
            <div style={{ backgroundImage: `url(${car.image})` }}/>
            <div className="h3 bold">{car.mark || ''} {car.model || ''}</div>
            <div className="h4">от <span className="bold blue">{car.price}р</span> за час</div>
        </a>
    </Link>:null
}