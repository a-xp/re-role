import React from "react";
import {Message} from "semantic-ui-react";

export class FinishedGameHeader extends React.Component {

    render() {
        return <Message size='large' icon>
            <Message.Header>Game has ended</Message.Header>
        </Message>
    }

}