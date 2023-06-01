import React, { useState,useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import Sidebar from '../components/Sidebar';
import './Profile.css';
import { FaBirthdayCake } from 'react-icons/fa';
import { IoLocationSharp } from 'react-icons/io5';
import { BsCalendarEvent } from 'react-icons/bs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const [userinfo,setUserinfo] = useState([]);
    const [usertweets,setUsertweets] = useState([]);
    const [image,setImage] = useState({preview: '', data: ''});
    const [content,setContent] = useState("");

    const navigate = useNavigate();

    const [showmodal, setShowmodal] = useState(false);
    const handleClosemodal = () => setShowmodal(false);
    const handleShowmodal = () => setShowmodal(true);

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [showmodalreply, setShowmodalreply] = useState(false);
    const handleClosemodalreply = () => setShowmodalreply(false);
    const handleShowmodalreply = (e,tId) => {
      e.stopPropagation();
      localStorage.setItem("parentTweetid",tId);
      setShowmodalreply(true);
    }

    const [isfollow,setIsfollow] = useState(false);

    const [fullName,setFullName] = useState("");
    const [location,setLocation] = useState("");
    const [dateofBirth,setDateofBirth] = useState("");

    const loggedinUser = localStorage.getItem("user");
    const usercurrId = JSON.parse(loggedinUser).id;

    const urlstring = window.location.pathname;
    const str = urlstring.slice(urlstring.indexOf('/')).slice(1) 
    var profileId = str.substring(str.indexOf("/") + 1);

    const CONFIG_OBJ = {
      headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token")
      }
    }

    //get single user info
    const getUserinfo = async() => {
        const response = await axios.get(`${API_BASE_URL}/api/user/${profileId}`);
        if (response.status === 200){
          setUserinfo(response.data.user);
          setFullName(response.data.user.fullName);
        }else{
          Swal.fire({
            icon: 'error',
            title: 'some error occured while getting all data!'
          })
        }
      }
  

    //get single user tweets
    const getUsertweets = async() => {
      const response = await axios.get(`${API_BASE_URL}/api/user/${profileId}/tweets`);
      if (response.status === 200){
        setUsertweets(response.data.tweets);
      }else{
        Swal.fire({
          icon: 'error',
          title: 'some error occured while getting all data!'
        })
      }
    }

  //like or dislike a tweet
  const likeDislikePost = async (id,e) => {
    e.stopPropagation();

    //find user liked tweet or not
    const response1 = await axios.get(`${API_BASE_URL}/api/findlikes/${id}`);
    if(response1.status === 200){
       console.log(response1.data.likes);
    }

    var result = false;
    
    result = response1.data.likes[0].likes.includes(usercurrId);

    if(result === false){
      const request = { "id": id };
      const response = await axios.put(`${API_BASE_URL}/api/tweet/${id}/like`, request, CONFIG_OBJ);
      if(response.status === 200){
        getUsertweets();
        toast.success('Tweet liked', {
          position: toast.POSITION.TOP_RIGHT
        });
      }
   }else{
      const request = { "id": id };
      const response = await axios.put(`${API_BASE_URL}/api/tweet/${id}/dislike`, request, CONFIG_OBJ);
      if(response.status === 200){
        getUsertweets();
        toast.success('Tweet disliked', {
          position: toast.POSITION.TOP_RIGHT
        });
      }
   }
 };


 //find following
 const findFollowing = async(id) => {
    //find follow or not
    const response1 = await axios.get(`${API_BASE_URL}/api/findfollowing/${usercurrId}`);
    if(response1.status === 200){
       console.log(response1.data.following);
    }
     
    if (response1.data.following[0].following.includes(id)){
      setIsfollow(true);
    }
    
 }
   
  //follow user
  const followUser = async(id) => {
        const request = { "id": id };
        const response = await axios.put(`${API_BASE_URL}/api/user/${id}/follow`, request, CONFIG_OBJ);
        if(response.status === 200){
          getUserinfo();
          setIsfollow(true);
          toast.success('Followed User', {
           position: toast.POSITION.TOP_RIGHT
         });
        }
  };
  
  //unfollow user
  const unfollowUser = async(id) => {
     const request = { "id": id };
     const response = await axios.put(`${API_BASE_URL}/api/user/${id}/unfollow`,request, CONFIG_OBJ);
     if(response.status === 200){
       getUserinfo();
       setIsfollow(false);
       toast.success('Unfollowed User', {
        position: toast.POSITION.TOP_RIGHT
      });
     }
}; 


     //edit user
     const editUser = async(id) => {
        const request = { fullName, dateofBirth, location };
        if( !fullName || !location || !dateofBirth){
          Swal.fire({
            icon: 'error',
            title: 'one or more mandatory fields are empty!'
          })
        }
        const response = await axios.put(`${API_BASE_URL}/api/edituser/${id}`, request);
        if(response.status === 200){
          setShowmodal(false);
          getUserinfo();
          toast.success('Profile edited', {
            position: toast.POSITION.TOP_RIGHT
          });
        }
     }


     const handleFileSelect = (event) => {
      const img = {
          preview: URL.createObjectURL(event.target.files[0]),
          data: event.target.files[0]
      }
      setImage(img);
     }  

     //upload image in images folder
      const handleImgUpload = async() => {
        let formData = new FormData() ;
        formData.append('file', image.data);
        const response = axios.post(`${API_BASE_URL}/api/uploadFile`, formData);
        return response;
      }

     //upload profile pic
     const uploadProfilepic = async(id) => {
      const imgRes = await handleImgUpload();
      const request = { image: `${API_BASE_URL}/api/files/${imgRes.data.fileName}` }
      const postResponse = await axios.put(`${API_BASE_URL}/api/user/${id}/uploadProfilePic`, request)
      if(postResponse.status === 200){
        setShow(false);
        getUserinfo();
        toast.success('Profile pic uploaded', {
          position: toast.POSITION.TOP_RIGHT
        });

      } else{
          Swal.fire({
              icon: 'error',
              title: 'some error occured while uploading profile pic!'
          })
      }
     }

    //reply on a tweet
    const addReply = async() => {
      if(content === ''){
        Swal.fire({
          icon: 'error',
          title: 'content is mandatory!'
        })
      } else {
             const request = { content }
             const postResponse = await axios.post(`${API_BASE_URL}/api/tweet`, request, CONFIG_OBJ);
            
             if(postResponse.status === 201){
                setShowmodalreply(false);
                getUsertweets(); 
                addreplyId(postResponse.data.post._id);
             } else{
                 Swal.fire({
                     icon: 'error',
                     title: 'some error occured while creating post!'
                 })
             }
            }
      }

      //save reply id in parent tweet 
      const addreplyId = async (replyid) => {
        const parentTweetid = localStorage.getItem("parentTweetid");
        const request = { replyid, parentTweetid };
        const response = await axios.put(`${API_BASE_URL}/api/addreplyid`, request);
        if(response.status === 200){
           getUsertweets();
           setShowmodalreply(false);
           toast.success('Added reply', {
            position: toast.POSITION.TOP_RIGHT
          });
        }
      }


    //retweet
    const putretweet = async(id,e) => {
      e.stopPropagation(); 
      const request = { "id": id };
      const response = await axios.put(`${API_BASE_URL}/api/tweet/${id}/retweet`, request, CONFIG_OBJ);
      if (response.status === 200){
          getUsertweets();
          toast.success('Retweet Successfully', {
          position: toast.POSITION.TOP_RIGHT
        });
      }
    }


    //click on a tweet
    const showtweetdetails = (id) => {
      localStorage.setItem("parentTweetid",id);
      navigate(`/tweet/${id}`);
    }

      useEffect(() => {
        getUserinfo();
        getUsertweets();
        findFollowing(profileId);
        // eslint-disable-next-line
      }, []);
     

  return (
    <div className='Profile'>
      <ToastContainer />
       <div className='container'>
          <div className='row mt-4'>
            <div className='col-md-3'>
              <Sidebar/>
            </div>
            <div className='col-md-7 mx-2 pb-2 profilecontainer'>
                <h4 align="left">Profile</h4>
                <div className='my-2 profilecard'>  
                <img className="user-profile" alt="User pic" src={userinfo.profilePic}/>
                </div>  
                { usercurrId === profileId ? 
                  <div className='float-end'>
                    <button className='btn btn-outline-primary' onClick={handleShow}>Upload Profile Photo</button> 
                    <button className='btn btn-outline-dark ms-2' onClick={handleShowmodal}>Edit</button> 
                  </div>  
                  : 
                  <div className='float-end'> 
                    {isfollow === false ? <button className='btn btnfollow' id='btnfollow' onClick={()=>followUser(userinfo._id)}>Follow</button>
                    : <button className='btn btnfollow' id='btnfollow' onClick={()=>unfollowUser(userinfo._id)}>Unfollow</button>}
                    
                  </div> }
                <div className='ms-1 mt-5'>
                  <h3 align="left">{userinfo.fullName}</h3>
                  <h6 align="left" className='text-muted'>@{userinfo.userName}</h6><br/>
                  <h6 align="left" className='text-muted'><FaBirthdayCake/>  Dob, {userinfo.dateofBirth ? (userinfo.dateofBirth).slice(0,10) : ''}     <span> <IoLocationSharp/>  Location, {userinfo.location}</span></h6>
                  <h6 align="left" className='text-muted'><BsCalendarEvent/>  Joined Tue, Jan 20 2022</h6><br/>
                  {/* <h6 align="left">{userinfo.following.length === 'undefined' ? 0 : userinfo.following.length} Following   </h6> */}
                  <h6 align="left">{userinfo.followers ? userinfo.followers.length : 0} Followers   <span className='ps-4'> {userinfo.following ? userinfo.following.length : 0} Following</span> </h6>
                </div>
                   <h5 className='text-center'>Tweets and Replies</h5> 
              

              {/* tweets  */}
              {usertweets.map((currtweet,index)=>{
                  return( <div className='card p-3 mt-2 d-flex flex-row tweetcard' onClick={()=>showtweetdetails(currtweet._id)}>
                  
                    <img className="user-pic" alt="User pic" src={userinfo.profilePic}/>
                    
                    <div className='d-flex flex-row justify-content-between mt-2 ms-3'> 
                      <div align='left'>
                         {currtweet.retweetBy.length > 0 ? <span className='text-muted mb-4'><i className="fa-solid fa-retweet"></i> Retweeted by {currtweet.retweetBy[0].userName}</span> : ''}

                        <a><h6>@{currtweet.tweetedBy.userName}  -  Fri Jan 27 2023</h6></a>
                        <p>{currtweet.content}</p>
                        {currtweet.image ? <img className='img-fluid' alt="tweetpic" src={currtweet.image}/> : '' }
                        <div className='pe-5'>
                          
                          {currtweet.likes.length > 0 ? <span className='pe-4'><i className="fa-solid fa-heart heartcolr" onClick={(e)=>likeDislikePost(currtweet._id,e)}></i>  {currtweet.likes.length}</span>  
                          : <span className='pe-4'><i className="fa-regular fa-heart heartcolr" onClick={(e)=>likeDislikePost(currtweet._id,e)}></i>  {currtweet.likes.length}</span>   }
                      
                          <span className='pe-4'><i className="fa-regular fa-comment commentcolr" onClick={(e) => handleShowmodalreply(e,currtweet._id)}></i>  {currtweet.replies.length}</span>       
                          <span><i className="fa-solid fa-retweet retweetcolr" onClick={(e)=>putretweet(currtweet._id,e)}></i>  {currtweet.retweetBy.length}</span>
                        </div>
                      </div>
                    
                    </div>
                </div>
                  );
              })}

              </div>  
          </div>   
       </div>


       {/* modal for edit profile */}
       <Modal show={showmodal} onHide={handleClosemodal}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Profile</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <label>Name</label>  
              <input className='form-control mb-2' type="text" value={fullName} onChange={(ev)=>setFullName(ev.target.value)}/>
              <label>Location</label> 
              <input className='form-control mb-2' type="text" value={location} onChange={(ev)=>setLocation(ev.target.value)} placeholder='location'/>
              <label>Date of birth</label> 
              <input className='form-control' type="date" value={dateofBirth} onChange={(ev)=>setDateofBirth(ev.target.value)} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClosemodal}>
              Close
            </Button>
            <Button variant="primary" onClick={()=>editUser(userinfo._id)}>
              Edit
            </Button>
          </Modal.Footer>
        </Modal>


        {/* modal for upload profile pic */}
       <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Upload Profile Pic</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <div className='card mb-3 p-3 cardmodalprofile'>
                 <h6>Note: The image should be square in shape</h6>
              </div>
              {/* for image preview */}
              <input name='file' type='file' className='form-control' accept='.jpg,.png,.gif' onChange={handleFileSelect}/>
              {image.data==='' ? '' : <img src={image.preview} height='250' width='350' alt='previedimage'/>} 
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={()=>uploadProfilepic(userinfo._id)}>
              Save Profile Pic
            </Button>
          </Modal.Footer>
        </Modal>


       {/* modal for giving reply */}
       <Modal show={showmodalreply} onHide={handleClosemodalreply}>
        
        <Modal.Header closeButton>
          <Modal.Title>Tweet your reply</Modal.Title>
        </Modal.Header>
        <Modal.Body>
           <textarea className='form-control mb-2' value={content} onChange={(ev)=>setContent(ev.target.value)} placeholder='Add your reply' rows={5}></textarea>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosemodalreply}>
            Close
          </Button>
          <Button variant="primary" onClick={()=>addReply()}>
            Reply
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  )
}

export default Profile;