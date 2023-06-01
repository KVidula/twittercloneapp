import React,{ useState } from 'react'
import './Login.css';
import { Link,useNavigate } from 'react-router-dom';
import { BsChatSquareDots } from 'react-icons/bs';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

function Register() {
  const [fullName,setFullName] = useState("");
  const [email,setEmail] = useState("");
  const [userName,setUserName] = useState("");
  const [password,setPassword] = useState("");
  const navigate = useNavigate();

  //function for signup button
  const register = (event) => {
    event.preventDefault();
    
    const requestData = {fullName,email,userName,password};
    axios.post(`${API_BASE_URL}/api/auth/register`, requestData)
    
    .then((result)=>{
      if(result.status === 201){
        setFullName('');
        setEmail('');
        setUserName('');
        setPassword('');
        navigate('/login');
      }
      
    })
    .catch((error)=>{
      console.log(error);
      Swal.fire({
        icon: "error",
        title: error.response.data.error
      })
    })
  }

  //react toastify
  const showtoast = () => {
    if (fullName || email || userName || password) {
      toast.success('Registration Successful, Please login to continue.', {
        position: toast.POSITION.TOP_RIGHT
      });
    }
  }


  return (
    <div className='container mx-auto login-container shadow'>
       <ToastContainer />
       <div className='row'>
          <div className='col-md-4 col1colr d-flex flex-column justify-content-center align-items-center'>
              <h3 className='text-center col1text'>Join Us</h3>
              <span className='iconchat'><BsChatSquareDots size='5em' color='white'/></span>
          </div>
          <div className='col-md-8 py-4'>
            <div className="card login-card">
              <div className="card-body px-5">
                <h4 className="mt-3 fw-bold" align="left">Register</h4>
                <form onSubmit={(e)=>register(e)}>
                  <input type="text" value={fullName} onChange={(ev)=>setFullName(ev.target.value)} className="form-control input-bg p-2 mb-2 mt-4" placeholder="Full Name"/>
                  <input type="email" value={email} onChange={(ev)=>setEmail(ev.target.value)} className="form-control input-bg p-2 mb-2 mt-4" placeholder="Email"/>
                  <input type="text" value={userName} onChange={(ev)=>setUserName(ev.target.value)} className="form-control input-bg p-2 mb-2 mt-4" placeholder="User Name"/>
                  <input type="password" value={password} onChange={(ev)=>setPassword(ev.target.value)} className="form-control input-bg p-2 mt-4 mb-2" placeholder="Password"/>
                  <div className="d-grid mt-3">
                    <button type="submit" className="btn custom-btn" onClick={()=>showtoast()}>Register</button>
                  </div>
                  <div className="mt-3 mb-5 d-grid">
                    <button type="submit" className="btn custom-btn-white">
                        <span className="text-muted fs-6">Already Registered?</span>
                        <Link to="/login" className="ms-1 text-info fw-bold">Login Here</Link>
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

export default Register;