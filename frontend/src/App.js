import './App.css';
import { BrowserRouter as Router,Routes,Route,useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import { useEffect } from 'react';
import Profile from './pages/Profile';
import Tweet from './pages/Tweet';

function App() {

  function DynamicRouting(){
    const navigate = useNavigate();

    useEffect(()=>{
       const userData = JSON.parse(localStorage.getItem("user"));
       if(userData){  //when user is logged in
          navigate('/');
       }else{
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate('/login');
       }
       // eslint-disable-next-line
    }, []);

    return(
       <Routes>
          <Route path='/' element={<Home/>}></Route>
          <Route path='/login' element={<Login/>}></Route>
          <Route path='/register' element={<Register/>}></Route>
          <Route path='/profile/:id' element={<Profile/>}></Route>
          <Route path='/tweet/:id' element={<Tweet/>}></Route>
       </Routes>
    )
 }


  return (
    <div className="App">
        <Router>
          <DynamicRouting/>
        </Router>
    </div>
  );
}

export default App;
