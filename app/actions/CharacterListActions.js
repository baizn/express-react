import alt from '../alt';
import {GET_CHARACTERS_LIST_SUCCESS, GET_CHARACTERS_LIST_FAIL} from '../constants/Constants';

class CharacterListActions {
    constructor() {
        this.generateActions(
            GET_CHARACTERS_LIST_SUCCESS,
            GET_CHARACTERS_LIST_FAIL
        );
    }

    getCharacters(payload) {
        let url = '/api/characters/top';
        let params = {
            race: payload.race,
            bloodline: payload.bloodline
        };

        if(payload.category === 'female') {
            params.gender = 'femal';
        } else if(payload.category === 'male') {
            params.gender = 'male';
        }

        if(payload.category) {
            url = '/api/characters/shame';
        }

        $.ajax({
            url: url,
            data: params
        }).done((data) => {
            this.actions.getCharactersSuccess(data);
        }).fail((err) => {
            this.actions.getCharactersFail(err);
        });
    }
}

export default alt.createActions(CharacterListActions);
