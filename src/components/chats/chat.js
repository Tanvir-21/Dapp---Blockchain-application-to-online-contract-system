import React, {Component} from 'react'
import io from 'socket.io-client';
import { getContract } from '../utils/contractservice';
import axios from 'axios';
import logo from '../../static/user_mock.svg'
import Moment from "react-moment";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
class chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account :null,
      to:null,
      message_to_send: '',
      messages: [], 
      my_user: '',
      to_user: '',
    }
    this.socket = null;
  }
  componentDidMount() {
    this.setState({
      // account: this.props.match.params.address1,
      to: this.props.match.params.address2
    })
   
    const data = async (contracts, web3) => {
      this.setState({
        contracts, web3
      })
      let that = this;
      await web3.eth.getCoinbase(function (err, result) {
        that.setState({ account: result })
      })
      await contracts.events
        .AddUser(
          {
            filter: { myaddress: `${this.state.account}` },
            fromBlock: 0,
            toBlock: "latest"
          },
          function (error, event) {
            that.setState({
              my_user: event.returnValues.firstname 
            })
          }
        )
        .on("data", function (event) {

        })
        .on("changed", function (event) {
          // remove event from local database
        })
        .on("error", console.error);
      await contracts.events
        .AddUser(
          {
            filter: { myaddress: `${this.state.to}` },
            fromBlock: 0,
            toBlock: "latest"
          },
          function (error, event) {
            that.setState({
              to_user: event.returnValues.firstname 
            })
          }
        )
        .on("data", function (event) {

        })
        .on("changed", function (event) {
          // remove event from local database
        })
        .on("error", console.error);
    };
    getContract(data);
    axios
      .get("http://localhost:4000/chats", {
        add_from: this.props.match.params.address1,
        add_to: this.state.to
      })
      .then(response => {
        let a = response.data.filter(
          dataz =>
            (dataz.add_from === this.props.match.params.address1 &&
              dataz.add_to === this.props.match.params.address2) ||
            (dataz.add_to === this.props.match.params.address1 &&
              dataz.add_from === this.props.match.params.address2)
        );
        // console.log(response.data, a)
        this.setState({ messages: [...this.state.messages, ...a] });
      })
      .catch(function(error) {
        console.log(error);
      });
      axios
        .get("http://localhost:4000/chats", {
          add_from: this.props.match.params.address1,
          add_to: this.props.match.params.address2
        })
        .then(response => {
          // console.log("all" ,response.data);
        })
        .catch(function(error) {
          console.log(error);
        });
    
    window.ethereum.on("accountsChanged", function (accounts) {
      window.location.reload();
    });
    this.socket = io('localhost:4000');
    this.socket.on('newMessage', (response) => { this.newMessage(response) });
  }

  send = () => {
    let obj = {
      from: this.state.my_user,
      to: this.state.to_user,
      add_from: this.state.account,
      add_to: this.state.to,
      massage: this.state.message_to_send
    }
    this.socket.emit('newMessage', obj);
    this.setState({
      message_to_send: ''
    })
  }
  handlesend =(e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }
  newMessage=(m)=> {
    let {account} = this.state;
    // console.log(m.data)
    if ( m.data.add_to == account || m.data.add_from == account) {
       this.setState({ messages: [...this.state.messages, m.data]});
       console.log(m.data)
       if ( this.refs.chat_chat) {
          let chat_chat = this.refs.chat_chat;
          chat_chat.scrollTop = chat_chat.scrollHeight; 
       }
    }
  console.log(account, m.data.add_to,m.data.add_from,account == m.data.to,account == m.data.add_from)
  
  //  if (
  //    m.data.add_to == this.state.account &&
  //    this.props.match.path !== "/chat/:address1/:address2"
  //  ) {
  //    console.log("asdasdasdkhj")
  //    toast.success(`${m.data.from} send you a message!`, {
  //      position: toast.POSITION.TOP_LEFT
  //    });
  //  }
	//  scroll to chat
	
  }
  //Gửi event socket newMessage với dữ liệu là nội dung tin nhắn
  // sendnewMessage(m) {
  //   if (m.value) {
  //     this.socket.emit("newMessage", m.value); 
  //     m.value = "";
  //   }
  // }
  render() {
   let {messages} = this.state 
   console.log(this.props)
    return (
      <div className="chat">
        <ToastContainer />
        <div className="chat-header clearfix">
          <img src={logo} alt="avatar" />
          <div className="chat-about">
            <div className="chat-with">Chat with {this.state.to_user}</div>
            {/* <div className="chat-num-messages">already 1 902 messages</div> */}
          </div>
          <i className="fa fa-star" />
        </div>
        <div className="chat-history" ref="chat_chat">
          <ul>
            {messages.map((element,i) => {
              if (this.state.account === element.add_from) {
                return (
                  <li key={i} className="clearfix">
                    <div className="message-data  align-right">
                      <span className="message-data-time">
                        <Moment format="YYYY/MM/DD HH:mm:ss">
                          {element.created}
                        </Moment>
                      </span>
                      &nbsp; &nbsp;
                      <span className="message-data-name">
                        {this.state.my_user}
                      </span>
                      <i className="fa fa-circle me" />
                    </div>
                    <div className="message  other-message float-right">
                      <span>{element.massage}</span>
                    </div>
                  </li>
                );
              } else {
                return (
                  <li className="clearfix">
                    <div className="message-data">
                      <span className="message-data-time">
                        <Moment format="YYYY/MM/DD HH:mm:ss">
                          {element.created}
                        </Moment>
                      </span>{" "}
                      &nbsp; &nbsp;
                      <span className="message-data-name">
                        {this.state.to_user}
                      </span>
                      <i className="fa fa-circle me" />
                    </div>
                    <div className="message my-message ">
                      <span>{element.massage}</span>
                    </div>
                  </li>
                );
              }
            })}
          </ul>
        </div>
        <div className="chat-message clearfix">
          <textarea
            name="message_to_send"
            id="message-to-send"
            placeholder="Type your message"
            rows={3}
            defaultValue={""}
            onChange={e => this.handlesend(e)}
            value={this.state.message_to_send}
          />
          <i className="fa fa-file-o" /> &nbsp;&nbsp;&nbsp;
          <i className="fa fa-file-image-o" />
          <button onClick={this.send}>Send</button>
        </div>
      </div>
    );
  }
}

export default chat
