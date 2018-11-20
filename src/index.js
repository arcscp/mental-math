import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './global.js';

function Problem(props) {
	return (
		<div className='problem'>{props.state.numberA + ' + ' + props.state.numberB}</div>
	);
}

function InputContainer(props) {
	return (
		<div className='input-container'>
			<input className='input' type='text' disabled={props.state} onKeyPress={props.handleKeyPress} />
		</div>
	);
}

class Meter extends React.Component {
	getStyle() {
		const meterStyle = {
			marginTop:(global.maxHeight-(this.props.value*global.displayPerPx)), 
			height:(this.props.value*global.displayPerPx)
		};
		return meterStyle;
	}
	render() {
		return (
			<div className='meter'>
				<div className={'meter-fill meter-'+ this.props.type} style={this.getStyle()}></div>
			</div>
		);
	}
}

function MeterContainer(props) {
	return (
		<div className='meter-container'>
			<Meter value={props.meters.correct} type={'correct'} />
			<Meter value={props.meters.incorrect} type={'incorrect'}  />
			<Meter value={props.meters.timer} type={'timer'}  />
		</div>
	);
}

class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			meters: {
				correct: 0,
				incorrect: 0,
				timer: 100
			},
			numbers: {
				numberA: this.getRandom(),
				numberB: this.getRandom()
			},
			disabled: false,
			speed: global.speed.initial,
			level: 1,
			recordLevel: 1,
			background: (global.backgrounds[0]),
			status: 'active',
			loseMessage: ''
		};
		this.playAgain = this.playAgain.bind(this);
	}

	playAgain(){
		this.setState((state) => ({
			meters: {
				correct: 0,
				incorrect: 0,
				timer: 100
			},
			numbers: {
				numberA: this.getRandom(),
				numberB: this.getRandom()
			},
			disabled: false,
			speed: global.speed.initial,
			level: 1,
			background: (global.backgrounds[0]),
			status: 'active',
			loseMessage: ''
		}));
		this.setTimer(global.speed.initial);
		this.setBackgroundColor(global.backgrounds[0]);
	}

	componentDidMount() {
		this.setTimer(this.state.speed);
	}

	clearTimer() {
		clearInterval(this.timerHandle);
	}

	setTimer(speed) {
		this.clearTimer();
		this.timerHandle = setInterval(() => this.tick(), speed);
	}

	increaseSpeed() {
		let speed = this.state.speed - global.speed.change;
		this.setTimer(speed);
		this.setState((state) => ({
			speed: speed
		}));
	}

	lose(message) {
		this.setState({disabled: true});
		this.clearTimer();
		this.setBackgroundColor(global.backgrounds.gameOver);
		this.setState((state) => ({
			status:'lost',
			loseMessage: message
		}));
	}

	setBackgroundColor(color) {
		document.body.style = 'background-color: ' + color;
	}

	loadNextLevel() {
		let recordLevel = this.state.level === this.state.recordLevel ? this.state.recordLevel+1 : this.state.recordLevel;
		this.setState((state) => ({
			meters:{
				correct: 0,
				incorrect: 0,
				timer: 100
			},
			level: (state.level+1),
			recordLevel: recordLevel,
			background: (global.backgrounds.levels[state.level])
		}));
		this.increaseSpeed();
		this.setBackgroundColor(global.backgrounds.levels[this.state.level]);
	}

	tick() {
		if(this.state.meters.timer > 0){
			this.setState({
				meters:{
					correct: (this.state.meters.correct),
					incorrect: (this.state.meters.incorrect),
					timer: (this.state.meters.timer - 1)
				}
			});
		} else {
			this.lose(global.lose.timer);
		}
	}

	getRandom() {
		return Math.floor(Math.random() * 10);
	}

	generateNumbers() {
		this.setState({
			numbers: {numberA: this.getRandom(), numberB: this.getRandom()}
		});
	}

	checkAnswer(numberA, numberB, answer) {
		let correct = this.state.meters.correct;
		let incorrect = this.state.meters.incorrect;
		let timer = this.state.meters.timer;
		let loadNextLevel = false;
		let wonGame = false;

		if ((numberA + numberB) === parseInt(answer)) {
			correct = (this.state.meters.correct + global.meters.increments.correct > 100) ? 100 : (this.state.meters.correct+global.meters.increments.correct);
			timer = (correct >= 100) ? 100 : timer;
			if(correct >= 100) {
				if(this.state.level === 10) {
					wonGame = true;
				} else {
					loadNextLevel = true;
				}
			}
		} else {
			incorrect = (this.state.meters.incorrect+global.meters.increments.incorrect > 100) ? 100 : (this.state.meters.incorrect+global.meters.increments.incorrect);
			if(incorrect >= 100) {
				this.lose(global.lose.incorrect);
			}
		}

		this.setState((state) => ({
			meters:{
				correct: correct,
				incorrect: incorrect,
				timer: timer
			}
		}));

		if(wonGame) {
			this.clearTimer();
			this.setBackgroundColor(global.backgrounds.gameWon);
			this.setState((state) => ({
				status:'won'
			}));
		} else {
			
			if(loadNextLevel) {
				this.loadNextLevel();
			}

			this.generateNumbers();
		}
	}

	handleKeyPress(e) {
		if (e.key === 'Enter' && e.target.value !== '') {
			this.checkAnswer(this.state.numbers.numberA, this.state.numbers.numberB, e.target.value);
			e.target.value = '';
		} else if(!(/^[0-9]+$/.test(e.key))){
			e.preventDefault();
		}
	}

	render() {
		return (
			<div className='container'>
				{ this.state.status === 'won' ? 
					<div>
						<div className='game-end win'>{global.win}</div>
						<div className='game-end'><button className='title-start pulse' onClick={this.playAgain}>Play Again</button></div>
					</div>
				 : this.state.status === 'lost' ?
				 	<div>
				 		<div className='game-end lose'>{this.state.loseMessage}</div>
						<div className='game-end'><button className='title-start pulse' onClick={this.playAgain}>Play Again</button></div>
					</div>
				 :
					<div>
					<LevelDisplay level={this.state.level} record={this.state.recordLevel} />
					<Problem state={this.state.numbers} />
					<InputContainer handleKeyPress={(e) => {this.handleKeyPress(e)}} state={this.state.disabled} />
					<MeterContainer meters={this.state.meters} />
					</div>
				}
			</div>
		);
	}
}

function LevelDisplay(props){
	return(
		<div className='level-display'>Current Level: <span className='level'>{props.level}</span> | Record Level: <span className='level'>{props.record}</span></div>
	);
}

class TitleScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			viewGame: false
		}
		this.startGame = this.startGame.bind(this);
	}

	startGame() { 
		this.setState({viewGame:true});
	}

	render() {
		return (
			<div>
				{
					this.state.viewGame ? <Game /> :
					<div className='title-container'>
						<div className='title title-header'>MENTAL MATH</div>
						<div className='title title-info'>
							<p>Enter answers to the equations to fill the green meter as quickly as possible and move on to the next level.
							If you enter too many wrong answers, the red meter will fill up and you will lose the game!</p>
							<p>If you do not answer questions quickly enough and the orange meter runs out, you will also lose the game!</p>
							<p>Each time you reach a new level, all meters reset and the orange meter goes a little faster. If you beat level 10, you win!</p>
						</div>
						<div className='title title-start-container'>
							<button className='title-start pulse' onClick={this.startGame} >Start Game</button>
						</div>
					</div>
				}
			</div>
		);
	}
}


ReactDOM.render(
	<TitleScreen />,
	document.getElementById('root')
);
