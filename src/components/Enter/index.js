import React from "react";
import {Button, Form, Message, Tab} from "semantic-ui-react";
import {gameApi} from "../../api/game";


export class Enter extends React.Component {

    state = {
        joinErrMsg: [],
        createErrMsg: []
    };

    render (){
        return <Tab panes={[
            {menuItem: 'JOIN', render: this.joinPane},
            {menuItem: 'CREATE', render: this.createPane},
        ]}/>
    }

    joinPane = () => {
        const {joinErrMsg} = this.state;
        return <Tab.Pane>
            <Form>
                {joinErrMsg && joinErrMsg.length>0 &&
                    <Message negative>
                        <Message.Header>Failed to join the game</Message.Header>
                        {joinErrMsg.map( m => <p>{m}</p>)}
                    </Message>
                }
                <Form.Field label='Game ID' control='input' name="id"/>
                <Form.Field label='Your name' control='input' name="login"/>
                <Form.Group grouped>
                    <label>Choose your side</label>
                    <Form.Field label='Resistance' control='input' type='radio' name='side'/>
                    <Form.Field label='Spies' control='input' type='radio' name='side'/>
                    <Form.Field label='Whatever' control='input' type='radio' name='side'/>
                </Form.Group>
                <Button primary fluid onClick={this.onJoin}>JOIN</Button>
            </Form>
        </Tab.Pane>
    };

    createPane = () => {
        const {createErrMsg} = this.state;
        return <Tab.Pane>
            <Form>
                {createErrMsg && createErrMsg.length>0 &&
                <Message negative>
                    <Message.Header>Failed to join the game</Message.Header>
                    {createErrMsg.map( m => <p>{m}</p>)}
                </Message>
                }
                <Form.Group grouped>
                    <label>Choose a game</label>
                    <Form.Field label='Resistance Classic' control='input' type='radio' name='game'/>
                    <Form.Field label='Resistance Avalon' control='input' type='radio' name='game'/>
                </Form.Group>
                <Form.Field label='Your name' control='input' />
                <Form.Group grouped>
                    <label>Choose your side</label>
                    <Form.Field label='Resistance' control='input' type='radio' name='side'/>
                    <Form.Field label='Spies' control='input' type='radio' name='side'/>
                    <Form.Field label='Whatever' control='input' type='radio' name='side'/>
                </Form.Group>
                <Button primary fluid onClick={this.onCreate}>CREATE</Button>
            </Form>
        </Tab.Pane>
    };

    onJoin = () => {
        console.log('join')
    };

    onCreate = () => {
        const {onEnter} = this.props;
        gameApi.create('CLASSIC', 'USER1', 'BAD').then(id => {
            onEnter && onEnter(id, 'USER1')
        }, err => {
            this.setState({
                createErrMsg: [err.msg || err.message || 'Unknown error']
            })
        });
    };
}