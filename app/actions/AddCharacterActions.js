import alt from '../alt';
import {ADD_CHARACTER_SUCCESS, ADD_CHARACTER_FAIL, UPDATE_NAME, UPDATE_GEMDER, INVALID_NAME, INVALIDGENDER} from '../constants/Constants';

class AddCharacterActions {
    constructor() {
        this.generateActions(
            ADD_CHARACTER_SUCCESS,
            ADD_CHARACTER_FAIL,
            UPDATE_NAME,
            UPDATE_GEMDER,
            INVALID_NAME,
            INVALIDGENDER
        );
    }

    // addCharacter(name, gender) {
    //     debugger
    //     $.ajax({
    //         type: 'post',
    //         url: '/api/characters',
    //         data: {
    //             name: name,
    //             gender: gender
    //         }
    //     }).done((data) => {
    //         debugger
    //         this.actions.addCharacterSuccess(data.message);
    //     }).fail((err) => {
    //         this.actions.addCharacterFail(err.responseText);
    //     })
    // }
    addCharacter(name, gender) {
    $.ajax({
      type: 'POST',
      url: '/api/characters',
      data: { name: name, gender: gender }
    })
      .done((data) => {
        this.actions.addCharacterSuccess(data.message);
      })
      .fail((jqXhr) => {
        this.actions.addCharacterFail(jqXhr.responseText);
      });
  }
}

export default alt.createActions(AddCharacterActions);
