import React,{ useState } from 'react';
import './Login.css';
import { Link,useNavigate } from 'react-router-dom';
import { BsChatSquareDots } from 'react-icons/bs';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';

function Login() {
  const [userName,setUserName] = useState("");
  const [password,setPassword] = useState("");

  const [loading,setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  //function for login button
  const login = (event) => {
    event.preventDefault();
    setLoading(true);
    const requestData = {userName,password};
    axios.post(`${API_BASE_URL}/api/auth/login`, requestData)
    
    .then((result)=>{
      if(result.status === 200){
        setLoading(false);
        localStorage.setItem("token", result.data.result.token);
        localStorage.setItem('user', JSON.stringify(result.data.result.user));
        dispatch({ type: 'LOGIN_SUCCESS',payload: result.data.result.user });
        
        navigate('/');
      }
    })
    .catch((error)=>{
      console.log(error);
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: error.response.data.error
      })
    })
  }

  return (
    <div className='container mx-auto login-container shadow'>
       <div className='row'>
          <div className='col-md-4 col1colr d-flex flex-column justify-content-center align-items-center'>
              <h3 className='text-center col1text'>Welcome Back</h3>
              <span className='iconchat'><BsChatSquareDots size='5em' color='white'/></span>
          </div>
          <div className='col-md-8 py-4'>
            <div className="card login-card">
              <div className="card-body px-5">
                <h4 className="mt-3 fw-bold" align="left">Log In</h4>
                <form onSubmit={(e)=>login(e)}>
                  <input type="text" value={userName} onChange={(ev)=>setUserName(ev.target.value)} className="form-control input-bg p-2 mb-2 mt-4" placeholder="User Name"/>
                  <input type="password" value={password} onChange={(ev)=>setPassword(ev.target.value)} className="form-control input-bg p-2 mb-2" placeholder="Password"/>
                  <div className="d-grid mt-3">
                    { loading ? <button type="submit" className="btn custom-btn">Loading...</button>
                    :  <button type="submit" className="btn custom-btn">Log In</button>}
                  </div>
                  <div className="mt-3 mb-5">
                    <button type="submit" className="btn">
                        <span className="text-muted fs-6">Don't have an account?</span>
                        <Link to="/register" className="ms-1 text-info fw-bold">Register Now</Link>
                    </button>
                  </div>
                  </form> 
              </div>
            </div>
          </div>
       </div>
    </div>
  )
}

export default Login;