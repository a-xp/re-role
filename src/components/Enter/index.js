import React from "react";
import {Button, Form, Message, Tab} from "semantic-ui-react";
import {gameApi} from "../../api/game";
import * as ReactDOM from "react-dom";
import serialize from 'form-serialize';
import {TEAM} from "../../api/enum";


export class Enter extends React.Component {

    state = {
        joinErrMsg: [],
        createErrMsg: []
    };

    roomId = window.location.pathname.split('/')[1] || '';
    form = React.createRef();

    render (){
        return <Tab panes={[
            {menuItem: 'JOIN', render: this.joinPane},
            {menuItem: 'CREATE', render: this.createPane},
        ]}/>
    }

    joinPane = () => {
        const {joinErrMsg} = this.state;
        return <Tab.Pane>
            <Form ref={this.form}>
                {joinErrMsg && joinErrMsg.length>0 &&
                    <Message negative>
                        <Message.Header>Failed to join the game</Message.Header>
                        {joinErrMsg.map( m => <p>{m}</p>)}
                    </Message>
                }
                <Form.Field label='Game ID' control='input' name="id" defaultValue={this.roomId}/>
                <Form.Field label='Your name' control='input' name="login" type="text"/>
                <Form.Group grouped>
                    <label>Choose your side</label>
                    <Form.Field label='Resistance' control='input' type='radio' name='side' value={TEAM.GOOD}/>
                    <Form.Field label='Spies' control='input' type='radio' name='side' value={TEAM.BAD}/>
                    <Form.Field label='Whatever' control='input' type='radio' name='side' defaultChecked value={TEAM.RANDOM}/>
                </Form.Group>
                <Button primary fluid onClick={this.onJoin}>JOIN</Button>
            </Form>
        </Tab.Pane>
    };

    createPane = () => {
        const {createErrMsg} = this.state;
        return <Tab.Pane>
            <Form ref={this.form}>
                {createErrMsg && createErrMsg.length>0 &&
                <Message negative>
                    <Message.Header>Failed to join the game</Message.Header>
                    {createErrMsg.map( m => <p>{m}</p>)}
                </Message>
                }
                <Form.Group grouped>
                    <label>Choose a game</label>
                    <Form.Field label='Resistance Classic' control='input' type='radio' name='game' defaultChecked/>
                    <Form.Field label='Resistance Avalon' control='input' type='radio' name='game'/>
                </Form.Group>
                <Form.Field label='Your name' control='input' name='login'/>
                <Form.Group grouped>
                    <label>Choose your side</label>
                    <Form.Field label='Resistance' control='input' type='radio' value={TEAM.GOOD} name='side'/>
                    <Form.Field label='Spies' control='input' type='radio' value={TEAM.BAD} name='side'/>
                    <Form.Field label='Whatever' control='input' type='radio' name='side' value={TEAM.RANDOM} defaultChecked/>
                </Form.Group>
                <Button primary fluid onClick={this.onCreate}>CREATE</Button>
            </Form>
        </Tab.Pane>
    };

    onJoin = () => {
        const {onEnter} = this.props;
        const value = serialize(ReactDOM.findDOMNode(this.form.current), {hash: true});
        console.log(value);
        if(value.login && value.id && value.side){
            gameApi.join(value.id, value.login, value.side).then(cred => {
                onEnter && onEnter(cred);
            }, err => {
                this.setState({
                    joinErrMsg: [err.msg || err.message || err || 'Unknown error']
                })
            })
        }
    };

    onCreate = () => {
        const value = serialize(ReactDOM.findDOMNode(this.form.current), {hash: true});
        const {onEnter} = this.props;
        if(value.side && value.login && value.game){
            gameApi.create(value.game, value.login, value.side).then(cred => {
                onEnter && onEnter(cred)
            }, err => {
                this.setState({
                    createErrMsg: [err.msg || err.message || err || 'Unknown error']
                })
            });
        }
    };

}