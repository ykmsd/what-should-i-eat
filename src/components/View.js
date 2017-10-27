import React, { Component } from 'react';
import { config } from '../config.js';
import '../styles/style.css';
import '../../node_modules/font-awesome/css/font-awesome.min.css'; 
const clientId = config.clientId;
const clientSecret = config.clientSecret;

class View extends Component {
  constructor(){
    super();
    this.state = {
      restaurants: '',
      pickup: null,
      currentList: [0, 1, 2],
      error: false,
    };
  }
  componentDidMount() {
    this.getData();
    this.setState({
      error: false,
    });
  }
  shuffleRestaurants = (list) => {
    for (let i = list.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }
  updateShowingRestaurant = () => {
    if (this.state.currentList[0] + 3 > this.state.restaurants.length) {
        this.setState({ currentList: [0, 1, 2] });
    }
    this.setState(prevState => ({
      pickup: [
      prevState.restaurants[prevState.currentList[0]],
      prevState.restaurants[prevState.currentList[1]],
      prevState.restaurants[prevState.currentList[2]],
      ],
      currentList: prevState.currentList.map(number => number + 3),
    }));
  }
  async getData(){
    try {
      const targetUrl = 'https://api.foursquare.com/v2/venues/explore?',
            ll = '48.864716, 2.349014',
            query= 'asian';
      const url = `${targetUrl}&venuePhotos=1&ll=${ll}&query=${query}&client_id=${clientId}&client_secret=${clientSecret}&v=20171014&m=foursquare`;
      
      const res = await fetch(url).then(res => res.json());
      const retrievedInfo = res.response.groups[0].items.map((item) => {
        const { venue } = item;
        return { 
            name: venue.name,
            category: venue.categories[0].name,
            rating: venue.rating,
            hours: (venue.hours && venue.hours.status),
            photo: `${venue.photos.groups[0].items[0].prefix}500x500${venue.photos.groups[0].items[0].suffix}`,
            address: venue.location.address,
            id: venue.id,
            searchQuery: `${venue.name.replace("&", "").split(" ").join("+")} paris`,
            all: venue,
        };
      });
      
      this.setState({
        restaurants: this.shuffleRestaurants(retrievedInfo),
      }, this.updateShowingRestaurant);
    } catch(error) {
      console.log(error);
      this.setState({
        error: true
      });
    }
  }
    
   render() { 
    return (
      <div className="container">
      <div className="main">
      {
        this.state.pickup && !this.state.error ? 
        <button className="choice-button" onClick={this.updateShowingRestaurant}>Show me more!</button> :
        <div className="roading">Loading<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></div>
      } 
      
      {this.state.error && <Error />}

      {this.state.pickup && 
        <div className="cards-container">{
          this.state.pickup.map(restaurant => 
            <Card
              name={restaurant.name}
              category={restaurant.category}
              rating={restaurant.rating}
              photo={restaurant.photo}
              address={restaurant.address}
              hours={restaurant.hours}
              searchQuery={restaurant.searchQuery}
              key={restaurant.name}
            />
          )
        }
        </div>
      }
      </div>   
        <Footer />
      </div>
    );
  }
}

const Card = props => {
  return (
    <div className="card-container">
      <div className="card-header">
        <h2>{props.name}</h2>
        <h3>{props.category}</h3>
      </div>
      <img src={props.photo} />
      <p className="address">{props.address}</p>
      <button className="take-me-there">
        <a href={`https://www.google.com/search?q=${props.searchQuery}`} target="_blank" rel='noopener noreferrer'>
        <i className="fa fa-search" aria-hidden="true"></i>Take me there!
        </a>
      </button> 
    </div>
  );
}

const Footer = () => (
    <div className="footer">
      <p>Made by <a href="https://www.instagram.com/eatasiainparis/" target="_blank" rel='noopener noreferrer'>EatAsiaInParis</a></p>
    </div>
  );

const Error = () => (
  <div className="error">
    <p>Oops! Something went wrong. Please try it again later.</p>
  </div>
);

export default View;