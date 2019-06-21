import React from "react";
import {Message} from "semantic-ui-react";

export class NewGameHeader extends React.Component {

    render(){
        const {roomId} = this.props;
        return <Message size='large'>
            <Message.Content>
                <p>Waiting for other players to join</p>
                <p><a className="roomLink" href={`/resistance/${roomId}`}>ROOM LINK</a></p>
            </Message.Content>
        </Message>
    }

}