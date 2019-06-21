import React from "react";
import {Enter} from "../Enter";
import {Room} from "../Room";
import {gameApi} from "../../api/game";
import {credApi} from "../../api/store";

export class App extends React.Component {

    state = {
        roomId: null,
        login: null,
        secret: null,
        ready: false
    };

    render() {
        const {roomId, login, secret} = this.state;

        return <React.Fragment>
                    {!roomId && <Enter onEnter={this.onEnter}/>}
                    {roomId && <Room roomId={roomId} login={login} secret={secret} onLeave={this.onLeave}/>}
            </React.Fragment>
    }

    onEnter = (cred) => {
        credApi.setCred(cred);
        this.setState({
            ...cred
        })
    };

    onLeave = () => {
        credApi.clearCred();
        window.location = '/';
    };

    componentDidMount(){
        this.tryLogin();
    }

    tryLogin = () => {
        const id = window.location.hash.slice(1);
        const cred = credApi.getCred();
        if(cred && (!id || cred.roomId === id)){
            gameApi.login(cred).then(() => {
                this.setState({
                    ...cred
                })
            })
        }
    }

}
