
import { useEffect, useState, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";

import { db } from './libs/firebase';

import './css/App.css';

import "tailwindcss/tailwind.css"
import PCA from 'pca-js';

import Board from './components/board';
import Circle from './components/circle';
import DetailTab from './components/detail_tab';
import static_lst from "./static"
import title from './title.png'

function CalcVectorDistanceMatrix(lst) {//lstはデータがすべて入ったやつ
  const DistMatrix = []
  for (let i = 0; i < lst.length; i++) {
    DistMatrix.push([])
    for (let j = 0; j < lst.length; j++) {
      DistMatrix[i].push(0)
    }
  }
  for(let i=0;i<lst.length;i++){
    for(let j=0;j<lst.length;j++){
      for(let k=0;k<lst[i]["embedding"].length;k++){
        DistMatrix[i][j]+=(lst[i]["embedding"][k]-lst[j]["embedding"][k])**2
      }
      DistMatrix[i][j]=DistMatrix[i][j]**0.5
    }
  }
  
  let mx=-1
  for(let i=0;i<lst.length;i++){
    for(let j=0;j<lst.length;j++){
      if(mx<DistMatrix[i][j]){
        mx=DistMatrix[i][j]
      }
    }
  }
  for(let i=0;i<lst.length;i++){
    for(let j=0;j<lst.length;j++){
      DistMatrix[i][j]/=mx
      DistMatrix[i][j]=DistMatrix[i][j]
    }
  }

  return DistMatrix
}

function App() {
  const [Vtubers, setVtubers] = useState([{}])
  const [boardTransform, setBoardTransform] = useState({ x: -10000, y: -10000, scale: 1 })
  const [detailingIndex, setDetailingIndex] = useState(undefined)

  const [vectorDistanceMatrix, setVectorDistanceMatrix] = useState([[]])

  //データのロード
  useEffect(() => {
    const from_firebase = false

    if (from_firebase) {
      const lst = []
      getDocs(collection(db, "vtubers")).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const dic = doc.data()
          dic["id"] = doc.id
          dic["posx"] = dic["embedding"][0]
          dic["posy"] = dic["embedding"][1]
          lst.push(dic)
        });
        setVtubers(lst)

        const embeddingLst = []
        lst.forEach((vt) => {
          embeddingLst.push(vt["embedding"])
        })
        const vectors = PCA.getEigenVectors(embeddingLst);

        const base1 = vectors[0]["vector"]
        const base2 = vectors[1]["vector"]

        lst.forEach((vt) => {
          let elm1 = 0
          for (let i = 0; i < 10; i++) {
            elm1 += vt["embedding"][i] * base1[i]
          }
          let elm2 = 0
          for (let i = 0; i < 10; i++) {
            elm2 += vt["embedding"][i] * base2[i]
          }
          vt["posx"] = elm1 * 3
          vt["posy"] = elm2 * 3
        })

        setVectorDistanceMatrix(CalcVectorDistanceMatrix(lst))
      }).catch((error) => {
        console.log("Error getting documents: ", error);
        window.alert("Firebaseとの接続に失敗しました")
      });
    } else {
      const lst = static_lst
      console.log(lst)
      for (let i = 0; i < lst.length; i++) {
        lst[i]["posx"] = lst[i]["embedding"][0]
        lst[i]["posy"] = lst[i]["embedding"][1]
      }
      setVtubers(lst);

      (async () => {
        const embeddingLst = []
        lst.forEach((vt) => {
          embeddingLst.push(vt["embedding"])
        })

        const vectors = PCA.getEigenVectors(embeddingLst);
        const base1 = vectors[0]["vector"]
        const base2 = vectors[1]["vector"]

        lst.forEach((vt) => {
          let elm1 = 0
          for (let i = 0; i < 10; i++) {
            elm1 += vt["embedding"][i] * base1[i]
          }
          let elm2 = 0
          for (let i = 0; i < 10; i++) {
            elm2 += vt["embedding"][i] * base2[i]
          }
          vt["posx"] = elm1 * 3
          vt["posy"] = elm2 * 3
        })
        setVectorDistanceMatrix(CalcVectorDistanceMatrix(lst))
      })();
    }

  }, [])


  //キャラクタークリック時の処理
  const boardRef = useRef(null)
  const onCircleClick = (index) => {
    setDetailingIndex(index)

    const C = Vtubers[index]//center

    //ボードの真ん中にクリックしたキャラが来るように移動
    boardRef.current.style.transitionDuration = "500ms"
    setBoardTransform({
      x: -10000 - C["posx"] - 150,
      y: -10000 - C["posy"],
      scale: 1,
    })
    setTimeout(() => {
      boardRef.current.style.transitionDuration = "0s"
    }, 500)

    //キャラからの距離がembeddingのcos類似度になるようにスケール
    const dist = vectorDistanceMatrix[index]
    const mn_dist=Math.min(...dist.filter((_,i)=>i!=index))
    console.log(dist)
    console.log(mn_dist)
    for(let i=0;i<dist.length;i++){

      if(i==index){
        continue
      }
      
      const scale=1000
      const r=(dist[i] - mn_dist )*scale + 100

      let dx=Vtubers[i]["posx"]-C["posx"]
      let dy=Vtubers[i]["posy"]-C["posy"]
      const norm=(dx**2+dy**2)**0.5
      dx/=norm
      dy/=norm


      Vtubers[i]["posx"]=C["posx"]+dx*r
      Vtubers[i]["posy"]=C["posy"]+dy*r
    }


  }



  return (
    <div className="App">
      <Board
        boardTransform={boardTransform}
        setBoardTransform={setBoardTransform}
        boardRef={boardRef}
      >
        {
          Vtubers.map((vt, index) => (
            <Circle
              key={index}
              index={index}
              data={vt}

              onCircleClick={onCircleClick}
              boardTransform={boardTransform}
            />
          ))
        }
      </Board>
      <DetailTab
        data={detailingIndex == undefined ? undefined : Vtubers[detailingIndex]}
      />
      <img className="title-image" src={title}></img>
    </div>
  );
}

export default App;
