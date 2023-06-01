import React,{ useState } from 'react';
import { BsChatSquareDots } from 'react-icons/bs';
import { AiFillHome } from 'react-icons/ai';
import { BsFillPersonFill } from 'react-icons/bs';
import { FiLogOut } from 'react-icons/fi';
import { CgProfile } from 'react-icons/cg';
import { Link,useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showmodallogout, setShowmodallogout] = useState(false);
  const handleClosemodallogout = () => setShowmodallogout(false);
  const handleShowmodallogout = () => setShowmodallogout(true);
  
  const logout = () => {
     localStorage.removeItem("user");
     localStorage.removeItem("token");
     dispatch({ type: "LOGIN_ERROR" });
     navigate('/login');
  }

  var userFullname = '';
  var userEmail = '';
  var usercurrId = '';
  const userData = localStorage.getItem("user");
  if(userData !== null){
    userFullname = JSON.parse(userData).fullName;
    userEmail = JSON.parse(userData).email;
    usercurrId = JSON.parse(userData).id;
  }
  //const loggedinUser = localStorage.getItem("user");
  //const usercurrId = JSON.parse(loggedinUser).id;

  const profile = () => {
    navigate(`/profile/${usercurrId}`);
  }
  

  return (
    <div className='Sidebar'>

        <nav className="Sidenav py-2 ps-5">
            <span><BsChatSquareDots size='2em' color='royalblue'/></span>
            <Link to='/' className="nav-link mt-3 fs-5 pb-2 active navlink"><span><AiFillHome/></span>  Home</Link>
            <button onClick={() => profile()} className="btn nav-link fs-5 pb-1 ps-5 navlink"><span><BsFillPersonFill/></span>  Profile</button>
            <button className="btn n'av-link fs-5 ps-4 navlink" onClick={()=>handleShowmodallogout()}><span><FiLogOut/></span>  Logout</button>
            <div className='nameUser d-flex'>
               <div className='px-2'><span><CgProfile size='2em'/></span></div>
               <div align='left'>
                  <h5>{userFullname}</h5>
                  <h6>{userEmail}</h6>
               </div>
            </div> 
        </nav>
        

      {/* modal for logout*/}
      <Modal show={showmodallogout} onHide={handleClosemodallogout}>
        
        <Modal.Header closeButton>
          <Modal.Title>Log out</Modal.Title>
        </Modal.Header>
        <Modal.Body>
           <h6>Are you sure you want to logout?</h6>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosemodallogout}>
            Close
          </Button>
          <Button variant="primary" onClick={()=>logout()}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  )
}

export default Sidebar;