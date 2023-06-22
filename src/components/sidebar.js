import React, { useEffect, useState } from 'react';
import '../css/sidebar.css';
import '../css/loader.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function Sidebar() {
  const [serverRunning, setServerRunning] = useState(false);

  const requestURL = "http://100.25.201.82:5000/"
  const [sidebar, setSidebar] = useState(false);
  const [url, setUrl] = useState("");
  const [sendLock, setSendLock] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch(requestURL).then((res) => {
      return res.json();
    }).then((data) => {
      setServerRunning(true);
    })
      .catch((err) => {
        setServerRunning(false);
      });
  }, []);



  const toggleSidebar = () => {
    setSidebar(!sidebar);
  };
  const handleSubmit = (e) => {
    setSendLock(true);
    setErrorMessage("");
    e.preventDefault();
    console.log("URL: ", url);
    setUrl("");
    fetch(`${requestURL}/api?url=${url}`).then((res) => {
      return res.json()
    }).then((data) => {
      if (data.status !== 200) {
        if (data.msg) {
          setErrorMessage("error:" + data.msg)
        } else {
          setErrorMessage("error:不明なエラー / ")
        }
      }
      setSendLock(false);
    })
      .catch((err) => {
        console.log(err);
        setErrorMessage(err)
        setSendLock(false);
      });
  };
  if (!serverRunning) {
    return null
  }
  return (
    <div className="sidebar-container">

      <div className={`sidebar ${sidebar ? "show" : ""}`}>
        <h1>配信者を追加する</h1>
        <form onSubmit={handleSubmit}>
          <label>
            動画またはチャンネルのURL:
            <input
              type="url"
              value={url}
              placeholder=''
              onChange={(e) => setUrl(e.target.value)}
            />
          </label>
          {
            errorMessage !== "" &&
            <p className='red'>{errorMessage}</p>
          }
          {
            sendLock ?(
            <div>
              {/* <p>処理中....これには数分かかることがあります。気長にお待ちください</p> */}
              <div class="loader">Loading...</div>
            </div>
            ):(
              <button type="submit" className={sendLock ? "disabledBtn" : "btn"} disabled={sendLock}>送信</button>
            )
          }



        </form>
      </div>
        <button className="toggle-button" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={sidebar ? faTimes : faArrowLeft} />
        </button>
    </div>
  );
}

