import React from "react";
import {Container, Form, Header} from "semantic-ui-react";
import {Enter} from "../Enter";
import {Room} from "../Room";

export class App extends React.Component {

    state = {
        roomId: null,
        login: null,
        ready: false
    };

    render() {
        const {roomId, login} = this.state;

        return <React.Fragment>
                <Header as="h2" className="center aligned">Random role assigner</Header>
                <Container>
                    {!roomId && <Enter onEnter={this.onEnter}/>}
                    {roomId && <Room roomId={roomId} login={login}/>}
                </Container>
            </React.Fragment>
    }

    onEnter = (roomId, login) => {
        this.setState({
            roomId, login
        })
    }

}