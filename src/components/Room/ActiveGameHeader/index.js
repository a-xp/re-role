import React from "react";
import {TEAM} from "../../../api/enum";
import {Image, Message} from "semantic-ui-react";
import {roleTraits} from "../../../domain/roles";

export class ActiveGameHeader extends React.Component {

    render() {
        const {role} = this.props;
        return <Message size='large' icon>
            <Image circular size='small' src={roleTraits[role].icon}/>
            <Message.Content>
                <Message.Header>Game is in progress</Message.Header>
                <p>You are {roleTraits[role].title}</p>
                <p>{teamText[roleTraits[role].side]}</p>
            </Message.Content>
        </Message>
    }

}


const teamText = {
    [TEAM.BAD]: "Infiltrate the Resistance and thwart their missions!",
    [TEAM.GOOD]: "Successfully perform mission to overthrow these powerful unjust rulers!"
};