import React from 'react';
import axios from 'axios';


const API = 'https://acme-users-api-rev.herokuapp.com/api';

const fetchUser = async ()=> {
  const storage = window.localStorage;
  const userId = storage.getItem('userId');
  if(userId){
    try {
      return (await axios.get(`${API}/users/detail/${userId}`)).data;
    }
    catch(ex){
      storage.removeItem('userId');
      return fetchUser();
    }
  }
  const user = (await axios.get(`${API}/users/random`)).data;
  storage.setItem('userId', user.id);
  return  user;
};

function Nav({user}){
console.log(user.email)
  return(

    <div className= "nav">
      <ul>
        <li>
          <img class="avatar avatar-96 img-circle" src= {`${user.avatar}`} />
        </li>
        <li>
          {user.email}
        </li>
        <li>
          <button>Change User</button>
        </li>
      </ul>
    </div>

  );
}


 function App() {

  let user = fetchUser()
  .then((user) => console.log(user))
  .then(() =>{

    return (
      <div className="App">
        <Nav user = {user}/>
      </div>
    );
  })

  return null;
}

export default App;
