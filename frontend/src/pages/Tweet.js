import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import Sidebar from '../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import './Tweet.css';

function Tweet() {
    const [tweetdetails,setTweetdetails] = useState([]);
    const [alltweets,setAlltweets] = useState([]);
    const [allreplies,setAllreplies] = useState([]);
    const [allreplytweets,setAllreplytweets] = useState([]);
    const [showmodal, setShowmodal] = useState(false);
    const handleClosemodal = () => setShowmodal(false);

    const handleShowmodal = (e,tId) => {
      e.stopPropagation();
      localStorage.setItem("parentTweetid",tId);
      setShowmodal(true);
    }

    const [content,setContent] = useState("");
    const navigate = useNavigate();

    const loggedinUser = localStorage.getItem("user");
    const usercurrId = JSON.parse(loggedinUser).id;

    const urlstring = window.location.pathname;
    const str = urlstring.slice(urlstring.indexOf('/')).slice(1) 
    var tweetId = str.substring(str.indexOf("/") + 1);

    var replyarr = [];
    var result = false;

    const CONFIG_OBJ = {
      headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token")
      }
    }

   //get single tweet details
   const gettweetDetails = async() => {
    const response = await axios.get(`${API_BASE_URL}/api/getsingletweet/${tweetId}`);
    if (response.status === 200){
        setTweetdetails(response.data.tweet);
    }else{
      Swal.fire({
        icon: 'error',
        title: 'some error occured while getting all data!'
      })
    }
   }

   //get replies
   const getreply = async(id) => {
     const request = { "id": id };
     const response = await axios.get(`${API_BASE_URL}/api/getreplies/${tweetId}`,request);
    if (response.status === 200){
       setAllreplies([response.data.replies]);
      // console.log(response.data.replies);
        getreplytweets(response.data.replies);
    }else{
      Swal.fire({
        icon: 'error',
        title: 'some error occured while getting all data!'
      })
    }
   }


   //get reply tweets
   const getreplytweets = async(ids) => {
    const request = { ids };
    const response = await axios.get(`${API_BASE_URL}/api/getreplytweets`,request);
   if (response.status === 200){
      setAllreplytweets(response.data.replytweets);
   }else{
     Swal.fire({
       icon: 'error',
       title: 'some error occured while getting all data!'
     })
   }
  }



    //show all tweets
    const getAlltweets = async() => {
      const response = await axios.get(`${API_BASE_URL}/api/tweets`);
      if (response.status === 200){
        setAlltweets(response.data.tweets);
      }else{
        Swal.fire({
          icon: 'error',
          title: 'some error occured while getting all posts!'
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
        getAlltweets();
        gettweetDetails();
        toast.success('Tweet liked', {
          position: toast.POSITION.TOP_RIGHT
        });
      }
   }else{
      const request = { "id": id };
      const response = await axios.put(`${API_BASE_URL}/api/tweet/${id}/dislike`, request, CONFIG_OBJ);
      if(response.status === 200){
        getAlltweets();
        gettweetDetails();
        toast.success('Tweet disliked', {
          position: toast.POSITION.TOP_RIGHT
        });
      }
   }
 };


     //delete Tweet
    const deleteTweet = async (tweetId) => {
    const response = await axios.delete(`${API_BASE_URL}/api/tweet/${tweetId}`, CONFIG_OBJ);
    if(response.status === 200){
       getAlltweets();
       toast.success('Tweet deleted', {
        position: toast.POSITION.TOP_RIGHT
       });
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
              setShowmodal(false);
              getAlltweets();
              gettweetDetails();
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
        getAlltweets();
        gettweetDetails();
         setShowmodal(false);
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
          getAlltweets();
          gettweetDetails();
          toast.success('Retweet Successfully', {
          position: toast.POSITION.TOP_RIGHT
        });
      }
    }

    const showtweetdetails = (id) => {
        localStorage.setItem("parentTweetid",id);
        navigate(`/tweet/${id}`);
    }

     const showProfile = (currtweet,e) => {
        e.stopPropagation(); 
        navigate(`/profile/${currtweet.tweetedBy._id}`); 
    }

   useEffect(()=>{
     gettweetDetails();
     getAlltweets();
     getreply(tweetId);
   },[]);

  return (
    <div className='Tweet'>
        <ToastContainer />
        <div className='container'>
        <div className='row mt-4'>
            <div className='col-md-3 ps-5'>
            <Sidebar/>
            </div>
            <div className='col-md-7 mx-2'>
              <div className='card p-4'>
                <h4 align="left">Tweet</h4>
                {tweetdetails.map((currtweet,index)=>{
                    return(<div className='card p-3 mt-2 d-flex flex-row tweetcard' onClick={()=>showtweetdetails(currtweet._id)}>
                  
                    <img className="user-pic" alt="User pic" src={currtweet.tweetedBy.profilePic}/>
                    
                  <div className='d-flex flex-row justify-content-between mt-2 ms-3'> 
                    <div align='left'>
                      {currtweet.retweetBy.length > 0 ? <span className='text-muted mb-4'><i className="fa-solid fa-retweet"></i> Retweeted by {currtweet.retweetBy[0].userName}</span> : ''} 
                      <a className='gotoprofile'><h6 onClick={(e)=>showProfile(currtweet,e)}>@{currtweet.tweetedBy.userName}  -  Fri Jan 27 2023</h6></a>
                      <p>{currtweet.content}</p>
                      {currtweet.image ? <img className='img-fluid' alt="tweetpic" src={currtweet.image}/> : '' }
                      <div className='pe-5'>
                        
                        {currtweet.likes.length > 0 ? <span className='pe-4'><i className="fa-solid fa-heart heartcolr" onClick={(e)=>likeDislikePost(currtweet._id,e)}></i>  {currtweet.likes.length}</span>  
                        : <span className='pe-4'><i className="fa-regular fa-heart heartcolr" onClick={(e)=>likeDislikePost(currtweet._id,e)}></i>  {currtweet.likes.length}</span>   }
                    
                        <span className='pe-4'><i className="fa-regular fa-comment commentcolr" id="commenticon" onClick={(e) => handleShowmodal(e,currtweet._id)}></i>  {currtweet.replies.length}</span>       
                        <span><i className="fa-solid fa-retweet retweetcolr" onClick={(e)=>putretweet(currtweet._id,e)}></i>  {currtweet.retweetBy.length}</span>
                      </div> 
                    </div>
                    <div className='deleteicon'>
                       {usercurrId === currtweet.tweetedBy._id ? 
                       <span><i className="fa-solid fa-trash-can float-end ms-4" onClick={(e)=>deleteTweet(currtweet._id,e)}></i></span> : 
                       <span></span>}
                       
                    </div>
                  </div>
              </div> 
                )
                    
                 })}

                 {/* replies  */}
                   <h5 align="left" className='pt-2'>Replies</h5>  
                  
                    {alltweets.map((currt,index)=>{

                        {allreplies.map((item)=>{
                          result = item[0].replies.includes(currt._id); 
                        })}

                         return ( <div className='card cardmain'>
                            {result === true ?
                            <div className='card p-3 mt-2 d-flex flex-row tweetcard' onClick={()=>showtweetdetails(currt._id)}>
                  
                            <img className="user-pic" alt="User pic" src={currt.tweetedBy.profilePic}/>
                            
                          <div className='d-flex flex-row justify-content-between mt-2 ms-3'> 
                            <div align='left'>
                            {currt.retweetBy.length > 0 ? <span className='text-muted mb-4'><i className="fa-solid fa-retweet"></i> Retweeted by {currt.retweetBy[0].userName}</span> : ''} 

                              <a className='gotoprofile'><h6 onClick={(e)=>showProfile(currt,e)}>@{currt.tweetedBy.userName}  -  Fri Jan 27 2023</h6></a>
                              <p>{currt.content}</p>
                              {currt.image ? <img className='img-fluid' alt="tweetpic" src={currt.image}/> : '' }

                              <div className='pe-5'>  
                                {currt.likes.length > 0 ? <span className='pe-4'><i className="fa-solid fa-heart heartcolr" onClick={(e)=>likeDislikePost(currt._id,e)}></i>  {currt.likes.length}</span>  
                                : <span className='pe-4'><i className="fa-regular fa-heart heartcolr" onClick={(e)=>likeDislikePost(currt._id,e)}></i>  {currt.likes.length}</span>   }
                            
                                <span className='pe-4'><i className="fa-regular fa-comment commentcolr" id="commenticon" onClick={(e) => handleShowmodal(e,currt._id)}></i>  {currt.replies.length}</span>       
                                <span><i className="fa-solid fa-retweet retweetcolr" onClick={(e)=>putretweet(currt._id,e)}></i>  {currt.retweetBy.length}</span>
                              </div> 
                            </div>
                            <div className='deleteicon'>
                               {usercurrId === currt.tweetedBy._id ? 
                               <span><i className="fa-solid fa-trash-can float-end ms-4" onClick={(e)=>deleteTweet(currt._id,e)}></i></span> : 
                               <span></span>}
                               
                            </div>
                          </div>
                      </div> 

                              : ''}
                    </div>
                          );
                          
                      })}
                  
                   
            </div>
          </div>
        </div>
      </div>


        {/* modal for giving reply */}
        <Modal show={showmodal} onHide={handleClosemodal}>
          <Modal.Header closeButton>
            <Modal.Title>Tweet your reply</Modal.Title>
          </Modal.Header>
          <Modal.Body>
             <textarea className='form-control mb-2' value={content} onChange={(ev)=>setContent(ev.target.value)} placeholder='Add your reply' rows={5}></textarea>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClosemodal}>
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

export default Tweet;