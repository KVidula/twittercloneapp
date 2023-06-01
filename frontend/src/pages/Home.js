import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { BsImage } from 'react-icons/bs';
import Swal from 'sweetalert2';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function Home() {
  const [show, setShow] = useState(false);
  const handleClose = () => {
    setContent('');
    setImage({preview: '', data: ''});
    setShow(false);
  }
  const handleShow = () => setShow(true);
  const [content,setContent] = useState("");
  const [image,setImage] = useState({preview: '', data: ''});
  const [alltweets,setAlltweets] = useState([]);
  const [replyid,setReplyid] = useState("");

  const [showmodal, setShowmodal] = useState(false);
  const handleClosemodal = () => setShowmodal(false);
  const handleShowmodal = (e,tId) => {
    e.stopPropagation();
    localStorage.setItem("parentTweetid",tId);
    setShowmodal(true);
  }
  const navigate = useNavigate();
  // const ref = useRef(null);
  // const [commentmodal,setCommentmodal] = ('');

  const user = useSelector(state => state.userReducer); //user state from redux

  var usercurrId = '';
  const loggedinUser = localStorage.getItem("user");
  if(loggedinUser !== null){
     usercurrId = JSON.parse(loggedinUser).id;
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

const CONFIG_OBJ = {
  headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
  }
}

// add tweet
    const addTweet = async() => {
      if(content === ''){
        Swal.fire({
          icon: 'error',
          title: 'content is mandatory!'
        })
      } else {
          
          if(image.data === ''){
             const request = { content }
             const postResponse = await axios.post(`${API_BASE_URL}/api/tweet`, request, CONFIG_OBJ);
            
             if(postResponse.status === 201){
                setShow(false);
                setContent('');
                setImage({preview: '', data: ''});

                toast.success('Tweet Posted', {
                  position: toast.POSITION.TOP_RIGHT
                });
                getAlltweets();
                     
             } else{
                 Swal.fire({
                     icon: 'error',
                     title: 'some error occured while creating post!'
                 })
             }

          }else{
              const imgRes = await handleImgUpload();
              const request = { content, image: `${API_BASE_URL}/api/files/${imgRes.data.fileName}` }
              const postResponse = await axios.post(`${API_BASE_URL}/api/tweet`, request, CONFIG_OBJ);
              
              if(postResponse.status === 201){
                setShow(false);
                getAlltweets();
                setContent('');
                setImage({preview: '', data: ''});
                
                toast.success('Tweet Posted', {
                  position: toast.POSITION.TOP_RIGHT
                });

              } else{
                  Swal.fire({
                      icon: 'error',
                      title: 'some error occured while creating post!'
                  })
              }
            }
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
      console.log(result);

      if(result === false){
        const request = { "id": id };
        const response = await axios.put(`${API_BASE_URL}/api/tweet/${id}/like`, request, CONFIG_OBJ);
        if(response.status === 200){
          getAlltweets();
          toast.success('Tweet liked', {
            position: toast.POSITION.TOP_RIGHT
          });
        }
     }else{
        const request = { "id": id };
        const response = await axios.put(`${API_BASE_URL}/api/tweet/${id}/dislike`, request, CONFIG_OBJ);
        if(response.status === 200){
          getAlltweets();
          toast.success('Tweet disliked', {
            position: toast.POSITION.TOP_RIGHT
          });
        }
     }
   };


   //delete Tweet
   const deleteTweet = async (tweetId,e) => {
    e.stopPropagation();
    const response = await axios.delete(`${API_BASE_URL}/api/tweet/${tweetId}`, CONFIG_OBJ);
    if(response.status === 200){
       getAlltweets();
       toast.success('Tweet deleted', {
        position: toast.POSITION.TOP_RIGHT
       });
    }
   }


  //show all tweets
    const getAlltweets = async() => {
      const response = await axios.get(`${API_BASE_URL}/api/tweets`);
      if (response.status === 200){
        setAlltweets(response.data.tweets);
        console.log(response.data.tweets);
      }else{
        Swal.fire({
          icon: 'error',
          title: 'some error occured while getting all posts!'
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
                setShowmodal(false);
                getAlltweets(); 
            
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
      getAlltweets();
      
    }, []);
    
    const showProfile = (currtweet,e) => { 
        e.stopPropagation(); 
        navigate(`/profile/${currtweet.tweetedBy._id}`); 
    }

   
  return (
    <div className='Home'>
      <ToastContainer />
      <div className='container'>
       <div className='row mt-4'>
         <div className='col-md-3 ps-5'>
           <Sidebar/>
         </div>
         <div className='col-md-7 mx-2'>
            <div className='card p-4'>
              <div className='d-flex flex-row justify-content-between'>
                <h4>Home</h4>
                <button className='btn btncolr' onClick={handleShow}>Tweet</button>
              </div>

              {/* map card after fetching data from database */}
              {alltweets.map((currtweet,index)=>{
                  return( <div className='card p-3 mt-2 d-flex flex-row tweetcard' onClick={()=>showtweetdetails(currtweet._id)}>
                  
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

                  );
              })}

             
            </div>    
         </div>
       </div>
       
      </div>

        {/* modal for creating new tweet */}
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>New Tweet</Modal.Title>
          </Modal.Header>
          <Modal.Body>
             <textarea className='form-control mb-2' value={content} onChange={(ev)=>setContent(ev.target.value)} placeholder='Write your tweet' rows={5}></textarea>
              {/* for image preview */}
              <BsImage size='2em'/>
              <div className='imagebtn'>
                <input name='file' type='file' id='selectimg' className='FileUpload' accept='.jpg,.png,.gif' onChange={handleFileSelect}/>
              </div>   
              {image.data==='' ? '' : <img src={image.preview} height='200' width='250' alt='previwedimage'/>}  
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={()=>addTweet()}>
              Tweet
            </Button>
          </Modal.Footer>
        </Modal>


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

export default Home;