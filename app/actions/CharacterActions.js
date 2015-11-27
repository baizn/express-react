import alt from '../alt';
import {REPORT_SUCCESS, REPORT_FAIL, GET_CHARACTER_SUCCESS, GET_CHARACTER_FAIL} from '../constants/Constants';

class CharacterActions {
    constructor() {
        this.generateActions(
            REPORT_SUCCESS,
            REPORT_FAIL,
            GET_CHARACTER_SUCCESS,
            GET_CHARACTER_FAIL
        );
    }

    getCharacter(characterId) {
        $.ajax({
            url: '/api/characters/' + characterId
        }).done((data) => {
            debugger
            this.actions.getCharacterSuccess(data);
        }).fail((err) => {
            this.actions.getCharacterFail(err);
        });
    }

    report(characterId) {
        $.ajax({
            url: '/api/report',
            type: 'POST',
            data: {
                characterId: characterId
            }
        }).done(() => {
            this.actions.reportSuccess();
        }).fail((err) => {
            this.actions.reportFail();
        });
    }
}

export default alt.createActions(CharacterActions);
