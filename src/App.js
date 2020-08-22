import React,{Component} from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import './App.css';

const particlesOptions={
	particles: {
		number:{
			value:75,
			density:{
				enable:true,
				value_area:500
			}
		}
	}
}

const initialState={
	input:'',
	imageUrl:'',
	box:{},
	route:'signin',
	isSignedIn: false,
	user:{
		id: '',
		name: '',
		email: '',
		entries: '',
		joined: ''
	}
}

class App extends Component {
	constructor(){
		super();
		this.state=initialState;
	}

	loadUser=(user)=>{
		this.setState({user:{
			id: user.id,
			name: user.name,
			email: user.email,
			entries: user.entries,
			joined: user.joined
		}})
	}

	FaceLocation=(data)=>{
		const calraifaiFace=data.outputs[0].data.regions[0].region_info.bounding_box;
		const image= document.getElementById('inputimage');
		const width= Number(image.width);
		const height=Number(image.height);
		return{
			leftCol: calraifaiFace.left_col*width,
			topRow: calraifaiFace.top_row*height,
			rightCol: width-(calraifaiFace.right_col*width),
			bottomRow: height-(calraifaiFace.bottom_row*height)
		}
	}

	onRouteChange=(route)=>{
		if(route==='signout'){
			this.setState(initialState)
		} else{
			this.setState({isSignedIn: true})
		}
		this.setState({route:route});
	}

	displayFaceBox=(box)=>{
		this.setState({box:box});
	}

	onInputChange=(event)=>{
		this.setState({input:event.target.value});
	}

	onPictureSubmit=()=>{
		this.setState({imageUrl: this.state.input});
		fetch('https://murmuring-meadow-43480.herokuapp.com/imageurl',{
					method:'post',
					headers:{'Content-Type':'application/json'},
					body:JSON.stringify({
						input:this.state.input
					})
		})
		.then(response=>response.json())
		.then(response=>{
			if(response){
				fetch('https://murmuring-meadow-43480.herokuapp.com/image',{
					method:'put',
					headers:{'Content-Type':'application/json'},
					body:JSON.stringify({
						id:this.state.user.id
					})
				})
				.then(response=>response.json())
				.then(count=>{
					this.setState(Object.assign(this.state.user,{entries:count
					}))
				})
				.catch(console.log)
			}
			this.displayFaceBox(this.FaceLocation(response))
		})
		.catch(err=>console.log(err));
	}

	render(){
		const {isSignedIn,imageUrl,route,box} = this.state;
		return (
			<div className="App">
			<Particles className='particles'
			params={particlesOptions}
			/>
			<Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
			{ route==='home'? 
			<div>
			<Logo />
			<Rank name={this.state.user.name} entries={this.state.user.entries}/>
			<ImageLinkForm onInputChange={this.onInputChange}
			onPictureSubmit={this.onPictureSubmit}/>
			<FaceRecognition imageUrl={imageUrl} box={box} />
			</div>
			:(
				route==='signin'
				? <SignIn onRouteChange={this.onRouteChange} 
					loadUser={this.loadUser}/>
				: <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
				)

		}
		</div>
		);
	}

}

export default App;
