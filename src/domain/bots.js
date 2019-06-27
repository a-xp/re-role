import Sentencer from 'sentencer';
import {TEAM, VOTE} from "../api/enum";
import {participantsCount} from "./missions";

function vote(mebers, votes, resolution = VOTE.YES) {
    const result = {...votes};
    mebers.forEach( (m,i) => {
        if(m.bot){
            result[i] = resolution
        }
    });
    return result;
}

function createBot() {
    const login = Sentencer.make('{{adjective}} {{noun}}');
    return {
        login: login[0].toUpperCase()+login.slice(1),
        prefSide: TEAM.RANDOM,
        bot: true
    }
}

function doMission(members, votes) {

}

function proposeTeam(members, leader, missionNumber) {
    const participants = [];
    for(let i = 0;i<participantsCount[members.length][missionNumber];i++){
        let playerNum = leader + i;
        if(playerNum>=members.length){
            playerNum-=members.length;
        }
        participants.push(playerNum);
    }
    return participants;
}

export const bots = {vote, createBot, doMission, proposeTeam};