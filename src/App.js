import React, { useState, useEffect}from 'react';
import axios from 'axios';
import qs from 'qs';
import moment from 'moment';

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
        <a href="#" >  <img class="avatar avatar-96 img-circle" src= {`${user.avatar}`}  alt = "avatar"/> </a>
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

function Home ({notes, vacations, following}){
  return(
    <div>
      <p><h2>Home</h2></p>
      <div className= "main">
        <NotesCircle notes = {notes}/>
        <VacationsCircle vacations = {vacations}/>
        <FollowingCircle following = {following}/>
      </div>
    </div>
  )
}

function NotesCircle ({notes}){

  return (
    <div className= "cards rounded-circle">
      <h3><a href={`#${qs.stringify({view: 'notes'})}`}> Notes</a></h3>
      <p>You have {notes.length} notes.</p>
    </div>
  );
}

function NotesPage ({notes}){
  return (
    <ul>
      {
          notes.map((note, idx) =>{
            return(
              <li key = {idx} >
                {note.text}
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
      <h3><a href={`#${qs.stringify({view: 'vacations'})}`}>Vacations</a></h3>
      <p>You have {vacations.length} vacations.</p>
    </div>
  );
}

function VacationsPage ({vacations, newVacation, setNewVacation, addVacation, deleteVacation}){


  return(
    <div>
      <h2><p>Vacations</p></h2>
      <form onSubmit= {(ev) => ev.preventDefault()} >
        <input class="form-control" type="date" value= {newVacation.startDate}
          id="start-date" onChange = {(ev) => setNewVacation({...newVacation, startDate: ev.target.value})} />
        <input class="form-control" type="date" value= {newVacation.endDate}
          id="end-date" onChange = {(ev) => setNewVacation({...newVacation, endDate: ev.target.value})}/>
        <button onClick= {()=> addVacation(newVacation)} >Submit</button>
      </form>

      <ul>
        {
          vacations.map((vacation, idx) =>{
            return(

              <li key={idx} >
                <h4><p>Vacation: {idx + 1}</p></h4>
                <p>Start date: { moment(vacation.startDate).format('MM/DD/YYYY')}</p>
                <p>End date: { moment(vacation.endDate).format('MM/DD/YYYY')}</p>
                <button onClick= {()=> deleteVacation(vacation)}> Delete</button>
              </li>

            )
          })
        }
      </ul>
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
  return following;
}

 function App() {
  const [user, setUser] = useState({});
  const [notes, setNotes] = useState([]);
  const [vacations, setVacations]= useState([]);
  const [following, setFollowing] = useState([]);
  const [newVacation, setNewVacation] = useState({startDate: "2020-01-01" , endDate: "2020-01-01"})

  // lines 158 -168 used for routing
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
      getFollowing(user)
        .then((following) => setFollowing(following.data));
   }
  },[user])

// change user button in nav
  const changeUser = () =>{
    window.localStorage.removeItem('userId')
    fetchUser()
      .then((user)=> setUser(user) )
  }

  //add vacation function used on vacation page
  async function addVacation(newVacation){
    await axios.post(`${API}/users/${user.id}/vacations`, { startDate: newVacation.startDate, endDate: newVacation.endDate })

    await getVacations(user)
    .then((vacations) => setVacations(vacations.data))
  }

  //delete vacation button
  async function deleteVacation(vacation){
    console.log(vacation);
    await axios.delete(`${API}/users/${user.id}/vacations/${vacation.id}`)

    await getVacations(user)
    .then((vacations) => setVacations(vacations.data))
  }

    return (
      <div className="App">
        <Nav user = {user} changeUser = {changeUser}/>
        <main>
          {params.view === undefined && <Home notes = {notes} vacations = {vacations}
            following = {following} />}
          {params.view === "notes" && <NotesPage notes = {notes}/>}
          {params.view === "vacations" && <VacationsPage vacations = {vacations}
            newVacation = {newVacation} setNewVacation = {setNewVacation}
            addVacation= {addVacation} deleteVacation= {deleteVacation}/>}
        </main>

      </div>

    );
}

export default App;
