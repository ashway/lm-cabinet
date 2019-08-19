import "../scss/style.scss"
import React from "react";
import Header from '../components/header';
import _ from 'lodash';
import cookies from 'next-cookies';

const apiHost = 'https://api.lux-motor.ru';
const axiosInstance  = require('../axiosInstance');

let classSelect = [
    { alias: 'premium', name: 'Премиум-класс'},
    { alias: 'business', name: 'Бизнес-класс'},
    { alias: 'minivan', name: 'Минивэны'},
    { alias: 'microbus', name: 'Микроавтобусы'},
    { alias: 'suv', name: 'Внедорожники'},
    { alias: 'bus', name: 'Автобусы' },
    { alias: 'retro', name: 'Ретроавтомобили' },
    { alias: 'limousine', name: 'Лимузины' },
];

let classSelectObj = _.keyBy(classSelect, 'alias');

class ModelsPage extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            showAddMarkForm: false,
            showAddModelForm: false,
            classSelect: {
                state: false,
                value: ''
            },
            markSelect: {
                state: false,
                value: ''
            },

            //-- Form
            currentEditModelAlias: null,
            currentModelCarCount: null,
            isGroupCheckbox: false,
            selectedMark: [],
            markAlias: '',
            markName: '',
            price: '',
            outcity_price: '',
            mintime: '',
            seats: '',
            modelAlias: '',
            modelName: '',
            carMark: props.markList,
            carModel: props.modelList
        };
    }

    static async getInitialProps (ctx) {
        const { authToken } = cookies(ctx);
        let axios = axiosInstance(authToken);
        let mark  = await axios.get(`${apiHost}/mark/list`);
        let model  = await axios.get(`${apiHost}/model/list`);
        let modelList =model.data;
        _.each(modelList, m=>m.is_group=(m.is_group)?1:0);
        modelList =  _.orderBy(modelList, ['is_group', 'mark'], ['asc', 'asc']);
        return { authToken, markList: _.sortBy(mark.data, 'name'), modelList };
    }

    getMarkList = async ()=> {
        let axios = axiosInstance(this.props.authToken);
        let mark  = await axios.get(`${apiHost}/mark/list`);
        return _.sortBy(mark.data, 'name');
    };

    getModelList = async() => {
        let axios = axiosInstance(this.props.authToken);
        let model  = await axios.get(`${apiHost}/model/list`);
        let modelList =model.data;
        _.each(modelList, m=>m.is_group=(m.is_group)?1:0);
        return _.orderBy(modelList, ['is_group', 'mark'], ['asc', 'asc']);
    };

    stateSelectField = (field, state)=> {
        let selectField = this.state[field];
        selectField.state = (state=='toggle')?!selectField.state:state;
        let newState = {};
        newState[field] = selectField;
        this.setState( newState );
    };

    selectFieldSetCurrent = (field, value)=> {
        let selectField = this.state[field];
        selectField.value = value;
        selectField.state = false;
        let newState = {};
        newState[field] = selectField;
        this.setState( newState );
    };

    toggleShowForm = (form)=> {
        if(form=='showAddModelForm' && this.state.currentEditModelAlias) {
            this.resetModelForm();
        } else {
            let newState = {};
            newState[form] = !this.state[form];
            this.setState(newState);
        }
    };

    deleteMark = async (alias) => {
        let axios = axiosInstance(this.props.authToken);
        await axios.get(`${apiHost}/mark/delete/${alias}`);
        let markList = await this.getMarkList();
        this.setState({ carMark: markList });
    };

    deleteModel = async (alias) => {
        let axios = axiosInstance(this.props.authToken);
        await axios.get(`${apiHost}/model/delete/${alias}`);
        let modelList = await this.getModelList();
        this.setState({ carModel: modelList });
    };

    addMark = async () => {
        let axios = axiosInstance(this.props.authToken);
        await axios.post(`${apiHost}/mark/add`, { alias: this.state.markAlias, name: this.state.markName });
        let markList = await this.getMarkList();
        this.setState({ carMark: markList, markAlias: '', markName: '', showAddMarkForm: false });
    };

    resetModelForm = () => {
        this.setState({
            isGroupCheckbox: false,
            modelName: '',
            modelAlias: '',
            price: '',
            outcity_price: '',
            mintime: '',
            seats: '',
            markSelect: {
                state: false,
                value: ''
            },

            classSelect: {
                state: false,
                value: ''
            }});
    };

    resetMarkForm = () => {
        this.setState({
            markAlias: '',
            markName: '',
        });
    };

    addModel = async () => {
        let axios = axiosInstance(this.props.authToken);
        let newModel = {
            alias: this.state.isGroupCheckbox?this.state.classSelect.value:(this.state.modelAlias || ''),
            name: this.state.modelName || '',
            mark: this.state.markSelect.value || '',
            class: this.state.classSelect.value || '',
            price: this.state.price || '',
            outcity_price: this.state.outcity_price || '',
            is_group: (this.state.isGroupCheckbox)?1:0,
            mintime: this.state.mintime || '',
            seats: this.state.seats || '',
        };
        if(this.state.currentEditModelAlias) {
            await axios.post(`${apiHost}/model/update/${this.state.currentEditModelAlias}`, newModel);
        } else {
            await axios.post(`${apiHost}/model/add`, newModel);
        }
        let modelList =  await this.getModelList();
        this.setState({ carModel: modelList, currentEditModelAlias: null, currentModelCarCount: null, showAddModelForm: false }, ()=>this.resetModelForm());

    };

    handleFormField = (e, field) => {
        let newState = {};
        newState[field] = e.target.value;
        this.setState(newState);
    };

    toggleSelectedMark = (mark)=> {
        let selectedMark = this.state.selectedMark;
        selectedMark = _.xor(selectedMark, [mark]);
        this.setState({selectedMark: selectedMark});
    };

    editModel = async (model) => {
        this.setState({
            currentEditModelAlias: model.alias,
            currentModelCarCount: model.carCount,
            isGroupCheckbox: !!model.is_group,
            modelName: model.name,
            modelAlias: model.alias,
            markSelect: {
                state: false,
                value: model.mark
            },
            classSelect: {
                state: false,
                value: model.class
            },
            price: model.price || '',
            outcity_price: model.outcity_price || '',
            mintime: model.mintime || '',
            seats: model.seats || '',
            showAddModelForm: true
        });
    };

    closeForm = (form) => {
        switch(form) {
            case 'showAddModelForm':
                this.setState({ currentEditModelAlias: null, currentModelCarCount: null, showAddModelForm: false  }, ()=>this.resetModelForm());
            break;

            case 'showAddMarkForm':
                this.setState({ showAddMarkForm: false  }, ()=>this.resetMarkForm());
            break;
        }
    };

    toggleCheckbox = (field) => {
        let state = {};
        state[field] = !this.state[field];
        this.setState(state);
    };

    render() {

        let markSelectObj = _.keyBy(this.state.carMark, 'alias');
        let currentClass = _.keyBy(classSelect, 'alias')[this.state.classSelect.value]||{};

        return (
            <div className="content">
                <Header page="models"/>

                <div className="form mb40">
                    <div className="list mark">
                        <div className="flex-block fb-vcenter"><div>Марка</div><div className="button" onClick={()=>this.toggleShowForm('showAddMarkForm')}>+</div></div>

                        {(this.state.showAddMarkForm)?<div className="simple-form">
                            <div><input className="text-field full" placeholder="Псевдоним" onChange={(e)=>this.handleFormField(e, 'markAlias')} value={this.state.markAlias}/></div>
                            <div><input className="text-field full" placeholder="Марка" onChange={(e)=>this.handleFormField(e, 'markName')} value={this.state.markName}/></div>
                            <div className="flex-block pos-right">
                                <div className="button" onClick={()=>this.addMark()}>Добавить</div>
                                <div className="button gray" onClick={()=>this.closeForm('showAddMarkForm')}>Закрыть</div>
                            </div>
                        </div>:null}
                        <div>
                            {_.map(this.state.carMark, i=><div key={i.alias}><div>{i.name}</div><div>{(_.filter(this.state.carModel, b=>b.mark===i.alias).length>0)?null:<span className="delete" onClick={()=>this.deleteMark(i.alias)}>D</span>}<span className={`icomoon ${(_.includes(this.state.selectedMark, i.alias))?'filtred':''}`} onClick={()=>this.toggleSelectedMark(i.alias)}>&#xea5b;</span></div></div>)}
                        </div>
                    </div>

                    <div className="list model">
                        <div className="flex-block fb-vcenter"><div>Модель (Группа)</div><div className="button" onClick={()=>this.toggleShowForm('showAddModelForm')}>+</div></div>

                        {(this.state.showAddModelForm)?<div className="simple-form">

                            <div>
                                <div>Класс</div>
                                <div className={`form-select ${(this.state.classSelect.state)?'opened':''}`}>
                                    <div onClick={(e)=>{ e.stopPropagation(); this.stateSelectField('classSelect', 'toggle');}}>{currentClass.name||'Выберите класс'}</div>
                                    <div>
                                        {_.map(classSelect, i=><div key={i.alias} onClick={()=>this.selectFieldSetCurrent('classSelect', i.alias)}>{i.name}</div>)}
                                    </div>
                                </div>
                            </div>

                            {(this.state.classSelect.value)?
                            <div>
                                <div/><div className={`checkbox ${(this.state.isGroupCheckbox)?'checked':''}`} onClick={()=>this.toggleCheckbox('isGroupCheckbox')}>Это группа</div>
                            </div>:null}

                            {(!this.state.isGroupCheckbox)?<div>
                                <div>Марка</div>
                                <div className={`form-select ${(this.state.markSelect.state)?'opened':''}`}>
                                    <div onClick={(e)=>{ e.stopPropagation(); this.stateSelectField('markSelect', 'toggle')}}>{(markSelectObj[this.state.markSelect.value]||{}).name || 'Выберите марку'}</div>
                                    <div>
                                        {_.map((this.state.selectedMark.length>0)?_.filter(this.state.carMark, i=>_.includes(this.state.selectedMark, i.alias)):this.state.carMark, i=><div key={i.alias} onClick={()=>this.selectFieldSetCurrent('markSelect', i.alias)}>{i.name}</div>)}
                                    </div>
                                </div>
                            </div>:null}

                            {(!this.state.isGroupCheckbox)?<div>
                                <div>Псевдоним</div>
                                <div><input className={`text-field full ${(this.state.currentModelCarCount>0)?'disabled':''}`} onChange={(e)=>this.handleFormField(e, 'modelAlias')} value={this.state.modelAlias}/></div>
                            </div>:null}

                            {(!this.state.isGroupCheckbox)?<div>
                                <div>Название</div>
                                <div><input className="text-field full" onChange={(e)=>this.handleFormField(e, 'modelName')} value={this.state.modelName}/></div>
                            </div>:null}

                            <div>
                                <div>Базовая цена</div>
                                <div className="flex-block fb-vcenter"><span className="w100"><input className="text-field full" onChange={(e)=>this.handleFormField(e, 'price')} value={this.state.price}/></span><span className="nowrap"> руб/ч</span></div>
                            </div>

                            <div>
                                <div>Базовая цена за городом</div>
                                <div className="flex-block fb-vcenter"><span className="w100"><input className="text-field full" onChange={(e)=>this.handleFormField(e, 'outcity_price')} value={this.state.outcity_price}/></span><span className="nowrap"> руб/км</span></div>
                            </div>

                            <div>
                                <div>Минимальное время заказа</div>
                                <div className="flex-block fb-vcenter"><span className="w100"><input className="text-field full" onChange={(e)=>this.handleFormField(e, 'mintime')} value={this.state.mintime}/></span><span className="nowrap"> час</span></div>
                            </div>

                            <div>
                                <div>Кол-во мест</div>
                                <div className="flex-block fb-vcenter"><span className="w100"><input className="text-field full" onChange={(e)=>this.handleFormField(e, 'seats')} value={this.state.seats}/></span></div>
                            </div>

                            <div className="flex-block pos-right">
                                <div className="button" onClick={()=>this.addModel()}>{(this.state.currentEditModelAlias)?'Сохранить':'Добавить'}</div>
                                <div className="button gray" onClick={()=>this.closeForm('showAddModelForm')}>Закрыть</div>
                            </div>
                        </div>:null}

                        <div className="isActive">
                            {_.map((this.state.selectedMark.length>0)?_.filter(this.state.carModel, i=>_.includes(this.state.selectedMark, i.mark)):this.state.carModel, i=>{
                                return <div className={`${i.is_group?'group':''}`} key={i.alias} onClick={()=>{ this.editModel(i) }}>
                                    {(!i.is_group)?<div>{`${(markSelectObj[i.mark]||{}).name} ${i.name}`}</div>:null}
                                    <div>{(classSelectObj[i.class]||{}).name}</div>
                                    {(i.is_group)?<div/>:null}
                                    <div>{`${i.price} руб`}</div>
                                    <div>{`${i.outcity_price} руб/ч`}</div>
                                    <div>{`${i.mintime} час`}</div>
                                    <div><span className="delete icomoon" onClick={(e)=>{ e.stopPropagation(); this.deleteModel(i.alias)} }>&#xe9ac;</span></div>
                                </div>
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ModelsPage;

