
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
import Sidebar from './components/sidebar';

import static_lst from "./static"
import title from './title.png'
import Contour from './components/contour';

function Argsort(array) {
  let arrayObject = array.map((value, index) => { return {value: value, index: index} });
  arrayObject.sort((a, b) => {
      if (a.value < b.value) {
          return -1;
      } else if (a.value > b.value) {
          return 1;
      } else {
          return 0;
      }
  });

  let argIndices = arrayObject.map(data => data.index);

  return argIndices;
}
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
    const from_firebase = true

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
          for (let i = 0; i < 512; i++) {
            elm1 += vt["embedding"][i] * base1[i]
          }
          let elm2 = 0
          for (let i = 0; i < 512; i++) {
            elm2 += vt["embedding"][i] * base2[i]
          }
          vt["posx"] = elm1 / 5
          vt["posy"] = elm2 / 5
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
      x: -10000 - C["posx"],
      y: -10000 - C["posy"],
      scale: 1,
    })
    setTimeout(() => {
      boardRef.current.style.transitionDuration = "0s"
    }, 500)

    //中心キャラの回りに良い感じに配置
    const dists = vectorDistanceMatrix[index]
    const mn_dist=Math.min(...dists.filter((_,i)=>i!=index))

    const argsorted_dists=Argsort(dists)
    for(let i=0;i<argsorted_dists.length;i++){
      const idx=argsorted_dists[i]
      const scale=2000
      const r=(dists[idx] - mn_dist )*scale + 100

      if(i==0){//最も近いのはそれ自身
        continue
      }
      if(i==1){
        let dx=Vtubers[argsorted_dists[i]]["posx"]-C["posx"]
        let dy=Vtubers[argsorted_dists[i]]["posx"]-C["posx"]
        const norm=Math.sqrt(dx**2+dy**2)
        dx/=norm
        dy/=norm

        Vtubers[argsorted_dists[i]]["posx"]=C["posx"]+r*dx
        Vtubers[argsorted_dists[i]]["posy"]=C["posy"]+r*dy
        continue
      }
    

      // if(i>3){
      //   continue
      // }
      const degdiv=360
      let min_s=99999999
      let min_j=0
      for(let j=0;j<degdiv;j++){
        let s=0
        for(let k=0;k<i-1;k++){
          const xk=Vtubers[argsorted_dists[k]]["posx"]
          const yk=Vtubers[argsorted_dists[k]]["posy"]

          const a=Math.sqrt((xk-r*Math.cos(Math.PI*2/degdiv*j))**2+(yk-r*Math.sin(Math.PI*2/degdiv*j))**2)
          const b=(vectorDistanceMatrix[idx][argsorted_dists[k]])*scale
          s+=(a-b)**2
          
          // console.log(
          //   j,
          //   a,
          //   b,
          //   a-b
          //   )
        }
        if(s<min_s){
          min_s=s
          min_j=j
        }
      }
      Vtubers[idx]["posx"]=C["posx"]+r*Math.cos(Math.PI*2/degdiv*min_j)
      Vtubers[idx]["posy"]=C["posy"]+r*Math.sin(Math.PI*2/degdiv*min_j)
    }


  }



  return (
    <div className="App">
      
      <Board
        boardTransform={boardTransform}
        setBoardTransform={setBoardTransform}
        boardRef={boardRef}
      >
        <Contour
          boardTransform={boardTransform}
        ></Contour>
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
      <Sidebar></Sidebar>
      <DetailTab
        data={detailingIndex == undefined ? undefined : Vtubers[detailingIndex]}
      />
      
      <img className="title-image" src={title}></img>
    </div>
  );
}

export default App;
