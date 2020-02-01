import React, { useState, useEffect}from 'react';
import axios from 'axios';
import qs from 'qs';

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

// Next 4 functions are Components. Maybe move to seperate files later

function Nav({user, changeUser}){
  return(
    <div className= "nav">
      <div>
        <img class="avatar avatar-96 img-circle" src= {`${user.avatar}`}  alt = "avatar"/>
      </div>
      <div>
        {user.email}
      </div>
      <div>
        <button onClick={changeUser} >Change User</button>
      </div>
    </div>
  );
}

function NotesCircle ({notes}){
  return (
    <div className= "cards rounded-circle">
      <h3><a href="#notes"> Notes</a></h3>
      <p>You have {notes.length} notes.</p>
    </div>
  );
}

function NotesPage ({notes}){
  return (
    <ul>
      {
          notes.map((note) =>{
            return(
              <li>
                {note}
              </li>
            )
          })
      }
    </ul>
  )
}

function VacationsCircle ({vacations}){
  return (
    <div className= "cards rounded-circle">
      <h3>Vacations</h3>
      <p>You have {vacations.length} vacations.</p>
    </div>
  );
}

function FollowingCircle ({following}){
  return(
    <div className= "cards rounded-circle">
      <h3>Following Companies</h3>
      <p>You are following {following.length} companies.</p>
    </div>
  );
}

async function getNotes(user){
  let notes = await axios.get(`${API}/users/${user.id}/notes`)
  return notes;
}

async function getVacations(user){
  let vacations = await axios.get(`${API}/users/${user.id}/vacations`)
  return vacations;
}

async function getFollowing(user){
  let following = await axios.get(`${API}/users/${user.id}/followingCompanies`)
  console.log(following);
  return following;
}

 function App() {
  const [user, setUser] = useState('');
  const [notes, setNotes] = useState('');
  const [vacations, setVacations]= useState('');
  const [following, setFollowing] = useState('');

  // lines 90 -101 used for routing
  const getHash = ()=> {
    return window.location.hash.slice(1);
  }
  const [ params, setParams ] = useState(qs.parse(getHash()));

  useEffect(()=> {
    window.addEventListener('hashchange', ()=> {
      setParams(qs.parse(getHash()));
    });
    setParams(qs.parse(getHash()));
  }, []);

  useEffect(() => {
    fetchUser()
    .then((user) => setUser(user))
  }, [])

  useEffect(() =>{
   if(user.id){
      getNotes(user)
        .then((notes)=> setNotes(notes.data))
      getVacations(user)
        .then((vacations) => setVacations(vacations.data))
        .then((vacations) => console.log(vacations))
      getFollowing(user)
        .then((following) => setFollowing(following.data));
   }
  },[user])


  const changeUser = () =>{
    window.localStorage.removeItem('userId')
    fetchUser()
      .then((user)=> setUser(user) )
  }


    return (
      <div className="App">
        <Nav user = {user} changeUser = {changeUser}/>
        <div className= "main">
          <NotesCircle notes = {notes}/>
          <VacationsCircle vacations = {vacations}/>
          <FollowingCircle following = {following}/>
        </div>
      </div>

    );
}

export default App;
