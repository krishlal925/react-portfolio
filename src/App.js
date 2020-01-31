import React, { useState, useEffect}from 'react';
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

function Nav({user, changeUser}){
console.log(user.email)
  return(

    <div className= "nav">

      <div>
        <img class="avatar avatar-96 img-circle" src= {`${user.avatar}`} />
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

function Notes ({notes}){
  return (
    <div>
      <h3>Notes</h3>
      <p>You have {notes.length} notes.</p>
    </div>
  );
}

async function getNotes(user){
  let notes = await axios.get(`${API}/users/${user.id}/notes`)
  return notes;
}
 function App() {
  const [user, setUser] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchUser()
    .then((user) => setUser(user))
  }, [])

  useEffect(() =>{
    getNotes(user)
      .then((notes)=> setNotes(notes.data))
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
          <Notes notes = {notes}/>
        </div>
      </div>

    );
}

export default App;
