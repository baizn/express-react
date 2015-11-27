import React, {Component} from 'react';
import {Link} from 'react-router';
import {isEqual} from 'underscore';
import CharacterListStore from '../stores/CharacterListStore';
import CharacterListActions from '../actions/CharacterListActions';

class CharacterList extends Component {
    constructor(props) {
        super(props);
        this.state = CharacterListStore.getState();
        this.onChange = this.onChange.bind(this);
    }

    componentDidMount() {
        CharacterListStore.listen(this.onChange);
        CharacterListActions.getCharacters(this.props.params);
    }

    componentWillUnMount() {
        CharacterListStore.unlisten(this.onChange);
    }

    componentDidUpdate(prevProps) {
        if(!isEqual(prevProps.params, this.props.params)) {
            CharacterListActions.getCharacters(this.props.params);
        }
    }

    onChange(state) {
        this.setState(state);
    }

    render() {
        let characterList = this.state.characters.map((character, index) => {
            return (
                <div key={character.characterId} className='list-group-item animated fadeIn'>
                    <div className='media'>
                        <span className='position pull-left'>{index + 1}</span>
                        <div className='pull-left thumb-lg'>
                            <Link to={'/characters' + character.characterId}>
                                <img className='media-object' src={'http://image.eveonline.com/Character/' + character.characterId + '_128.jpg'} />
                            </Link>
                        </div>
                        <div className='media-body'>
                            <h4 className='media-heading'>
                                <Link to={'/characters/' + character.characterId}>
                                    {character.name}
                                </Link>
                            </h4>
                            <small>Race:<strong>{character.race}</strong></small>
                            <br/>
                            <small>Bloodline:<strong>{character.bloodline}</strong></small>
                            <br/>
                            <small>Wins:<strong>{character.wins}</strong>Losses:<strong>{character.losses}</strong></small>
                            <br/>
                        </div>
                    </div>
                </div>
            );
        });

        return (
            <div className='container'>
                <div className='list-group'>
                    {characterList}
                </div>
            </div>
        );
    }
}

CharacterList.contextTypes = {
    router: React.PropTypes.func.isRequired
};

export default CharacterList;
