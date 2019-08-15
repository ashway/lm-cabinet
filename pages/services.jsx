import "../scss/style.scss"
import React from "react";
import Header from '../components/header';
import _ from 'lodash';
import cookies from 'next-cookies';

const apiHost = 'https://api.lux-motor.ru';
const axiosInstance  = require('../axiosInstance');

let serviceList = [
        {alias: 'premium', name:'Автомобили премиум класса'},
        {alias: 'minivan', name:'Минивэны'},
        {alias: 'retro', name:'Ретроавтомобили'},
        {alias: 'bus', name:'Автобусы'},
        {alias: 'cortege', name:'Кортежи'},
        {alias: 'wedding', name:'Автомобиль на свадьбу'},
        {alias: 'transfer', name:'Трансфер в аэропорт'},
        {alias: 'business', name:'Бизнес-поездки'},
        {alias: 'meeting', name:'Встреча из роддома'}
    ];

class ModelsPage extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            currentService: null
        };
    }

    static async getInitialProps (ctx) {
        const { authToken } = cookies(ctx);
        let axios = axiosInstance(authToken);
        let mark  = await axios.get(`${apiHost}/mark/list`);
        let model  = await axios.get(`${apiHost}/model/list`);
        let services  = await axios.get(`${apiHost}/services/list`);
        let servicesList = services.data;

        _.each(servicesList, s=>s.models = _.compact((s.models||'').split(',')));
        return { authToken, markList: _.keyBy(mark.data, 'alias'), servicesList: _.keyBy(servicesList, 'alias'), modelList: _.sortBy(_.remove(model.data, i=>!i.is_group), 'mark') };
    }

    componentDidMount() {
        this.setState({ servicesList: this.props.servicesList });
    }

    setService = (alias)=> {
        this.setState({ currentService: (this.state.currentService==alias)?null:alias });
    };

    setServiceCar = async (alias)=> {
        let axios = axiosInstance(this.props.authToken);
        let currentServiceAlias = this.state.currentService;
        let servicesList = this.state.servicesList;
        let currentService = servicesList[currentServiceAlias] || { alias: currentServiceAlias, models: []};
        currentService.models = _.xor(currentService.models, [alias]);
        servicesList[currentServiceAlias] = currentService;
        this.setState({servicesList});
        let action = _.includes(servicesList[currentServiceAlias].models, alias)?'add':'delete';
        await axios.get(`${apiHost}/services/${action}/${currentServiceAlias}/${alias}`);
    };

    render() {

        return (
            <div className="content">
                <Header page="services"/>

                <div className="form mb40">
                    <div className="list services">
                        <div className="flex-block fb-vcenter"><div>Услуги</div></div>
                        <div className="isActive">
                            {_.map(serviceList, i=><div key={i.alias} className={`${(i.alias==this.state.currentService)?'blue':''}`} onClick={()=>this.setService(i.alias)}><div>{i.name}</div><div/></div>)}
                        </div>
                    </div>

                    {(this.state.currentService)?
                            <div className="list blocks">
                                <div className="flex-block fb-vcenter"><div className="h1">{_.keyBy(serviceList, 'alias')[this.state.currentService].name}</div></div>
                                <div className="isActive">
                                    {_.map(this.props.modelList, i=><div className={(_.includes((this.state.servicesList[this.state.currentService] || {}).models, i.alias))?'blue':''} key={i.alias} onClick={()=>this.setServiceCar(i.alias)}>
                                        <div>{(this.props.markList[i.mark]||{}).name}</div>
                                        <div className="bold">{i.name}</div>
                                    </div>)}
                                </div>
                            </div>
                        :null}
                </div>
            </div>
        )
    }
}

export default ModelsPage;

